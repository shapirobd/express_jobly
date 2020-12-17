function generateLoginToken(user, password) {
    if (await bcrypt.compare(password, user.password)) {
	    let token = jwt.sign({ username, is_admin: user.is_admin }, SECRET_KEY);
	    return token;
    }
    throw new ExpressError("Incorrect username/password", 400);
}

module.exports = generateLoginToken