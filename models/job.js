const sqlForCreate = require("../helpers/create.js");
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
}

module.exports = Job;
