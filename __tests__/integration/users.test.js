process.env.NODE_ENV = "test";
const _ = require("lodash");
const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

let user1;
let user2;
let newUser;
let user1_update;
const invalidUser = {
	username: 1,
	password: 2,
	first_name: 3,
	last_name: 4,
	email: 5,
	photo_url: 6,
	is_admin: "hello",
};

const invalidSchemaErrors = [
	"instance.username is not of a type(s) string",
	"instance.password is not of a type(s) string",
	"instance.first_name is not of a type(s) string",
	"instance.last_name is not of a type(s) string",
	"instance.email is not of a type(s) string",
	"instance.photo_url is not of a type(s) string",
	"instance.is_admin is not of a type(s) boolean",
];

let _token;

const company1 = {
	handle: "GOOG",
	name: "Google",
	num_employees: 100,
	description: "Best search engine ever",
	logo_url: "enter logo url here",
};

const job1 = {
	title: "I.T. Support",
	salary: 45000.0,
	equity: 0.1,
	company_handle: "GOOG",
};

const app1 = {
	username: "username1",
	state: "Pending...",
};

const app2 = {
	username: "username2",
	state: "Accepted!",
};

beforeAll(async () => {
	await db.query(`DELETE FROM applications`);
	await db.query(`DELETE FROM users`);
	await db.query(`DELETE FROM jobs`);
	await db.query(`DELETE FROM companies`);
});

beforeEach(async () => {
	user1 = {
		username: "username1",
		password: "password1",
		first_name: "Brian",
		last_name: "Shapiro",
		email: "brianshapiro@gmail.com",
		photo_url: "photo url here",
		is_admin: true,
	};
	user2 = {
		username: "username2",
		password: "password2",
		first_name: "Nick",
		last_name: "Griffo",
		email: "nickgriffo@gmail.com",
		is_admin: false,
	};
	newUser = {
		username: "emeryjohnson",
		password: "vaugh321",
		first_name: "Emery",
		last_name: "Johnson",
		email: "emeryjohnson@gmail.com",
		photo_url: "photo url here",
		is_admin: false,
	};
	user1_update = {
		username: "username1",
		password: "password345",
		first_name: "Bob",
		last_name: "Smith",
		email: "bobsmith@gmail.com",
		photo_url: "different photo url",
		is_admin: false,
	};
	const registeredUser = await request(app).post("/users").send(user1);
	const registerToken = registeredUser.body;
	const loggedInUser = await request(app).post("/login").send({
		_token: registerToken,
		username: user1.username,
		password: user1.password,
	});
	_token = loggedInUser.body.token;
	await db.query(
		`INSERT INTO users (username, password, first_name, last_name, email, is_admin) VALUES ($1, $2, $3, $4, $5, $6)`,
		[
			user2.username,
			user2.password,
			user2.first_name,
			user2.last_name,
			user2.email,
			user2.is_admin,
		]
	);
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
	let jobResp = await db.query(
		`INSERT INTO jobs (title, salary, equity, company_handle) VALUES ($1, $2, $3, $4) RETURNING *`,
		[job1.title, job1.salary, job1.equity, job1.company_handle]
	);
	app1.job_id = jobResp.rows[0].id;
	app2.job_id = jobResp.rows[0].id;
	await db.query(
		`INSERT INTO applications (username, job_id, state) VALUES ($1, $2, $3)`,
		[app1.username, app1.job_id, app1.state]
	);
	await db.query(
		`INSERT INTO applications (username, job_id, state) VALUES ($1, $2, $3)`,
		[app2.username, app2.job_id, app2.state]
	);
});

afterEach(async () => {
	await db.query(`DELETE FROM users`);
	await db.query(`DELETE FROM jobs`);
	await db.query(`DELETE FROM companies`);
});

describe("Test GET /users route", () => {
	afterEach(async () => {
		await db.query(`DELETE FROM users`);
		await db.query(`DELETE FROM jobs`);
		await db.query(`DELETE FROM companies`);
	});
	it("should return all user", async () => {
		const resp = await request(app).get("/users").send({ _token });
		user1 = _.omit(user1, ["password", "photo_url", "is_admin"]);
		user2 = _.omit(user2, ["password", "photo_url", "is_admin"]);
		expect(resp.status).toBe(200);
		expect(resp.body).toEqual({
			users: [user1, user2],
		});
	});
});

