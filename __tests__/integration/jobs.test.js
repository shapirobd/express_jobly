process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

const company1 = {
	handle: "GOOG",
	name: "Google",
	num_employees: 100,
	description: "Best search engine ever",
	logo_url: "enter logo url here",
};
const company2 = {
	handle: "AAPL",
	name: "Apple",
	num_employees: 500,
	description: "Best computers dude",
	logo_url: "another logo url",
};
const job1 = {
	title: "I.T. Support",
	salary: 45000.0,
	equity: 0.1,
	company_handle: "GOOG",
};
const job2 = {
	title: "CEO",
	salary: 150000.0,
	equity: 0.75,
	company_handle: "AAPL",
};
const newJob = {
	title: "Project Manager",
	salary: 999999.0,
	equity: 0.15,
	company_handle: "AMZN",
};
const invalidJob = {
	title: 123,
	salary: "One Million Dollars",
	equity: "5 percent",
	company_handle: { handle: "AMZN" },
};
const job1_update = {
	title: "Internet Technology Representative",
	salary: 50000.0,
	equity: 0.12,
	company_handle: "GOOG",
};

beforeEach(async () => {
	await db.query(`DELETE FROM jobs`);
	await db.query(`DELETE FROM companies`);
	await db.query(
		`INSERT INTO companies (handle, name, num_employees, description, logo_url) VALUES ($1, $2, $3, $4, $5)`,
		[
			company1.handle,
			company1.name,
			company1.num_employees,
			company1.description,
			company1.logo_url,
		]
	);
	await db.query(
		`INSERT INTO companies (handle, name, num_employees, description, logo_url) VALUES ($1, $2, $3, $4, $5)`,
		[
			company2.handle,
			company2.name,
			company2.num_employees,
			company2.description,
			company2.logo_url,
		]
	);
	await db.query(
		`INSERT INTO jobs (title, salary, equity, company_handle) VALUES ($1, $2, $3, $4)`,
		[job1.title, job1.salary, job1.equity, job1.company_handle]
	);
	await db.query(
		`INSERT INTO jobs (title, salary, equity, company_handle) VALUES ($1, $2, $3, $4)`,
		[job2.title, job2.salary, job2.equity, job2.company_handle]
	);
});

describe("Test GET /jobs route", () => {
	it("should return all jobs in order of date posted (no query params)", async () => {
		const resp = await request(app).get("/jobs");
		expect(resp.status).toBe(200);
		expect(resp.body).toEqual({
			jobs: [
				{
					title: job2.title,
					company_handle: job2.company_handle,
				},
				{
					title: job1.title,
					company_handle: job1.company_handle,
				},
			],
		});
	});
	it("should return all jobs with certain title (no min_salry/min_equity)", async () => {
		const resp = await request(app).get(`/jobs?search=${job2.title}`);
		console.log(resp.body);
		expect(resp.body).toEqual({
			jobs: [
				{
					title: job2.title,
					company_handle: job2.company_handle,
				},
			],
		});
	});
	it("should return all jobs with more than min_salary (no min_equity or search)", async () => {
		const resp = await request(app).get(
			`/jobs?min_salary=${job2.salary - 0.01}`
		);
		expect(resp.body).toEqual({
			jobs: [
				{
					title: job2.title,
					company_handle: job2.company_handle,
				},
			],
		});
	});
	it("should return all jobs with more than min_equity (no min_salary or search)", async () => {
		const resp = await request(app).get(
			`/jobs?min_equity=${job1.equity - 0.01}`
		);
		expect(resp.body).toEqual({
			jobs: [
				{
					title: job2.title,
					company_handle: job2.company_handle,
				},
				{
					title: job1.title,
					company_handle: job1.company_handle,
				},
			],
		});
	});
	it("should return all jobs with min_salary and min_equity (no search)", async () => {
		const resp = await request(app).get(
			`/jobs?min_salary=${job1.salary - 0.01}&min_equity=${job2.equity - 0.01}`
		);
		expect(resp.body).toEqual({
			jobs: [
				{
					title: job2.title,
					company_handle: job2.company_handle,
				},
			],
		});
	});
	it("should return all jobs with certain title and min_salary and min_equity", async () => {
		const resp = await request(app).get(
			`/jobs?search=${job1.title}&min_salary=${job1.salary - 0.01}&min_equity=${
				job1.equity - 0.01
			}`
		);
		expect(resp.body).toEqual({
			jobs: [
				{
					title: job1.title,
					company_handle: job1.company_handle,
				},
			],
		});
	});
});

