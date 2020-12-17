const ExpressError = require("./expressError");

function checkForNoResults(itemName, results) {
	if (results.rows.length === 0) {
		throw new ExpressError(`${itemName} not found.`, 404);
	}
}

module.exports = checkForNoResults;
