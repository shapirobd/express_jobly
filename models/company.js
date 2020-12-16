const db = require("../db");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const sqlForGetAllCompanies = require("../helpers/companies/getAll");
const sqlForGetCompanyJobs = require("../helpers/joinHelpers");
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
		const query = sqlForGetAllCompanies("companies", {
			search: search,
			min: min_employees,
			max: max_employees,
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
		const companyQuery = sqlForGetOne("companies", "handle", handle);
		const companyResults = await db.query(
			companyQuery["queryString"],
			companyQuery["values"]
		);
		if (companyResults.rows.length === 0) {
			throw new ExpressError("Company not found.", 404);
		}
		const company = companyResults.rows[0];
		const jobsQuery = sqlForGetCompanyJobs(handle);
		const jobsResults = await db.query(
			jobsQuery["queryString"],
			jobsQuery["values"]
		);
		console.log(jobsResults.rows);
		company.jobs = jobsResults.rows;
		return company;
	}

	static async updateOne(items, handle) {
		const query = sqlForPartialUpdate("companies", items, "handle", handle);
		const results = await db.query(query["query"], query["values"]);
		if (results.rows.length === 0) {
			throw new ExpressError("Company not found.", 404);
		}
		return results.rows[0];
	}

	static async delete(handle) {
		const results = await db.query(
			`DELETE FROM companies WHERE handle=$1 RETURNING *`,
			[handle]
		);
		if (results.rows.length === 0) {
			throw new ExpressError("Company not found.", 404);
		}
	}
}

module.exports = Company;
