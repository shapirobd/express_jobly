const db = require("../db");
const sqlForGetOne = require("./getOne");

// generates a SQL query to find an item from a given table in the database.
// handle: the value used to identify a specific company
function sqlForGetCompanyJobs(handle) {
	const queryString = `SELECT j.id, j.title, j.salary, j.equity, j.company_handle, j.date_posted FROM jobs AS j LEFT JOIN companies AS c ON j.company_handle=c.handle WHERE j.company_handle=$1`;
	const values = [handle];
	return { queryString, values };
}

// uses query created by sqlForGetCompanyJobs to get filtered jobs from the database based on the handle associated with a company
// handle: the value used to identify a specific company
async function getCompanyJobs(handle) {
	const jobsQuery = sqlForGetCompanyJobs(handle);
	const jobsResults = await db.query(
		jobsQuery["queryString"],
		jobsQuery["values"]
	);
	return jobsResults.rows;
}

// uses query created by sqlForGetOne to get a specific company from the database based on the company_handle associated with a job
// handle: the value used to identify a specific company
async function getJobCompany(handle) {
	const companyQuery = sqlForGetOne("companies", "handle", handle);
	const companyResults = await db.query(
		companyQuery["queryString"],
		companyQuery["values"]
	);
	return companyResults.rows[0];
}

module.exports = { getCompanyJobs, getJobCompany };
