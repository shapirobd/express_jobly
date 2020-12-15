function sqlForGetOne(table, idTerm, id) {
	const queryString = `SELECT * FROM ${table} WHERE ${idTerm}=$1`;
	const values = [id];
	return { queryString, values };
}

module.exports = sqlForGetOne;
