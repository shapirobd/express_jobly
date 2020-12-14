/**
 * Generate a select all query based on a request body:
 *
 * - table: where to make the query
 *
 * Returns object containing a DB query as a string, and array of
 * string values to be updated
 *
 */

function sqlForGetAll(table, filters) {
	// build query
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
		Number.isInteger(parseInt(filters["min"])) &&
		Number.isInteger(parseInt(filters["max"]))
	) {
		return generateMinMaxQuery(idx);
	} else if (
		Number.isInteger(parseInt(filters["min"])) &&
		!Number.isInteger(parseInt(filters["max"]))
	) {
		return generateMinQuery(idx);
	} else if (
		!Number.isInteger(parseInt(filters["min"])) &&
		Number.isInteger(parseInt(filters["max"]))
	) {
		return generateMaxQuery(idx);
	}
	return "";
}

function generateEmployeeQuery(filters, idx, nameQuery) {
	let employeesQuery = handleMinMax(filters, idx);
	if (nameQuery === "" && employeesQuery !== "") {
		employeesQuery = employeesQuery.slice(3);
		employeesQuery = "WHERE" + employeesQuery;
	}
	return employeesQuery;
}

function generateMinMaxQuery(idx) {
	return `AND num_employees >= $${idx} AND num_employees <= $${idx + 1}`;
}

function generateMinQuery(idx) {
	return `AND num_employees >= $${idx}`;
}

function generateMaxQuery(idx) {
	return `AND num_employees <= $${idx}`;
}

module.exports = sqlForGetAll;
