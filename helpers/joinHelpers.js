const db = require("../db");

function sqlForGetCompanyJobs(handle) {
	const queryString = `SELECT j.id, j.title, j.salary, j.equity, j.company_handle, j.date_posted FROM jobs AS j LEFT JOIN companies AS c ON j.company_handle=c.handle WHERE j.company_handle=$1`;
	const values = [handle];
	return { queryString, values };
}

async function getCompanyJobs(handle) {
	const jobsQuery = sqlForGetCompanyJobs(handle);
	const jobsResults = await db.query(
		jobsQuery["queryString"],
		jobsQuery["values"]
	);
	return jobsResults.rows;
}

async function getJobCompany(handle) {
	const companyQuery = sqlForGetOne("companies", "handle", handle);
	const companyResults = await db.query(
		companyQuery["queryString"],
		companyQuery["values"]
	);
	return companyResults.rows[0];
}

module.exports = { getCompanyJobs, getJobCompany };
