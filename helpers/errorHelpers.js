const ExpressError = require("./expressError");

// throws an error if no results were found from a query
// itemName: string that describes the type of item that couldn't be found (e.g., "User")
// results: an object containing an array of users/companies/job objects - if no objects in the array, throw 404 error
function checkForNoResults(itemName, results) {
	if (results.rows.length === 0) {
		throw new ExpressError(`${itemName} not found.`, 404);
	}
}

module.exports = checkForNoResults;
