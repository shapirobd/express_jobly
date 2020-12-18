const getAll = require("../../helpers/companies/getAll");

const search = "Google";
const min_employees = 100;
const max_employees = 500;

describe("getAll() query for companies", () => {
	it("should return query to get all companies", () => {
		filters = {};
		const query = getAll(filters);
		expect(query).toEqual(expect.any(Object));
		expect(query.queryString).toEqual("SELECT handle, name FROM companies");
		expect(query.values).toEqual([]);
	});
	it("should return query to get all companies with given handle", () => {
		filters = { search };
		const query = getAll(filters);
		expect(query).toEqual(expect.any(Object));
		expect(query.queryString).toEqual(
			`SELECT handle, name FROM companies WHERE name=$1 OR handle=$1`
		);
		expect(query.values).toEqual([search]);
	});
	it("should return query to get all companies with given max_employees", () => {
		filters = { max_employees };
		const query = getAll(filters);
		expect(query).toEqual(expect.any(Object));
		expect(query.queryString).toEqual(
			`SELECT handle, name FROM companies WHERE num_employees < $1`
		);
		expect(query.values).toEqual([max_employees]);
	});
	it("should return query to get all companies with given handle and max_employees", () => {
		filters = { search, max_employees };
		const query = getAll(filters);
		expect(query).toEqual(expect.any(Object));
		expect(query.queryString).toEqual(
			`SELECT handle, name FROM companies WHERE name=$1 OR handle=$1 AND num_employees < $2`
		);
		expect(query.values).toEqual([search, max_employees]);
	});
	it("should return query to get all companies with given min_employees", () => {
		filters = { min_employees };
		const query = getAll(filters);
		expect(query).toEqual(expect.any(Object));
		expect(query.queryString).toEqual(
			`SELECT handle, name FROM companies WHERE num_employees > $1`
		);
		expect(query.values).toEqual([min_employees]);
	});
	it("should return query to get all companies with given handle & min_employees", () => {
		filters = { search, min_employees };
		const query = getAll(filters);
		expect(query).toEqual(expect.any(Object));
		expect(query.queryString).toEqual(
			`SELECT handle, name FROM companies WHERE name=$1 OR handle=$1 AND num_employees > $2`
		);
		expect(query.values).toEqual([search, min_employees]);
	});
	it("should return query to get all companies with max_employees & min_employees", () => {
		filters = { min_employees, max_employees };
		const query = getAll(filters);
		expect(query).toEqual(expect.any(Object));
		expect(query.queryString).toEqual(
			`SELECT handle, name FROM companies WHERE num_employees > $1 AND num_employees < $2`
		);
		expect(query.values).toEqual([min_employees, max_employees]);
	});
	it("should return query to get all companies with given handle and max_employees & min_employees", () => {
		filters = { search, min_employees, max_employees };
		const query = getAll(filters);
		expect(query).toEqual(expect.any(Object));
		expect(query.queryString).toEqual(
			`SELECT handle, name FROM companies WHERE name=$1 OR handle=$1 AND num_employees > $2 AND num_employees < $3`
		);
		expect(query.values).toEqual([search, min_employees, max_employees]);
	});
});
