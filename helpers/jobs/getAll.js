/**
 * Generate a select all query for the jobs table:
 *
 * - filters: object containing all/some/none of the following:
 * --- search: title of job
 * --- min_equity: number that equity of selected jobs must be greater than
 * --- min_salary: number that salary of selected jobs must be greater than
 *
 * Returns object containing a DB query as a string, and array of
 * string values to be updated
 *
 */
function sqlForGetAllJobs(filters) {
	let idx = 1;
	let titleQuery = generateTitleQuery(filters, idx);
	console.log("TITLE QUERY:", titleQuery);
	idx = incrementIfNotEmpty(titleQuery, idx);
	if (idx === 2) {
		filters.search = `%${filters.search}%`;
	}
	let minSalaryQuery = generateMinSalaryQuery(filters, idx, titleQuery);
	idx = incrementIfNotEmpty(minSalaryQuery, idx);

	let minEquityQuery = generateMinEquityQuery(
		filters,
		idx,
		titleQuery,
		minSalaryQuery
	);
	let queryString = `SELECT title, company_handle FROM jobs ${titleQuery} ${minSalaryQuery} ${minEquityQuery} ORDER BY date_posted DESC`;
	removeUndefinedFilters(filters);
	let values = Object.values(filters);
	return { queryString, values };
}

// if a query substring returns anything other than "", increment idx
function incrementIfNotEmpty(query, idx) {
	if (query !== "") {
		idx++;
		return idx;
	}
	return idx;
}

// if any items within the filters object are undefined, remove them
function removeUndefinedFilters(filters) {
	for (let key in filters) {
		if (!filters[key]) {
			delete filters[key];
		}
	}
}

// if filters.search is defined: generates the search substring
// if filters.search not defined: makes the substring = ""
function generateTitleQuery(filters, idx) {
	if (filters.search) {
		return `WHERE title ilike $${idx}`;
	}
	return "";
}

// if min_salary is a float: generates the min_salary substring
// if min_salary not a float: makes the substring = ""
function handleMinSalary(filters, idx) {
	if (parseFloat(filters.min_salary)) {
		return minSalarySubstring(idx);
	}
	return "";
}

// if min_equity is a float: generates the minEquity substring
// if min_equity not a float: makes the substring = ""
function handleMinEquity(filters, idx) {
	if (parseFloat(filters.min_equity)) {
		return minEquitySubstring(idx);
	}
	return "";
}

// modifies the minSalary query substring based on what other filters were passed into the route
function generateMinSalaryQuery(filters, idx, titleQuery) {
	let minSalaryQuery = handleMinSalary(filters, idx);
	console.log("****", minSalaryQuery);
	if (titleQuery === "" && minSalaryQuery !== "") {
		minSalaryQuery = "WHERE" + minSalaryQuery.slice(3);
	}
	return minSalaryQuery;
}

// modifies the minEquity query substring based on what other filters were passed into the route
function generateMinEquityQuery(filters, idx, titleQuery, minSalaryQuery) {
	let minEquityQuery = handleMinEquity(filters, idx);
	if (titleQuery === "" && minSalaryQuery === "" && minEquityQuery !== "") {
		minEquityQuery = "WHERE" + minEquityQuery.slice(3);
	}
	return minEquityQuery;
}

// generates substring to be added to the queryString to filter jobs with salary > min_salary
function minSalarySubstring(idx) {
	return `AND salary > $${idx}`;
}

// generates substring to be added to the queryString to filter jobs with equity > min_equity
function minEquitySubstring(idx) {
	return `AND equity > $${idx}`;
}

module.exports = sqlForGetAllJobs;
