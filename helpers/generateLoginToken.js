const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config.js");
const ExpressError = require("./expressError");

// When a user logs in via the '/login' route, this function checks that the password is valid and then generates a token for that user
// user: the user object representing the user logging in
// password: the password to be checked
async function generateLoginToken(user, password) {
	const username = user.username;
	if (await bcrypt.compare(password, user.password)) {
		let token = jwt.sign({ username, is_admin: user.is_admin }, SECRET_KEY);
		return token;
	}
	throw new ExpressError("Incorrect username/password", 400);
}

module.exports = generateLoginToken;
