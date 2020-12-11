process.env.NODE_ENV = "test";

const sqlForPartialUpdate = require("../../helpers/partialUpdate");

describe("partialUpdate()", () => {
	it("should generate a proper partial update query with just 1 field", () => {
		// FIXME: write real tests!
		let table = "companies";
		let items = {
			num_employees: "99999",
		};
		let key = "handle";
		let id = "GOOG";
		let queryValues = sqlForPartialUpdate(table, items, key, id);
		expect(queryValues).toEqual(expect.any(Object));
		expect(queryValues.query).toEqual(
			"UPDATE companies SET num_employees=$1 WHERE handle=$2 RETURNING *"
		);
		expect(queryValues.values).toEqual(["99999", "GOOG"]);
	});
});
