const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config.js");
const ExpressError = require("./expressError");

async function generateLoginToken(user, password) {
	const username = user.username;
	if (await bcrypt.compare(password, user.password)) {
		let token = jwt.sign({ username, is_admin: user.is_admin }, SECRET_KEY);
		return token;
	}
	throw new ExpressError("Incorrect username/password", 400);
}

module.exports = generateLoginToken;
