process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

let _token;

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
	company_handle: `${company1.handle}`,
};
const job2 = {
	title: "CEO",
	salary: 150000.0,
	equity: 0.75,
	company_handle: `${company2.handle}`,
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

const invalidSchemaErrors = [
	"instance.handle is not of a type(s) string",
	"instance.name is not of a type(s) string",
	"instance.num_employees is not of a type(s) integer",
	"instance.description is not of a type(s) string",
	"instance.logo_url is not of a type(s) string",
];

beforeAll(async () => {
	await db.query(`DELETE FROM users`);
	await db.query(`DELETE FROM jobs`);
	await db.query(`DELETE FROM companies`);
	const registeredUser = await request(app).post("/users").send({
		username: "username1",
		password: "password1",
		first_name: "Brian",
		last_name: "Shapiro",
		email: "brianshapiro@gmail.com",
		photo_url: "photo url here",
		is_admin: true,
	});
	const registerToken = registeredUser.body.token;
	const loggedInUser = await request(app).post("/login").send({
		_token: registerToken,
		username: "username1",
		password: "password1",
	});
	_token = loggedInUser.body.token;
});

beforeEach(async () => {
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

afterEach(async () => {
	await db.query(`DELETE FROM users`);
	await db.query(`DELETE FROM jobs`);
	await db.query(`DELETE FROM companies`);
});

describe("Test GET /companies route", () => {
	it("should return all companies (no query params)", async () => {
		const resp = await request(app).get("/companies").send({ _token });
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
		const resp = await request(app)
			.get(`/companies?search=${company1.handle}`)
			.send({ _token });
		expect(resp.body).toEqual({
			companies: [
				{
					handle: company1.handle,
					name: company1.name,
				},
			],
		});
	});
	it("should return all companies with more than min_employee amount of employees (no max_employee or search)", async () => {
		const resp = await request(app)
			.get(`/companies?min_employees=${company2.num_employees - 1}`)
			.send({ _token });
		expect(resp.body).toEqual({
			companies: [
				{
					handle: company2.handle,
					name: company2.name,
				},
			],
		});
	});
	it("should return all companies with less than max_employee amount of employees (no min_employee or search)", async () => {
		const resp = await request(app)
			.get(`/companies?max_employees=${company1.num_employees + 1}`)
			.send({ _token });
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
		const resp = await request(app)
			.get(
				`/companies?min_employees=${company1.num_employees - 1}&max_employees=${
					company2.num_employees + 1
				}`
			)
			.send({ _token });

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
	it("should return all companies with certain name/handle and range of amount of employees", async () => {
		const resp = await request(app)
			.get(
				`/companies?search=${company1.name}&min_employees=${
					company1.num_employees - 1
				}&max_employees=${company2.num_employees + 1}`
			)
			.send({ _token });
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
		const resp = await request(app)
			.post(`/companies`)
			.send({ ...newCompany, _token });
		expect(resp.status).toBe(201);
		expect(resp.body).toEqual({ company: newCompany });
		const getResp = await request(app)
			.get(`/companies/${newCompany.handle}`)
			.send({ _token });
		expect(getResp.body).toEqual({
			company: { ...newCompany, jobs: [] },
		});
	});
	it("should return an error if schema not matched", async () => {
		const resp = await request(app)
			.post(`/companies`)
			.send({ ...invalidCompany, _token });
		expect(resp.status).toBe(400);
		expect(resp.body).toEqual({
			status: 400,
			message: invalidSchemaErrors,
		});
		const getResp = await request(app)
			.get(`/companies/${invalidCompany.handle}`)
			.send({ _token });
		expect(getResp.body).toEqual({
			status: 404,
			message: "Company not found.",
		});
	});
});

describe("Test GET /companies/:handle route", () => {
	it("should get info on company with given handle", async () => {
		const resp = await request(app)
			.get(`/companies/${company1.handle}`)
			.send({ _token });
		job1.date_posted = resp.body.company.jobs[0].date_posted;
		job1.id = resp.body.company.jobs[0].id;
		expect(resp.status).toBe(200);
		expect(resp.body).toEqual({
			company: { ...company1, jobs: [job1] },
		});
	});
	it("should return an error if company with given handle can't be found", async () => {
		const resp = await request(app).get(`/companies/ABCDEFG`).send({ _token });
		expect(resp.status).toBe(404);
		const getResp = await request(app)
			.get(`/companies/ABCDEF`)
			.send({ _token });
		expect(getResp.body).toEqual({
			status: 404,
			message: "Company not found.",
		});
	});
});

describe("Test PATCH /companies/:handle route", () => {
	it("should update a company", async () => {
		const resp = await request(app)
			.patch(`/companies/${company1.handle}`)
			.send({ ...company1_update, _token });
		expect(resp.status).toBe(200);
		expect(resp.body).toEqual({ company: company1_update });
		const getResp = await request(app)
			.get(`/companies/${company1.handle}`)
			.send({ _token });
		job1.date_posted = getResp.body.company.jobs[0].date_posted;
		job1.id = getResp.body.company.jobs[0].id;
		expect(getResp.status).toBe(200);
		expect(getResp.body).toEqual({
			company: { ...company1_update, jobs: [job1] },
		});
	});
	it("should return an error if company with given handle can't be found", async () => {
		const resp = await request(app)
			.patch(`/companies/XYZ321`)
			.send({ ...company1_update, _token });
		expect(resp.status).toBe(404);
		expect(resp.body).toEqual({ status: 404, message: "Company not found." });
	});
	it("should return an error if request body doesn't match schema", async () => {
		const resp = await request(app)
			.patch(`/companies/${company1.handle}`)
			.send({ ...invalidCompany, _token });
		expect(resp.status).toBe(400);
		expect(resp.body).toEqual({
			status: 400,
			message: invalidSchemaErrors,
		});
		const getResp = await request(app)
			.get(`/companies/${company1.handle}`)
			.send({ _token });
		job1.date_posted = getResp.body.company.jobs[0].date_posted;
		job1.id = getResp.body.company.jobs[0].id;
		expect(getResp.status).toBe(200);
		expect(getResp.body).toEqual({
			company: { ...company1, jobs: [job1] },
		});
	});
});

describe("Test DELETE /companies/:handle route", () => {
	it("should delete a company", async () => {
		const resp = await request(app)
			.delete(`/companies/${company2.handle}`)
			.send({ _token });
		expect(resp.status).toBe(200);
		expect(resp.body).toEqual({ message: "Company deleted" });
		const getResp = await request(app)
			.get(`/companies/${company2.handle}`)
			.send({ _token });
		expect(getResp.body).toEqual({
			status: 404,
			message: "Company not found.",
		});
	});
	it("should return an error if company with given handle can't be found", async () => {
		const resp = await request(app)
			.delete(`/companies/MYNAMEISBRIAN`)
			.send({ _token });
		expect(resp.status).toBe(404);
		expect(resp.body).toEqual({ status: 404, message: "Company not found." });
	});
});

afterAll(async () => {
	await db.query(`DELETE FROM applications`);
	await db.query(`DELETE FROM users`);
	await db.query(`DELETE FROM jobs`);
	await db.query(`DELETE FROM companies`);
	await db.end();
});
