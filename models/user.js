const sqlForCreate = require("../helpers/create");
const sqlForGetOne = require("../helpers/getOne");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const db = require("../db");
const ExpressError = require("../helpers/expressError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config");

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

	static async login(data) {
		const { username, password } = data;
		const result = await db.query(
			`SELECT username, password, is_admin FROM users WHERE username=$1`,
			[username]
		);
		const user = result.rows[0];
		let token;
		if (user) {
			if (await bcrypt.compare(password, user.password)) {
				let token = jwt.sign({ username, is_admin: user.is_admin }, SECRET_KEY);
				return token;
			}
		}
		throw new ExpressError("Incorrect username/password", 400);
	}

	static async register(data) {
		const { username, password } = data;
		data.password = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
		const query = sqlForCreate("users", data);
		const result = await db.query(query["queryString"], query["values"]);
		const user = result.rows[0];
		let token = jwt.sign({ username, is_admin: user.is_admin }, SECRET_KEY);
		return token;
	}

	static async getAll() {
		const result = await db.query(
			`SELECT username, first_name, last_name, email FROM users`
		);
		return result.rows;
	}

	static async getOne(username) {
		const query = sqlForGetOne("users", "username", username);
		const result = await db.query(query["queryString"], query["values"]);
		if (result.rows.length === 0) {
			throw new ExpressError("User not found.", 404);
		}
		delete result.rows[0].password;
		return result.rows[0];
	}

	static async partialUpdate(username, data) {
		const query = sqlForPartialUpdate("users", data, "username", username);
		const result = await db.query(query["query"], query["values"]);
		if (result.rows.length === 0) {
			throw new ExpressError("User not found.", 404);
		}
		delete result.rows[0].password;
		return result.rows[0];
	}

	static async delete(username) {
		const result = await db.query(
			`DELETE FROM users WHERE username=$1 RETURNING *`,
			[username]
		);
		if (result.rows.length === 0) {
			throw new ExpressError("User not found.", 404);
		}
	}
}

module.exports = User;
