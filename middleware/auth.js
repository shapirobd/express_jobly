const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");

// Verifies that, when a token is sent as part of the request body, its signature matches with our SECRET_KEY
// Next, it adds a 'user' property to the request contains the payload from the token
function authenticateJWT(req, res, next) {
	try {
		const payload = jwt.verify(req.body._token, SECRET_KEY);
		req.user = payload;
		return next();
	} catch (e) {
		return next();
	}
}

// Protects routes by making sure that only a user who has authenticated in can use them
function ensureLoggedIn(req, res, next) {
	if (!req.user) {
		const e = new ExpressError("Unauthorized", 401);
		return next(e);
	} else {
		return next();
	}
}

// Protects routes by making sure that they are only accessible by the logged-in user with the same username
function ensureSameUser(req, res, next) {
	if (!req.user || !req.user.username === req.params.username) {
		const e = new ExpressError("Unauthorized", 401);
		return next(e);
	} else {
		return next();
	}
}

// Protects routes by making sure that they are only accessible by a user who is an admin
function ensureAdmin(req, res, next) {
	if (!req.user || !req.user.is_admin) {
		return next(new ExpressError("Must be an admin to go here!", 401));
	} else {
		delete req.body._token;
		return next();
	}
}

module.exports = {
	authenticateJWT,
	ensureLoggedIn,
	ensureSameUser,
	ensureAdmin,
};
