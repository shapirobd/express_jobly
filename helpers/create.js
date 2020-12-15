function sqlForCreate(table, items) {
	console.log("FOUND!!");
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
	const queryString = `
    INSERT INTO ${table} (${cols})
    VALUES (${idxs})
    RETURNING ${cols}
    `;
	console.log(queryString);
	return { queryString, values };
}

module.exports = sqlForCreate;
