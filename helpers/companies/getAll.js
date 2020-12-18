/**
 * Generate a select all query for the companies table:
 *
 * - filters: object containing all/some/none of the following:
 * --- search: name/handle of company
 * --- min_employees: number that num_employees of selected jobs must be greater than
 * --- max_employees: number that num_employees of selected jobs must be less than
 *
 * Returns object containing a DB query as a string, and array of
 * string values to be updated
 *
 */

function sqlForGetAllCompanies(filters) {
	checkMinLessThanMax(filters.min_employees, filters.max_employees);
	let idx = 1;
	let nameQuery = generateNameQuery(filters, idx);
	if (nameQuery !== "") {
		idx++;
	}
	let employeesQuery = generateEmployeeQuery(filters, idx, nameQuery);
	let queryString = `SELECT handle, name FROM companies${nameQuery}${employeesQuery}`;
	removeUndefinedFilters(filters);
	let values = Object.values(filters);
	return { queryString, values };
}

function checkMinLessThanMax(min, max) {
	if (min > max) {
		throw new ExpressError(
			"min_employees must be less than max_employees",
			400
		);
	}
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
function generateNameQuery(filters, idx) {
	if (filters.search) {
		return ` WHERE name=$${idx} OR handle=$${idx}`;
	}
	return "";
}

// if min_employees & max_employees are both ints: generates the min+max query substring
// if ONLY min_employees is an int: generates the min query substring
// if ONLY max_employees is an int: generates the max query substring
// if neither are ints: makes the substring = ""
function handleMinMax(filters, idx) {
	if (
		Number.isInteger(parseInt(filters.min_employees)) &&
		Number.isInteger(parseInt(filters.max_employees))
	) {
		return generateMinMaxQuery(idx);
	} else if (
		Number.isInteger(parseInt(filters.min_employees)) &&
		!Number.isInteger(parseInt(filters.max_employees))
	) {
		return generateMinQuery(idx);
	} else if (
		!Number.isInteger(parseInt(filters.min_employees)) &&
		Number.isInteger(parseInt(filters.max_employees))
	) {
		return generateMaxQuery(idx);
	}
	return "";
}

// combines the employee query substring based on what other filters were passed into the route
function generateEmployeeQuery(filters, idx, nameQuery) {
	let employeesQuery = handleMinMax(filters, idx);
	if (nameQuery === "" && employeesQuery !== "") {
		employeesQuery = " WHERE" + employeesQuery.slice(4);
	}
	return employeesQuery;
}

// generates substring to be added to the queryString to filter companies with num_employees > min_employees & num_employees < max_employees
function generateMinMaxQuery(idx) {
	return ` AND num_employees > $${idx} AND num_employees < $${idx + 1}`;
}

// generates substring to be added to the queryString to filter companies with num_employees > min_employees
function generateMinQuery(idx) {
	return ` AND num_employees > $${idx}`;
}

// generates substring to be added to the queryString to filter companies with num_employees < max_employees
function generateMaxQuery(idx) {
	return ` AND num_employees < $${idx}`;
}

module.exports = sqlForGetAllCompanies;
