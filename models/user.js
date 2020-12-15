const sqlForCreate = require("../helpers/create");
const sqlForGetAll = require("../helpers/jobs/getAll");
const sqlForGetOne = require("../helpers/getOne");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const sqlForDelete = require("../helpers/delete");
const db = require("../db");
const ExpressError = require("../helpers/expressError");

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

	static async register(data) {
		const query = sqlForCreate("users", data);
		const result = await db.query(query["queryString"], query["values"]);
		return result.rows[0];
	}

	static async getAll() {
		const result = await db.query(
			`SELECT username, first_name, last_name email FROM users`
		);
		return result.rows;
	}

	// static async getOne(username) {

	// }

	// static async partialUpdate(username, data) {

	// }

	// static async delete(username) {

	// }
}

module.exports = User;
