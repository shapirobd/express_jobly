const express = require("express");
const ExpressError = require("../helpers/expressError");
const User = require("../models/user");
const jsonschema = require("jsonschema");
const userSchema = require("../schemas/userSchema.json");

const router = new express.Router();

router.post("/", async (req, res, next) => {
	try {
		console.log("POST!!");
		const result = jsonschema.validate(req.body, userSchema);
		if (!result.valid) {
			const errorList = result.errors.map((error) => error.stack);
			const error = new ExpressError(errorList, 400);
			return next(error);
		}
		const user = await User.register(req.body);
		return res.status(201).json({ user: user });
	} catch (e) {
		return next(e);
	}
});
router.get("/", async (req, res, next) => {
	try {
		const users = await User.getAll();
		return res.json({ users: users });
	} catch (e) {
		return next(e);
	}
});
router.get("/:username", async (req, res, next) => {
	try {
		const user = await User.getOne(req.params.username);
		return res.json({ user: user });
	} catch (e) {
		return next(e);
	}
});
router.patch("/:username", async (req, res, next) => {
	try {
		const result = jsonschema.validate(req.body, userSchema);
		if (!result.valid) {
			const errorList = result.errors.map((error) => error.stack);
			const error = new ExpressError(errorList, 400);
			return next(error);
		}
		const user = await User.partialUpdate(req.params.username, req.body);
		return res.json({ user: user });
	} catch (e) {
		return next(e);
	}
});
router.delete("/:username", async (req, res, next) => {
	try {
		await User.delete(req.params.username);
		return res.json({ message: "User deleted" });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
