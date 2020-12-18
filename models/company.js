const db = require("../db");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const sqlForGetAllCompanies = require("../helpers/companies/getAll");
const { sqlForGetCompany } = require("../helpers/joinHelpers");
const sqlForCreate = require("../helpers/create");
const checkForNoResults = require("../helpers/errorHelpers");

// Company model with methods to query company details from db
class Company {
	constructor(data) {
		const { handle, name, num_employees, description, logo_url } = data;
		this.handle = handle;
		this.name = name;
		this.num_employees = num_employees;
		this.description = description;
		this.logo_url = logo_url;
	}

	// Gets all companies from the databse
	// uses sqlForGetAllCompanies to generate the correct select query based on search, min_employees and max_employees
	// returns an array of company objects - [{company1}, {company2}, etc.]
	static async getAll(filters) {
		const query = sqlForGetAllCompanies(filters);
		const results = await db.query(query["queryString"], query["values"]);
		return results.rows;
	}

	// Creates a new company and puts it into the database
	// uses sqlForCreate to generate the correct insert query based on data
	// returns an object containing the company's details - {handle: handle, etc.}
	static async create(data) {
		const query = sqlForCreate("companies", data);
		const results = await db.query(query["queryString"], query["values"]);
		return results.rows[0];
	}

	// Gets a company from the database by its handle
	// uses sqlForGetCompany to generate the select query
	// returns an object containing the company's details and associated jobs - {...companyData, jobs: [{job1}, {job2}, etc.]}
	static async getByHandle(handle) {
		const query = sqlForGetCompany(handle);
		const results = await db.query(query["queryString"], query["values"]);
		checkForNoResults("Company", results);
		if (results.rows[0].jobs.length === 1 && results.rows[0].jobs[0] === null) {
			results.rows[0].jobs = [];
		}
		return results.rows[0];
	}

	// Updates a company from the database by its handle
	// uses sqlForPartialUpdate to generate the correct update query based on the properties in data and handle itself
	// returns an object containing the company's details - {handle: handle, etc.}
	static async update(handle, data) {
		const query = sqlForPartialUpdate("companies", data, "handle", handle);
		const results = await db.query(query["queryString"], query["values"]);
		checkForNoResults("Company", results);
		return results.rows[0];
	}

	// Deletes a company from the database by its handle
	// this query is short & consistent enough to not require a separate function to generate it
	// returns nothing
	static async delete(handle) {
		const results = await db.query(
			`DELETE FROM companies WHERE handle=$1 RETURNING *`,
			[handle]
		);
		checkForNoResults("Company", results);
	}
}

module.exports = Company;
