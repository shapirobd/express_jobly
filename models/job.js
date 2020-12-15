const sqlForCreate = require("../helpers/create");
const sqlForGetAll = require("../helpers/jobs/getAll");
const sqlForGetOne = require("../helpers/getOne");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const sqlForDelete = require("../helpers/delete");
const db = require("../db");
const ExpressError = require("../helpers/expressError");

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
		const query = sqlForGetAll("jobs", filters);
		const result = await db.query(query["queryString"], query["values"]);
		return result.rows;
	}

	static async getOne(id) {
		const jobQuery = sqlForGetOne("jobs", "id", id);
		const jobResult = await db.query(
			jobQuery["queryString"],
			jobQuery["values"]
		);
		if (jobResult.rows.length === 0) {
			throw new ExpressError("Job not found.", 404);
		}
		const job = jobResult.rows[0];
		const companyQuery = sqlForGetOne(
			"companies",
			"handle",
			job.company_handle
		);
		const companyResult = await db.query(
			companyQuery["queryString"],
			companyQuery["values"]
		);
		delete job.company_handle;
		job.company = companyResult.rows[0];
		return job;
	}

	static async partialUpdate(id, data) {
		const query = sqlForPartialUpdate("jobs", data, "id", id);
		const result = await db.query(query["query"], query["values"]);
		if (result.rows.length === 0) {
			throw new ExpressError("Job not found.", 404);
		}
		return result.rows[0];
	}

	static async delete(id) {
		const query = sqlForDelete("jobs", "id", id);
		const result = await db.query(query["queryString"], query["values"]);
		if (result.rows.length === 0) {
			throw new ExpressError("Job not found.", 404);
		}
		return result.rows[0];
	}
}

module.exports = Job;
