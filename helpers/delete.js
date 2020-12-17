function sqlForDelete(table, key, id) {
	// build query
	let queryString = `DELETE FROM ${table} WHERE ${key}=$1 RETURNING *`;
	let values = [id];

	return { queryString, values };
}

module.exports = sqlForDelete;
