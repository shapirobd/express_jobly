const express = require("express");
const ExpressError = require("../helpers/expressError");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = new express.Router();

router.post("/login", async (req, res, next) => {
	try {
		const { username, password } = req.body;
		bcrypt.hash;
		return res.status(201).json({ user: user });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
