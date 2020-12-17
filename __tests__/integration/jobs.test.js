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
	company_handle: "AAPL",
};
const invalidJob = {
	title: 123,
	salary: "One Million Dollars",
	equity: "5 percent",
	company_handle: { handle: "AMZN" },
};
let job1_update;

const invalidSchemaErrors = [
	"instance.title is not of a type(s) string",
	"instance.salary is not of a type(s) number",
	"instance.equity is not of a type(s) number",
	"instance.company_handle is not of a type(s) string",
];

function formatDate(job) {
	job["date_posted"] = job["date_posted"].toISOString();
	return job;
}

async function queryJob(job) {
	const queriedJob = await db.query(
		`SELECT * FROM jobs WHERE title='${job.title}'`
	);
	delete queriedJob.rows[0].company_handle;
	return formatDate(queriedJob.rows[0]);
}

async function queryCompany(job) {
	const queriedCompany = await db.query(
		`SELECT * FROM companies WHERE handle='${job.company_handle}'`
	);
	return queriedCompany.rows[0];
}

let _token;

beforeAll(async () => {
	await db.query(`DELETE FROM users`);
	const registeredUser = await request(app).post("/users").send({
		username: "username1",
		password: "password1",
		first_name: "Brian",
		last_name: "Shapiro",
		email: "brianshapiro@gmail.com",
		photo_url: "photo url here",
		is_admin: true,
	});
	const registerToken = registeredUser.body;
	const loggedInUser = await request(app).post("/login").send({
		_token: registerToken,
		username: "username1",
		password: "password1",
	});
	_token = loggedInUser.body.token;
});

beforeEach(async () => {
	job1_update = {
		title: "Internet Technology Representative",
		salary: 50000.0,
		equity: 0.12,
		company_handle: "GOOG",
	};

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
		const resp = await request(app).get("/jobs").send({ _token });
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
		const resp = await request(app)
			.get(`/jobs?search=${job2.title}`)
			.send({ _token });
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
		const resp = await request(app)
			.get(`/jobs?min_salary=${job2.salary - 0.01}`)
			.send({ _token });
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
		const resp = await request(app)
			.get(`/jobs?min_equity=${job1.equity - 0.01}`)
			.send({ _token });
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
		const resp = await request(app)
			.get(
				`/jobs?min_salary=${job1.salary - 0.01}&min_equity=${
					job2.equity - 0.01
				}`
			)
			.send({ _token });
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
		const resp = await request(app)
			.get(
				`/jobs?search=${job1.title}&min_salary=${
					job1.salary - 0.01
				}&min_equity=${job1.equity - 0.01}`
			)
			.send({ _token });
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

describe("Test POST /jobs route", () => {
	it("should create a new job", async () => {
		const resp = await request(app)
			.post(`/jobs`)
			.send({ ...newJob, _token });
		expect(resp.status).toBe(201);
		expect(resp.body).toEqual({ job: newJob });
		const job = await queryJob(newJob);
		const company = await queryCompany(newJob);
		const getResp = await request(app).get(`/jobs/${job.id}`).send({ _token });
		expect(getResp.body).toEqual({ job: { ...job, company } });
	});
	it("should return an error if schema not matched", async () => {
		const resp = await request(app)
			.post(`/jobs`)
			.send({ ...invalidJob, _token });
		expect(resp.status).toBe(400);
		expect(resp.body).toEqual({
			status: 400,
			message: invalidSchemaErrors,
		});
		const queriedJob = await db.query(
			`SELECT * FROM jobs WHERE title='${invalidJob.title}'`
		);
		expect(queriedJob.rows.length).toBe(0);
	});
});

describe("Test GET /jobs/:id route", () => {
	it("should get info on job with given id", async () => {
		const job = await queryJob(job1);
		const company = await queryCompany(job1);
		const resp = await request(app).get(`/jobs/${job.id}`).send({ _token });
		expect(resp.status).toBe(200);
		expect(resp.body).toEqual({ job: { ...job, company } });
	});
	it("should return an error if job with given id can't be found", async () => {
		const resp = await request(app).get(`/jobs/999999999`).send({ _token });
		expect(resp.status).toBe(404);
		expect(resp.body).toEqual({ status: 404, message: "Job not found." });
	});
});

describe("Test PATCH /jobs/:id route", () => {
	it("should update a job", async () => {
		const job = await queryJob(job1);
		const company = await queryCompany(job1_update);
		const resp = await request(app)
			.patch(`/jobs/${job.id}`)
			.send({ ...job1_update, _token });
		job1_update.date_posted = job.date_posted;
		job1_update.id = job.id;
		expect(resp.status).toBe(200);
		expect(resp.body).toEqual({ job: job1_update });
		const getResp = await request(app).get(`/jobs/${job.id}`).send({ _token });
		delete job1_update.company_handle;
		expect(getResp.body).toEqual({ job: { ...job1_update, company } });
	});
	it("should return an error if job with given id can't be found", async () => {
		const resp = await request(app)
			.patch(`/jobs/999999`)
			.send({ ...job1_update, _token });
		expect(resp.status).toBe(404);
		expect(resp.body).toEqual({ status: 404, message: "Job not found." });
	});
	it("should return an error if request body doesn't match schema", async () => {
		const job = await queryJob(job1);
		const company = await queryCompany(job1);
		const resp = await request(app)
			.patch(`/jobs/${job.id}`)
			.send({ ...invalidJob, _token });
		expect(resp.status).toBe(400);
		expect(resp.body).toEqual({
			status: 400,
			message: invalidSchemaErrors,
		});
		const getResp = await request(app).get(`/jobs/${job.id}`).send({ _token });
		expect(getResp.body).toEqual({ job: { ...job, company } });
	});
});

describe("Test DELETE /jobs/:id route", () => {
	it("should delete a job", async () => {
		const job = await queryJob(job2);
		console.log(job);
		const resp = await request(app).delete(`/jobs/${job.id}`).send({ _token });
		expect(resp.status).toBe(200);
		expect(resp.body).toEqual({ message: "Job deleted" });
		const getResp = await request(app).get(`/jobs/${job.id}`).send({ _token });
		expect(getResp.body).toEqual({ status: 404, message: "Job not found." });
	});
	it("should return an error if job with given id can't be found", async () => {
		const resp = await request(app).delete(`/jobs/99999999`).send({ _token });
		expect(resp.status).toBe(404);
		expect(resp.body).toEqual({ status: 404, message: "Job not found." });
	});
});

afterAll(async () => {
	await db.end();
});
