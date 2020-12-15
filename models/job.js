const sqlForCreate = require("../helpers/create");
const sqlForGetAll = require("../helpers/jobs/getAll");
const sqlForGetOne = require("../helpers/getOne");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const sqlForDelete = require("../helpers/delete");
const db = require("../db");

class Job {
	constructor(title, salary, equity, comp_handle) {
		this.title = title;
		this.salary = salary;
		this.equity = equity;
		this.comp_handle = comp_handle;
	}

	static async create(data) {
		const query = sqlForCreate("jobs", data);
		const result = await db.query(query["queryString"], query["values"]);
		return result.rows[0];
	}

	static async getAll(filters) {
		console.log("get all");
		const query = sqlForGetAll("jobs", filters);
		console.log(query);
		const result = await db.query(query["queryString"], query["values"]);
		return result.rows;
	}

	// static async getOne(handle) {
	// 	const query = sqlForGetOne("jobs", handle);
	// 	const result = await db.query(query["queryString"], query["values"]);
	// 	return result.rows[0];
	// }

	// static async update(data) {
	// 	const query = sqlForPartialUpdate(data);
	// 	const result = await db.query(query["queryString"], query["values"]);
	// 	return result.rows[0];
	// }

	// static async delete(handle) {
	// 	const query = sqlForDelete(handle);
	// 	const result = await db.query(query["queryString"], query["values"]);
	// 	return result.rows[0];
	// }
}

module.exports = Job;
