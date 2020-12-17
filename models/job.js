const sqlForCreate = require("../helpers/create");
const sqlForGetAllJobs = require("../helpers/jobs/getAll");
const sqlForGetOne = require("../helpers/getOne");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const db = require("../db");
const { getJobCompany } = require("../helpers/joinHelpers");
const checkForNoResults = require("../helpers/errorHelpers");

// Job model with methods to query job details from db
class Job {
	constructor(items) {
		const { title, salary, equity, comp_handle } = items;
		this.title = title;
		this.salary = salary;
		this.equity = equity;
		this.comp_handle = comp_handle;
	}

	// Creates a new job and puts it into the database
	// uses sqlForCreate to generate the correct insert query based on data
	// returns an object containing the job's details - {id: id, etc.}
	static async create(data) {
		const query = sqlForCreate("jobs", data);
		const result = await db.query(query["queryString"], query["values"]);
		return result.rows[0];
	}

	// Gets all jobs from the databse
	// uses sqlForGetAllJobs to generate the correct select query based on search, min_salary and min_equity
	// returns an array of job objects - [{job1}, {job2}, etc.]
	static async getAll(filters) {
		const query = sqlForGetAllJobs("jobs", filters);
		const results = await db.query(query["queryString"], query["values"]);
		return results.rows;
	}

	// Gets a job from the database by its id
	// uses sqlForGetOne to generate the correct select query based on the table name, key of "id" and id itself
	// returns an object containing the job's details and associated company - {...jobData, company: {companyData}}
	static async getById(id) {
		const jobQuery = sqlForGetOne("jobs", "id", id);
		const jobResults = await db.query(
			jobQuery["queryString"],
			jobQuery["values"]
		);
		checkForNoResults("Job", jobResults);
		const job = jobResults.rows[0];
		job.company = await getJobCompany(job.company_handle);
		delete job.company_handle;
		return job;
	}

	// Updates a job from the database by its id
	// uses sqlForPartialUpdate to generate the correct update query based on the properties in data and handle itself
	// returns an object containing the job's details - {handle: handle, etc.}
	static async update(id, data) {
		const query = sqlForPartialUpdate("jobs", data, "id", id);
		const results = await db.query(query["queryString"], query["values"]);
		checkForNoResults("Job", results);
		return results.rows[0];
	}

	// Deletes a job from the database by its id
	// this query is short & consistent enough to not require a separate function to generate it
	// returns nothing
	static async delete(id) {
		const results = await db.query(`DELETE FROM jobs WHERE id=$1 RETURNING *`, [
			id,
		]);
		checkForNoResults("Job", results);
		return result.rows[0];
	}
}

module.exports = Job;
