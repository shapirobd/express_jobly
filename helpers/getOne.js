// generates a SQL query to find an item from a given table in the database.
// table: the name of the table to select from
// key: the column name that is used to identify a specific item in the table
// id: the value to be passed as the key
function sqlForGetOne(table, key, id) {
	const queryString = `SELECT * FROM ${table} WHERE ${key}=$1`;
	const values = [id];
	return { queryString, values };
}

module.exports = sqlForGetOne;
