/**
 * Generate a selective update query based on a request body:
 *
 * - table: where to make the query
 * - key: the column that we query by (e.g. username, handle, id)
 * - id: current record ID
 *
 * Returns object containing a DB query as a string, and array of
 * string values to be updated
 *
 */

function sqlForDelete(table, key, id) {
	// build query
	let queryString = `DELETE FROM ${table} WHERE ${key}=$1 RETURNING *`;
	let values = [id];

	return { queryString, values };
}

module.exports = sqlForDelete;
