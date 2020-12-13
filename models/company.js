const db = require("../db");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const sqlForGetAll = require("../helpers/getAll");
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
		const queryString = sqlForGetAll("companies", {
			search: search,
			min_employees: min_employees,
			max_employees: max_employees,
		});
		console.log(queryString);
		const results = await db.query(queryString["query"], queryString["values"]);
		return results.rows;
	}
}

module.exports = Company;
