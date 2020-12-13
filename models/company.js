const db = require("../db");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const sqlForGetAll = require("../helpers/getAll");
const sqlForCreate = require("../helpers/create");
const sqlForGetOne = require("../helpers/getOne");
const ExpressError = require("../helpers/expressError");

class Company {
	constructor(items) {
		const { handle, name, num_employees, description, logo_url } = items;
		this.handle = handle;
		this.name = name;
		this.num_employees = num_employees;
		this.description = description;
		this.logo_url = logo_url;
	}

	static async getAll(search, min_employees, max_employees) {
		if (min_employees > max_employees) {
			throw new ExpressError(
				"min_employees must be less than max_employees",
				400
			);
		}
		const query = sqlForGetAll("companies", {
			search: search,
			min_employees: min_employees,
			max_employees: max_employees,
		});
		const results = await db.query(query["queryString"], query["values"]);
		return results.rows;
	}

	static async create(items) {
		const query = sqlForCreate("companies", items);
		const results = await db.query(query["queryString"], query["values"]);
		return results.rows[0];
	}

	static async getByHandle(handle) {
		const query = sqlForGetOne("companies", "handle", handle);
		const results = await db.query(query["queryString"], query["values"]);
		if (results.rows.length === 0) {
			throw new ExpressError("Company not found.", 404);
		}
		return results.rows[0];
	}

	static async updateOne(items, handle) {
		const query = sqlForPartialUpdate("companies", items, "handle", handle);
		const results = await db.query(query["query"], query["values"]);
		if (results.rows.length === 0) {
			throw new ExpressError("Company not found.", 404);
		}
		return results.rows[0];
	}
}

module.exports = Company;
