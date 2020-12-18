// generates a SQL query to create & insert an item into the database.
// table: the table to insert into
// items: an object containing column names and values that will be used to create the new item
function sqlForCreate(table, items) {
	let idx = 1;
	let values = [];
	let columns = [];
	let indecies = [];
	for (let column in items) {
		values.push(items[column]);
		columns.push(`${column}`);
		indecies.push(`$${idx}`);
		idx += 1;
	}
	const cols = columns.join(", ");
	const idxs = indecies.join(", ");
	const queryString = `INSERT INTO ${table} (${cols}) VALUES (${idxs}) RETURNING ${cols}`;
	return { queryString, values };
}

module.exports = sqlForCreate;
