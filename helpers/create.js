function sqlForCreate(table, items) {
	const { handle, name, num_employees, description, logo_url } = items;
	const queryString = `
    INSERT INTO ${table} (handle, name, num_employees, description, logo_url)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING handle, name, num_employees, description, logo_url
    `;
	const values = [handle, name, num_employees, description, logo_url];
	return { queryString, values };
}

module.exports = sqlForCreate;
