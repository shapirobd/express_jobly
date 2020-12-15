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
	const queryString = `
    INSERT INTO ${table} (${cols})
    VALUES (${idxs})
    RETURNING ${cols}
    `;
	return { queryString, values };
}

module.exports = sqlForCreate;
