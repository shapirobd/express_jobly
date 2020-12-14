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
const newCompany = {
	handle: "AMZN",
	name: "Amazon",
	num_employees: 1500,
	description: "Great online service",
	logo_url: "yet another logo url",
};
const invalidCompany = {
	handle: 1234,
	name: 56,
	num_employees: "Thirty",
	description: ["This", "is", "an", "array"],
	logo_url: { key: "value" },
};
const company1_update = {
	handle: "GOOG",
	name: "Google 2.0",
	num_employees: 999,
	description: "We are the best!",
	logo_url: "this is a logo url",
};

beforeEach(async () => {
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
});

describe("Test GET /companies route", () => {
	it("should return all companies (no query params)", async () => {
		const resp = await request(app).get("/companies");
		expect(resp.status).toBe(200);
		expect(resp.body).toEqual({
			companies: [
				{
					handle: company1.handle,
					name: company1.name,
				},
				{
					handle: company2.handle,
					name: company2.name,
				},
			],
		});
	});
	it("should return all companies with certain name/handle (no min/max_employee)", async () => {
		const resp = await request(app).get(`/companies?search=${company1.handle}`);
		expect(resp.body).toEqual({
			companies: [
				{
					handle: company1.handle,
					name: company1.name,
				},
			],
		});
	});
	it("should return all companies with at least min_employee amount of employees (no max_employee or search)", async () => {
		const resp = await request(app).get(
			`/companies?min_employees=${company2.num_employees}`
		);
		expect(resp.body).toEqual({
			companies: [
				{
					handle: company2.handle,
					name: company2.name,
				},
			],
		});
	});
	it("should return all companies with at most max_employee amount of employees (no min_employee or search)", async () => {
		const resp = await request(app).get(
			`/companies?max_employees=${company1.num_employees}`
		);
		expect(resp.body).toEqual({
			companies: [
				{
					handle: company1.handle,
					name: company1.name,
				},
			],
		});
	});
	it("should return all companies with between min & max_employees amount of employees(no search)", async () => {
		const resp = await request(app).get(
			`/companies?min_employees=${company1.num_employees}&max_employees=${company2.num_employees}`
		);
		expect(resp.body).toEqual({
			companies: [
				{
					handle: company1.handle,
					name: company1.name,
				},
				{
					handle: company2.handle,
					name: company2.name,
				},
			],
		});
	});
	it("should return all companies with certain name/handle and rand of amount of employees", async () => {
		const resp = await request(app).get(
			`/companies?search=${company1.name}&min_employees=${company1.num_employees}&max_employees=${company2.num_employees}`
		);
		expect(resp.body).toEqual({
			companies: [
				{
					handle: company1.handle,
					name: company1.name,
				},
			],
		});
	});
});

describe("Test POST /companies route", () => {
	it("should create a new company", async () => {
		const resp = await request(app).post(`/companies`).send(newCompany);
		expect(resp.status).toBe(201);
		expect(resp.body).toEqual({ company: newCompany });
		const getResp = await request(app).get("/companies");
		expect(getResp.body.companies).toContainEqual({
			handle: newCompany.handle,
			name: newCompany.name,
		});
	});
	it("should return an error if schema not matched", async () => {
		const resp = await request(app).post(`/companies`).send(invalidCompany);
		expect(resp.status).toBe(400);
		expect(resp.body).toEqual({
			status: 400,
			message: [
				"instance.handle is not of a type(s) string",
				"instance.name is not of a type(s) string",
				"instance.num_employees is not of a type(s) integer",
				"instance.description is not of a type(s) string",
				"instance.logo_url is not of a type(s) string",
			],
		});
		const getResp = await request(app).get("/companies");
		expect(getResp.body.companies).not.toContainEqual({
			handle: newCompany.handle,
			name: newCompany.name,
		});
	});
});

describe("Test GET /companies/:handle route", () => {
	it("should get info on company with given handle", async () => {
		const resp = await request(app).get(`/companies/${company1.handle}`);
		expect(resp.status).toBe(200);
		expect(resp.body).toEqual({ company: company1 });
	});
	it("should return an error if company with given handle can't be found", async () => {
		const resp = await request(app).get(`/companies/ABCDEFG`);
		expect(resp.status).toBe(404);
		expect(resp.body).toEqual({ status: 404, message: "Company not found." });
	});
});

describe("Test PATCH /companies/:handle route", () => {
	it("should update a company", async () => {
		const resp = await request(app)
			.patch(`/companies/${company1.handle}`)
			.send(company1_update);
		expect(resp.status).toBe(200);
		expect(resp.body).toEqual({ company: company1_update });
		const getResp = await request(app).get(`/companies/${company1.handle}`);
		expect(getResp.body).toEqual({ company: company1_update });
	});
	it("should return an error if company with given handle can't be found", async () => {
		const resp = await request(app)
			.patch(`/companies/XYZ321`)
			.send(company1_update);
		expect(resp.status).toBe(404);
		expect(resp.body).toEqual({ status: 404, message: "Company not found." });
		const getResp = await request(app).get(`/companies/${company1.handle}`);
		expect(getResp.body).toEqual({ company: company1 });
	});
	it("should return an error if request body doesn't match schema", async () => {
		const resp = await request(app)
			.patch(`/companies/${company1.handle}`)
			.send(invalidCompany);
		expect(resp.status).toBe(400);
		expect(resp.body).toEqual({
			status: 400,
			message: [
				"instance.handle is not of a type(s) string",
				"instance.name is not of a type(s) string",
				"instance.num_employees is not of a type(s) integer",
				"instance.description is not of a type(s) string",
				"instance.logo_url is not of a type(s) string",
			],
		});
		const getResp = await request(app).get(`/companies/${company1.handle}`);
		expect(getResp.body).toEqual({ company: company1 });
	});
});

describe("Test DELETE /companies/:handle route", () => {
	it("should delete a company", async () => {
		const resp = await request(app).delete(`/companies/${company2.handle}`);
		expect(resp.status).toBe(200);
		expect(resp.body).toEqual({ message: "Company deleted" });
	});
	it("should return an error if company with given handle can't be found", async () => {
		const resp = await request(app).delete(`/companies/MYNAMEISBRIAN`);
		expect(resp.status).toBe(404);
		expect(resp.body).toEqual({ status: 404, message: "Company not found." });
	});
});

afterAll(async () => {
	await db.end();
});
