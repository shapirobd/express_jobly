const sqlForCreate = require("../helpers/create");
const { sqlForGetUser } = require("../helpers/joinHelpers");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const db = require("../db");
const ExpressError = require("../helpers/expressError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config");
const checkForNoResults = require("../helpers/errorHelpers");
const generateLoginToken = require("../helpers/generateLoginToken");

// User model with methods to query user details from db
class User {
	constructor(
		username,
		password,
		first_name,
		last_name,
		email,
		photo_url,
		is_admin
	) {
		this.username = username;
		this.password = password;
		this.first_name = first_name;
		this.last_name = last_name;
		this.email = email;
		this.photo_url = photo_url;
		this.is_admin = is_admin;
	}

	// Authenticates a user and returns a JSON Web Token which contains a payload with the username and is_admin values.
	// this query is short & consistent enough to not require a separate function to generate it
	// returns JSON: {token: token}
	static async login(data) {
		const { username, password } = data;
		const result = await db.query(
			`SELECT username, password, is_admin FROM users WHERE username=$1`,
			[username]
		);
		const user = result.rows[0];
		if (user) {
			let token = await generateLoginToken(user, password);
			return token;
		}
		throw new ExpressError("Incorrect username/password", 400);
	}

	// Creates (registers) a new user and puts it into the database
	// uses sqlForCreate to generate the correct insert query based on data
	// returns a token associated with the user and their privileges
	static async register(data) {
		const { username, password } = data;
		data.password = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
		const query = sqlForCreate("users", data);
		const results = await db.query(query["queryString"], query["values"]);
		const user = results.rows[0];
		let token = jwt.sign({ username, is_admin: user.is_admin }, SECRET_KEY);
		return token;
	}

	// Gets all users from the databse
	// this query is short & consistent enough to not require a separate function to generate it
	// returns an array of user objects - [{user1}, {user2}, etc.]
	static async getAll() {
		const results = await db.query(
			`SELECT username, first_name, last_name, email FROM users`
		);
		return results.rows;
	}

	// Gets a user from the database by its username
	// uses sqlForGetOne to generate the correct select query based on the table name, key of "username" and username itself
	// returns an object containing the users's details (excpet for password) - {username: username, etc.}
	static async getByUsername(username) {
		console.log(username);
		const query = sqlForGetUser(username);
		console.log(query);
		const results = await db.query(query["queryString"], query["values"]);
		checkForNoResults("User", results);
		console.log(results.rows);
		delete results.rows[0].password;
		return results.rows[0];
	}

	// Updates a user from the database by its username
	// uses sqlForPartialUpdate to generate the correct update query based on the properties in data and username itself
	// returns an object containing the user's details (except for password) - {username: username, etc.}
	static async update(username, data) {
		const query = sqlForPartialUpdate("users", data, "username", username);
		const results = await db.query(query["queryString"], query["values"]);
		checkForNoResults("User", results);
		delete results.rows[0].password;
		return results.rows[0];
	}

	// Deletes a user from the database by its username
	// this query is short & consistent enough to not require a separate function to generate it
	// returns nothing
	static async delete(username) {
		const results = await db.query(
			`DELETE FROM users WHERE username=$1 RETURNING *`,
			[username]
		);
		checkForNoResults("User", results);
	}
}

module.exports = User;
