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
		username: "username345",
		password: "password345",
		first_name: "Bob",
		last_name: "Smith",
		email: "bobsmith@gmail.com",
		photo_url: "different photo url",
		is_admin: false,
	};
	await db.query(`DELETE FROM users`);
	await db.query(
		`INSERT INTO users (username, password, first_name, last_name, email, photo_url, is_admin) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		[
			user1.username,
			user1.password,
			user1.first_name,
			user1.last_name,
			user1.email,
			user1.photo_url,
			user1.is_admin,
		]
	);
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
});

describe("Test GET /users route", () => {
	it("should return all users in order of date posted (no query params)", async () => {
		const resp = await request(app).get("/users");
		user1 = _.omit(user1, ["password", "photo_url", "is_admin"]);
		user2 = _.omit(user2, ["password", "photo_url", "is_admin"]);
		expect(resp.status).toBe(200);
		expect(resp.body).toEqual({
			users: [user1, user2],
		});
	});
});

describe("Test POST /users route", () => {
	it("should create a new users", async () => {
		const resp = await request(app).post(`/users`).send(newUser);
		expect(resp.status).toBe(201);
		expect(resp.body).toEqual({ user: newUser });
		const getResp = await request(app).get(`/users/${newUser.username}`);
		delete newUser.password;
		expect(getResp.body).toEqual({ user: newUser });
	});
	it("should return an error if schema not matched", async () => {
		const resp = await request(app).post(`/users`).send(invalidUser);
		expect(resp.status).toBe(400);
		expect(resp.body).toEqual({
			status: 400,
			message: invalidSchemaErrors,
		});
		const getResp = await request(app).get(`/users/${invalidUser.username}`);
		expect(getResp.body).toEqual({ status: 404, message: "User not found." });
	});
});

describe("Test GET /users/:username route", () => {
	it("should get info on users with given username", async () => {
		const resp = await request(app).get(`/users/${user1.username}`);
		delete user1.password;
		expect(resp.status).toBe(200);
		expect(resp.body).toEqual({ user: user1 });
	});
	it("should return an error if users with given username can't be found", async () => {
		const resp = await request(app).get(`/users/INVALIDUSERNAME`);
		expect(resp.status).toBe(404);
		expect(resp.body).toEqual({ status: 404, message: "User not found." });
	});
});

describe("Test PATCH /users/:username route", () => {
	it("should update a user", async () => {
		const resp = await request(app)
			.patch(`/users/${user1.username}`)
			.send(user1_update);
		delete user1_update.password;
		expect(resp.status).toBe(200);
		expect(resp.body).toEqual({ user: user1_update });
		const getResp = await request(app).get(`/users/${user1_update.username}`);
		expect(getResp.body).toEqual({ user: user1_update });
	});
	it("should return an error if user with given username can't be found", async () => {
		const resp = await request(app)
			.patch(`/users/INVALIDUSERNAME`)
			.send(user1_update);
		expect(resp.status).toBe(404);
		expect(resp.body).toEqual({ status: 404, message: "User not found." });
	});
	it("should return an error if request body doesn't match schema", async () => {
		const resp = await request(app)
			.patch(`/users/${user1.username}`)
			.send(invalidUser);
		expect(resp.status).toBe(400);
		expect(resp.body).toEqual({
			status: 400,
			message: invalidSchemaErrors,
		});
		const getResp = await request(app).get(`/users/${user1.username}`);
		delete user1.password;
		expect(getResp.body).toEqual({ user: user1 });
	});
});

describe("Test DELETE /users/:username route", () => {
	it("should delete a user", async () => {
		const resp = await request(app).delete(`/users/${user2.username}`);
		expect(resp.status).toBe(200);
		expect(resp.body).toEqual({ message: "User deleted" });
		const getResp = await request(app).get(`/users/${user2.username}`);
		expect(getResp.body).toEqual({ status: 404, message: "User not found." });
	});
	it("should return an error if user with given username can't be found", async () => {
		const resp = await request(app).delete(`/users/INVALIDUSERNAME`);
		expect(resp.status).toBe(404);
		expect(resp.body).toEqual({ status: 404, message: "User not found." });
	});
});

afterAll(async () => {
	await db.end();
});
