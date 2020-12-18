const getAll = require("../../helpers/jobs/getAll");

const search = "Developer";
const min_equity = "0.1";
const min_salary = "50000.00";

describe("getAll() query for jobs", () => {
	it("should return query to get all jobs", () => {
		filters = {};
		const query = getAll(filters);
		expect(query).toEqual(expect.any(Object));
		expect(query.queryString).toEqual(
			"SELECT title, company_handle FROM jobs ORDER BY date_posted DESC"
		);
		expect(query.values).toEqual([]);
	});
	it("should return query to get all jobs with given title", () => {
		filters = { search };
		const query = getAll(filters);
		expect(query).toEqual(expect.any(Object));
		expect(query.queryString).toEqual(
			`SELECT title, company_handle FROM jobs WHERE title ilike $1 ORDER BY date_posted DESC`
		);
		expect(query.values).toEqual([`%${search}%`]);
	});
	it("should return query to get all jobs with given min_equity", () => {
		filters = { min_equity };
		const query = getAll(filters);
		expect(query).toEqual(expect.any(Object));
		expect(query.queryString).toEqual(
			`SELECT title, company_handle FROM jobs WHERE equity > $1 ORDER BY date_posted DESC`
		);
		expect(query.values).toEqual([min_equity]);
	});
	it("should return query to get all jobs with given title and min_equity", () => {
		filters = { search, min_equity };
		const query = getAll(filters);
		expect(query).toEqual(expect.any(Object));
		expect(query.queryString).toEqual(
			`SELECT title, company_handle FROM jobs WHERE title ilike $1 AND equity > $2 ORDER BY date_posted DESC`
		);
		expect(query.values).toEqual([`%${search}%`, min_equity]);
	});
	it("should return query to get all jobs with given min_salary", () => {
		filters = { min_salary };
		const query = getAll(filters);
		expect(query).toEqual(expect.any(Object));
		expect(query.queryString).toEqual(
			`SELECT title, company_handle FROM jobs WHERE salary > $1 ORDER BY date_posted DESC`
		);
		expect(query.values).toEqual([min_salary]);
	});
	it("should return query to get all jobs with given title & min_salary", () => {
		filters = { search, min_salary };
		const query = getAll(filters);
		expect(query).toEqual(expect.any(Object));
		expect(query.queryString).toEqual(
			`SELECT title, company_handle FROM jobs WHERE title ilike $1 AND salary > $2 ORDER BY date_posted DESC`
		);
		expect(query.values).toEqual([`%${search}%`, min_salary]);
	});
	it("should return query to get all jobs with min_equity & min_salary", () => {
		filters = { min_salary, min_equity };
		const query = getAll(filters);
		expect(query).toEqual(expect.any(Object));
		expect(query.queryString).toEqual(
			`SELECT title, company_handle FROM jobs WHERE salary > $1 AND equity > $2 ORDER BY date_posted DESC`
		);
		expect(query.values).toEqual([min_salary, min_equity]);
	});
	it("should return query to get all jobs with given title and min_equity & min_salary", () => {
		filters = { search, min_salary, min_equity };
		const query = getAll(filters);
		expect(query).toEqual(expect.any(Object));
		expect(query.queryString).toEqual(
			`SELECT title, company_handle FROM jobs WHERE title ilike $1 AND salary > $2 AND equity > $3 ORDER BY date_posted DESC`
		);
		expect(query.values).toEqual([`%${search}%`, min_salary, min_equity]);
	});
});
