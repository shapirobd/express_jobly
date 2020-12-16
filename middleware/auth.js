const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");

function authenticateJWT(req, res, next) {
	try {
		const payload = jwt.verify(req.body._token, SECRET_KEY);
		req.user = payload;
		return next();
	} catch (e) {
		return next();
	}
}

function ensureLoggedIn(req, res, next) {
	if (!req.user) {
		const e = new ExpressError("Unauthorized", 401);
		return next(e);
	} else {
		return next();
	}
}

function ensureSameUser(req, res, next) {
	if (!req.user || !req.user.username === req.params.username) {
		const e = new ExpressError("Unauthorized", 401);
		return next(e);
	} else {
		return next();
	}
}

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
