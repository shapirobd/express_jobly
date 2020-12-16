const express = require("express");
const ExpressError = require("../helpers/expressError");
const User = require("../models/user");
const jsonschema = require("jsonschema");
const loginSchema = require("../schemas/loginSchema.json");

const router = new express.Router();

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
