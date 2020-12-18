process.env.NODE_ENV = "test";

const sqlForCreate = require("../../helpers/create");

describe("sqlForCreate()", () => {
	it("should generate a proper insert query for companies table", () => {
		const table = "companies";
		const items = {
			handle: "TEST",
			name: "Test Company",
			num_employees: 1000,
			description: "This is a test",
			logo_url: "logo url goes here",
		};
		const query = sqlForCreate(table, items);
		expect(query).toEqual(expect.any(Object));
		expect(query.queryString).toEqual(
			`INSERT INTO companies (handle, name, num_employees, description, logo_url) VALUES ($1, $2, $3, $4, $5) RETURNING handle, name, num_employees, description, logo_url`
		);
		expect(query.values).toEqual([
			items.handle,
			items.name,
			items.num_employees,
			items.description,
			items.logo_url,
		]);
	});
	it("should generate a proper insert query for jobs table", () => {
		const table = "jobs";
		const items = {
			title: "Job title",
			salary: 55000.0,
			equity: 0.25,
			company_handle: "TEST",
		};
		const query = sqlForCreate(table, items);
		expect(query).toEqual(expect.any(Object));
		expect(query.queryString).toEqual(
			`INSERT INTO jobs (title, salary, equity, company_handle) VALUES ($1, $2, $3, $4) RETURNING title, salary, equity, company_handle`
		);
		expect(query.values).toEqual([
			items.title,
			items.salary,
			items.equity,
			items.company_handle,
		]);
	});
	it("should generate a proper insert query for users table", () => {
		const table = "users";
		const items = {
			username: "username111",
			password: "pasword111",
			first_name: "First",
			last_name: "Last",
			email: "email@gmail.com",
			photo_url: "photo_url",
			is_admin: false,
		};
		const query = sqlForCreate(table, items);
		expect(query).toEqual(expect.any(Object));
		expect(query.queryString).toEqual(
			`INSERT INTO users (username, password, first_name, last_name, email, photo_url, is_admin) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING username, password, first_name, last_name, email, photo_url, is_admin`
		);
		expect(query.values).toEqual([
			items.username,
			items.password,
			items.first_name,
			items.last_name,
			items.email,
			items.photo_url,
			items.is_admin,
		]);
	});
});
