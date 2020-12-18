process.env.NODE_ENV = "test";

const generateLoginToken = require("../../helpers/generateLoginToken");
const bcrypt = require("bcrypt");
const db = require("../../db");

let hashedPassword;
const correctPassword = "correctpassword";
const incorrectPasssword = "incorrectpassword";
let user;

beforeAll(async () => {
	hashedPassword = await bcrypt.hash(correctPassword, 6);
	user = {
		username: "username",
		password: hashedPassword,
		first_name: "First",
		last_name: "Last",
		email: "email123@gmail.com",
		photo_url: "photo_url",
		is_admin: false,
	};
	await db.query(
		"INSERT INTO users (username, password, first_name, last_name, email, photo_url, is_admin) VALUES ($1, $2, $3, $4, $5, $6, $7)",
		[
			user.username,
			user.password,
			user.first_name,
			user.last_name,
			user.email,
			user.photo_url,
			user.is_admin,
		]
	);
});

describe("generateLoginToken()", () => {
	it("should throw 400 error if password is incorrect", async () => {
		await expect(generateLoginToken(user, incorrectPasssword)).rejects.toThrow({
			status: 400,
			message: "Incorrect username/password",
		});
	});
	it("should return a token if password is correct", async () => {
		await expect(generateLoginToken(user, correctPassword)).resolves.toEqual(
			expect.any(String)
		);
	});
});

afterAll(async () => {
	await db.query("DELETE FROM users");
	await db.end();
});
