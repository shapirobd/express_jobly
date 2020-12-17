const express = require("express");
const ExpressError = require("../helpers/expressError");
const User = require("../models/user");
const jsonschema = require("jsonschema");
const loginSchema = require("../schemas/loginSchema.json");

const router = new express.Router();

// this route logs a user in
// checks that username and password are defined by validation req.body against loginSchema.json
// if valid username/password, returns a token associated with the loggedIn user - {token: token }
// if invalide username/password, returns a 404 error message
router.post("/login", async (req, res, next) => {
	try {
		const result = jsonschema.validate(req.body, loginSchema);
		if (!result.valid) {
			const errorList = result.errors.map((error) => error.stack);
			const error = new ExpressError(errorList, 400);
			return next(error);
		}
		const token = await User.login(req.body);
		return res.status(201).json({ token: token });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
