function sqlForGetAllJobs(table, filters) {
	// build query
	let idx = 1;
	let titleQuery = generateTitleQuery(filters, idx);
	idx = incrementIfNotEmpty(titleQuery, idx);
	if (idx === 2) {
		filters["search"] = `%${filters["search"]}%`;
	}
	let minSalaryQuery = generateMinSalaryQuery(filters, idx, titleQuery);
	idx = incrementIfNotEmpty(minSalaryQuery, idx);

	let minEquityQuery = generateMinEquityQuery(
		filters,
		idx,
		titleQuery,
		minSalaryQuery
	);

	let queryString = `SELECT title, company_handle FROM ${table} ${titleQuery} ${minSalaryQuery} ${minEquityQuery} ORDER BY date_posted DESC`;
	removeUndefinedFilters(filters);
	let values = Object.values(filters);
	return { queryString, values };
}

function incrementIfNotEmpty(query, idx) {
	if (query !== "") {
		idx++;
		return idx;
	}
	return idx;
}

function removeUndefinedFilters(filters) {
	for (let key in filters) {
		if (!filters[key]) {
			delete filters[key];
		}
	}
}

function generateTitleQuery(filters, idx) {
	if (filters["search"]) {
		return `WHERE title ilike $${idx}`;
	}
	return "";
}

function handleMinSalary(filters, idx) {
	if (Number.isInteger(parseInt(filters["min_salary"]))) {
		return minSalarySubstring(idx);
	}
	return "";
}

function handleMinEquity(filters, idx) {
	if (Number.isInteger(parseInt(filters["min_equity"]))) {
		return minEquitySubstring(idx);
	}
	return "";
}

function generateMinSalaryQuery(filters, idx, titleQuery) {
	let minSalaryQuery = handleMinSalary(filters, idx);
	if (titleQuery === "" && minSalaryQuery !== "") {
		minSalaryQuery = "WHERE" + minSalaryQuery.slice(3);
	}
	return minSalaryQuery;
}

function generateMinEquityQuery(filters, idx, titleQuery, minSalaryQuery) {
	let minEquityQuery = handleMinEquity(filters, idx);
	if (titleQuery === "" && minSalaryQuery === "" && minEquityQuery !== "") {
		minEquityQuery = "WHERE" + minEquityQuery.slice(3);
	}
	return minEquityQuery;
}

function minSalarySubstring(idx) {
	return `AND salary > $${idx}`;
}

function minEquitySubstring(idx) {
	return `AND equity > $${idx}`;
}

module.exports = sqlForGetAllJobs;