describe("Test POST /users route", () => {
	afterEach(async () => {
		await db.query(`DELETE FROM users`);
		await db.query(`DELETE FROM jobs`);
		await db.query(`DELETE FROM companies`);
	});
	it("should create a new user", async () => {
		const resp = await request(app).post(`/users`).send(newUser);
		expect(resp.status).toBe(200);
		expect(resp.body).toEqual({ token: expect.any(String) });
	});
	it("should return an error if schema not matched", async () => {
		const resp = await request(app)
			.post(`/users`)
			.send({ ...invalidUser, _token });
		expect(resp.status).toBe(400);
		expect(resp.body).toEqual({
			status: 400,
			message: invalidSchemaErrors,
		});
		const getResp = await request(app)
			.get(`/users/${invalidUser.username}`)
			.send({ _token });
		expect(getResp.body).toEqual({ status: 404, message: "User not found." });
	});
});

describe("Test GET /users/:username route", () => {
	afterEach(async () => {
		await db.query(`DELETE FROM users`);
		await db.query(`DELETE FROM jobs`);
		await db.query(`DELETE FROM companies`);
	});
	it("should get info on users with given username", async () => {
		const resp = await request(app)
			.get(`/users/${user1.username}`)
			.send({ _token });
		delete user1.password;
		expect(resp.status).toBe(200);
		app1.created_at = resp.body.user.applications[0].created_at;
		expect(resp.body).toEqual({ user: { ...user1, applications: [app1] } });
	});
	it("should return an error if users with given username can't be found", async () => {
		const resp = await request(app)
			.get(`/users/INVALIDUSERNAME`)
			.send({ _token });
		expect(resp.status).toBe(404);
		expect(resp.body).toEqual({ status: 404, message: "User not found." });
	});
});

describe("Test PATCH /users/:username route", () => {
	afterEach(async () => {
		await db.query(`DELETE FROM users`);
		await db.query(`DELETE FROM jobs`);
		await db.query(`DELETE FROM companies`);
	});
	it("should update a user", async () => {
		const resp = await request(app)
			.patch(`/users/${user1.username}`)
			.send({ ...user1_update, _token });
		delete user1_update.password;
		expect(resp.status).toBe(200);
		expect(resp.body).toEqual({ user: user1_update });
		const getResp = await request(app)
			.get(`/users/${user1_update.username}`)
			.send({ _token });
		app1.created_at = getResp.body.user.applications[0].created_at;
		expect(getResp.body).toEqual({
			user: { ...user1_update, applications: [app1] },
		});
	});
	it("should return an error if user with given username can't be found", async () => {
		const resp = await request(app)
			.patch(`/users/INVALIDUSERNAME`)
			.send({ ...user1_update, _token });
		expect(resp.status).toBe(404);
		expect(resp.body).toEqual({ status: 404, message: "User not found." });
	});
	it("should return an error if request body doesn't match schema", async () => {
		const resp = await request(app)
			.patch(`/users/${user1.username}`)
			.send({ ...invalidUser, _token });
		expect(resp.status).toBe(400);
		expect(resp.body).toEqual({
			status: 400,
			message: invalidSchemaErrors,
		});
		const getResp = await request(app).get(`/users/${user1.username}`);
		delete user1.password;
		app1.created_at = getResp.body.user.applications[0].created_at;
		expect(getResp.body).toEqual({
			user: { ...user1, applications: [app1] },
		});
	});
});

describe("Test DELETE /users/:username route", () => {
	afterEach(async () => {
		await db.query(`DELETE FROM users`);
		await db.query(`DELETE FROM jobs`);
		await db.query(`DELETE FROM companies`);
	});
	it("should delete a user", async () => {
		const resp = await request(app)
			.delete(`/users/${user2.username}`)
			.send({ _token });
		expect(resp.status).toBe(200);
		expect(resp.body).toEqual({ message: "User deleted" });
		const getResp = await request(app)
			.get(`/users/${user2.username}`)
			.send({ _token });
		expect(getResp.body).toEqual({ status: 404, message: "User not found." });
	});
	it("should return an error if user with given username can't be found", async () => {
		const resp = await request(app)
			.delete(`/users/INVALIDUSERNAME`)
			.send({ _token });
		expect(resp.status).toBe(404);
		expect(resp.body).toEqual({ status: 404, message: "User not found." });
	});
});

afterAll(async () => {
	await db.query(`DELETE FROM applications`);
	await db.query(`DELETE FROM users`);
	await db.query(`DELETE FROM jobs`);
	await db.query(`DELETE FROM companies`);
	await db.end();
});
