/**
 * Generate a select all query based on a request body:
 *
 * - table: where to make the query
 *
 * Returns object containing a DB query as a string, and array of
 * string values to be updated
 *
 */

function sqlForGetAllCompanies(table, filters) {
	// build query
	checkMinLessThanMax(filters.min, filters.max);
	let idx = 1;
	let nameQuery = generateNameQuery(filters, idx);
	if (nameQuery !== "") {
		idx++;
	}
	let employeesQuery = generateEmployeeQuery(filters, idx, nameQuery);
	let queryString = `SELECT handle, name FROM ${table} ${nameQuery} ${employeesQuery}`;

	removeUndefinedFilters(filters);
	let values = Object.values(filters);
	return { queryString, values };
}

function checkMinLessThanMax(min, max) {
	if (min_employees > max_employees) {
		throw new ExpressError(
			"min_employees must be less than max_employees",
			400
		);
	}
}

function removeUndefinedFilters(filters) {
	for (let key in filters) {
		if (!filters[key]) {
			delete filters[key];
		}
	}
}

function generateNameQuery(filters, idx) {
	if (filters["search"]) {
		return `WHERE name=$${idx} OR handle=$${idx}`;
	}
	return "";
}

function handleMinMax(filters, idx) {
	if (
		Number.isInteger(parseInt(filters.min)) &&
		Number.isInteger(parseInt(filters.max))
	) {
		return generateMinMaxQuery(idx);
	} else if (
		Number.isInteger(parseInt(filters.min)) &&
		!Number.isInteger(parseInt(filters.max))
	) {
		return generateMinQuery(idx);
	} else if (
		!Number.isInteger(parseInt(filters.min)) &&
		Number.isInteger(parseInt(filters.max))
	) {
		return generateMaxQuery(idx);
	}
	return "";
}

function generateEmployeeQuery(filters, idx, nameQuery) {
	let employeesQuery = handleMinMax(filters, idx);
	if (nameQuery === "" && employeesQuery !== "") {
		employeesQuery = "WHERE" + employeesQuery.slice(3);
	}
	return employeesQuery;
}

function generateMinMaxQuery(idx) {
	return `AND num_employees > $${idx} AND num_employees < $${idx + 1}`;
}

function generateMinQuery(idx) {
	return `AND num_employees > $${idx}`;
}

function generateMaxQuery(idx) {
	return `AND num_employees < $${idx}`;
}

module.exports = sqlForGetAllCompanies;
