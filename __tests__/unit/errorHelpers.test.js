const checkForNoResults = require("../../helpers/errorHelpers.js");

describe("checkForNoResults()", () => {
	it("should throw a 404 error if there are no results", () => {
		const itemName = "Company";
		const results = {
			rows: [],
		};
		expect(() => checkForNoResults(itemName, results)).toThrow({
			status: 404,
			message: "Company not found.",
		});
	});
	it("should NOT throw any error if there are no results", () => {
		const itemName = "Users";
		const results = {
			rows: [1, 2, 3],
		};
		expect(() => checkForNoResults(itemName, results)).not.toThrow();
	});
});