// describe("Test POST /jobs route", () => {
// 	it("should create a new company", async () => {
// 		const resp = await request(app).post(`/jobs`).send(newCompany);
// 		expect(resp.status).toBe(201);
// 		expect(resp.body).toEqual({ company: newCompany });
// 		const getResp = await request(app).get("/jobs");
// 		expect(getResp.body.jobs).toContainEqual({
// 			handle: newCompany.handle,
// 			name: newCompany.name,
// 		});
// 	});
// 	it("should return an error if schema not matched", async () => {
// 		const resp = await request(app).post(`/jobs`).send(invalidCompany);
// 		expect(resp.status).toBe(400);
// 		expect(resp.body).toEqual({
// 			status: 400,
// 			message: [
// 				"instance.handle is not of a type(s) string",
// 				"instance.name is not of a type(s) string",
// 				"instance.num_employees is not of a type(s) integer",
// 				"instance.description is not of a type(s) string",
// 				"instance.logo_url is not of a type(s) string",
// 			],
// 		});
// 		const getResp = await request(app).get("/jobs");
// 		expect(getResp.body.jobs).not.toContainEqual({
// 			handle: newCompany.handle,
// 			name: newCompany.name,
// 		});
// 	});
// });

// describe("Test GET /jobs/:handle route", () => {
// 	it("should get info on company with given handle", async () => {
// 		const resp = await request(app).get(`/jobs/${company1.handle}`);
// 		expect(resp.status).toBe(200);
// 		expect(resp.body).toEqual({ company: company1 });
// 	});
// 	it("should return an error if company with given handle can't be found", async () => {
// 		const resp = await request(app).get(`/jobs/ABCDEFG`);
// 		expect(resp.status).toBe(404);
// 		expect(resp.body).toEqual({ status: 404, message: "Company not found." });
// 	});
// });

// describe("Test PATCH /jobs/:handle route", () => {
// 	it("should update a company", async () => {
// 		const resp = await request(app)
// 			.patch(`/jobs/${company1.handle}`)
// 			.send(company1_update);
// 		expect(resp.status).toBe(200);
// 		expect(resp.body).toEqual({ company: company1_update });
// 		const getResp = await request(app).get(`/jobs/${company1.handle}`);
// 		expect(getResp.body).toEqual({ company: company1_update });
// 	});
// 	it("should return an error if company with given handle can't be found", async () => {
// 		const resp = await request(app).patch(`/jobs/XYZ321`).send(company1_update);
// 		expect(resp.status).toBe(404);
// 		expect(resp.body).toEqual({ status: 404, message: "Company not found." });
// 		const getResp = await request(app).get(`/jobs/${company1.handle}`);
// 		expect(getResp.body).toEqual({ company: company1 });
// 	});
// 	it("should return an error if request body doesn't match schema", async () => {
// 		const resp = await request(app)
// 			.patch(`/jobs/${company1.handle}`)
// 			.send(invalidCompany);
// 		expect(resp.status).toBe(400);
// 		expect(resp.body).toEqual({
// 			status: 400,
// 			message: [
// 				"instance.handle is not of a type(s) string",
// 				"instance.name is not of a type(s) string",
// 				"instance.num_employees is not of a type(s) integer",
// 				"instance.description is not of a type(s) string",
// 				"instance.logo_url is not of a type(s) string",
// 			],
// 		});
// 		const getResp = await request(app).get(`/jobs/${company1.handle}`);
// 		expect(getResp.body).toEqual({ company: company1 });
// 	});
// });

// describe("Test DELETE /jobs/:handle route", () => {
// 	it("should delete a company", async () => {
// 		const resp = await request(app).delete(`/jobs/${company2.handle}`);
// 		expect(resp.status).toBe(200);
// 		expect(resp.body).toEqual({ message: "Company deleted" });
// 	});
// 	it("should return an error if company with given handle can't be found", async () => {
// 		const resp = await request(app).delete(`/jobs/MYNAMEISBRIAN`);
// 		expect(resp.status).toBe(404);
// 		expect(resp.body).toEqual({ status: 404, message: "Company not found." });
// 	});
// });

afterAll(async () => {
	await db.end();
});
