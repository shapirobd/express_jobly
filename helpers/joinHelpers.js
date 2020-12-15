function sqlForGetCompanyJobs(handle) {
	const queryString = `SELECT j.id, j.title, j.salary, j.equity, j.company_handle, j.date_posted FROM jobs AS j LEFT JOIN companies AS c ON j.company_handle=c.handle WHERE j.company_handle=$1`;
	const values = [handle];
	return { queryString, values };
}

module.exports = sqlForGetCompanyJobs;
