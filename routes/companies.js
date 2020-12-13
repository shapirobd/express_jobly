const express = require("express");
const ExpressError = require("../helpers/expressError");
const Company = require("../models/company");

const router = new express.Router();

// This should return the handle and name for all of the company objects. It should also allow for the following query string parameters:

// search: If the query string parameter is passed, a filtered list of handles and names should be displayed based on the search term and if the name includes it.
// min_employees: If the query string parameter is passed, titles and company handles should be displayed that have a number of employees greater than the value of the query string parameter.
// max_employees: If the query string parameter is passed, a list of titles and company handles should be displayed that have a number of employees less than the value of the query string parameter.
// If the min_employees parameter is greater than the max_employees parameter, respond with a 400 status and a message notifying that the parameters are incorrect.
router.get("/", async (req, res, next) => {
	try {
		const search = req.query.search;
		const min_employees = req.query.min_employees;
		const max_employees = req.query.max_employees;
		const companies = await Company.getAll(
			search,
			min_employees,
			max_employees
		);
		return res.json({ companies: companies });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
