const express = require("express");
const ExpressError = require("../helpers/expressError");
const User = require("../models/user");
const jsonschema = require("jsonschema");
const registerUserSchema = require("../schemas/registerUserSchema.json");
const updateUserSchema = require("../schemas/updateUserSchema.json");
const { ensureSameUser } = require("../middleware/auth");

const router = new express.Router();

// creates a new user
// validates req.body based on JSON schema from registerUserSchema.json
// returns the token associated with the new user & their privileges in JSON format - {token: token}
router.post("/", async (req, res, next) => {
	try {
		const result = jsonschema.validate(req.body, registerUserSchema);
		if (!result.valid) {
			const errorList = result.errors.map((error) => error.stack);
			const error = new ExpressError(errorList, 400);
			return next(error);
		}
		const token = await User.register(req.body);
		return res.json({ token: token });
	} catch (e) {
		return next(e);
	}
});

// Gets all users from the database
// returns the list of users  & their username, first_name, last_name and email in JSON format - {users: [users]}
router.get("/", async (req, res, next) => {
	try {
		const users = await User.getAll();
		return res.json({ users: users });
	} catch (e) {
		return next(e);
	}
});

// req.body.technologies is an array of technologies
router.get("/:username/jobs", async (req, res, next) => {
	try {
		const jobs = await User.matchJobs(
			req.params.username,
			req.body.technologies
		);
		return res.json(jobs);
	} catch (e) {
		return next(e);
	}
});

// Retrieves a user - finds the user based on their username
// returns the user  & all their details (aside from password) in JSON format - {user: {userDetails}}
// if username not found, returns 404 error message
router.get("/:username", async (req, res, next) => {
	try {
		const user = await User.getByUsername(req.params.username);
		console.log(user);
		return res.json({ user: user });
	} catch (e) {
		return next(e);
	}
});

// Updates a user - finds the user based on their username
// validates req.body based on JSON schema from updateUserSchema.json
// returns the newly updated user & all their details (aside from password) in JSON format - {user: {userDetails}}
// if username not found, returns 404 error message
router.patch("/:username", ensureSameUser, async (req, res, next) => {
	try {
		console.log(req.body);
		const result = jsonschema.validate(req.body, updateUserSchema);
		if (!result.valid) {
			const errorList = result.errors.map((error) => error.stack);
			const error = new ExpressError(errorList, 400);
			return next(error);
		}
		const user = await User.update(req.params.username, req.body);
		return res.json({ user: user });
	} catch (e) {
		return next(e);
	}
});

// Deletes a user - finds the user based on their username
// returns a deleted message in JSON format - {message: "User deleted"}
// if username not found, returns 404 error message
router.delete("/:username", ensureSameUser, async (req, res, next) => {
	try {
		await User.delete(req.params.username);
		return res.json({ message: "User deleted" });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
