const sqlForPartialUpdate = require("partialUpdate.js");

describe("partialUpdate()", () => {
	it("should generate a proper partial update query with just 1 field", () => {
		// FIXME: write real tests!
		const table;
		const items;
		const key;
		const id;
		const queryValues = sqlForPartialUpdate(table, items, key, id);
		expect(queryValues).toEqual(expect().any(Object));
	});
});
