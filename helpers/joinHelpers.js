// generates a SQL query to find an item from a given table in the database.
// handle: the value used to identify a specific company
function sqlForGetCompany(handle) {
	const queryString = `SELECT c.*, json_agg(j.*) AS jobs FROM companies AS c LEFT JOIN jobs AS j ON j.company_handle=c.handle WHERE c.handle=$1 GROUP BY c.handle`;
	const values = [handle];
	return { queryString, values };
}

function sqlForGetJob(id) {
	const queryString = `SELECT j.*, to_json(c.*) AS company FROM jobs AS j JOIN companies AS c ON j.company_handle=c.handle WHERE j.id=$1 GROUP BY j.id, c.handle`;
	const values = [id];
	return { queryString, values };
}

//u.username, u.first_name, u.last_name, u.email, u.photo_url, u.is_admin, a.job_id, a.state, a.created_at
function sqlForGetUser(username) {
	const queryString = `SELECT u.*, json_agg(a.*) AS applications FROM applications AS a LEFT JOIN users AS u ON a.username = u.username WHERE a.username=$1 GROUP BY u.username`;
	const values = [username];
	return { queryString, values };
}

function sqlForMatchJobs(username, technologies) {
	const queryString = `SELECT json_agg(j.*) AS jobs FROM jobs AS j LEFT JOIN technologies AS t ON j.id=t.job_id LEFT JOIN users AS u ON u.username=t.username WHERE t.username=$1 AND t.technology= ANY($2)`;
	const values = [username, technologies];
	return { queryString, values };
}

module.exports = {
	sqlForGetCompany,
	sqlForGetJob,
	sqlForGetUser,
	sqlForMatchJobs,
};
