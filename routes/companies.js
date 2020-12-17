const express = require("express");
const ExpressError = require("../helpers/expressError");
const Company = require("../models/company");
const jsonschema = require("jsonschema");
const createCompanySchema = require("../schemas/createCompanySchema.json");
const updateCompanySchema = require("../schemas/updateCompanySchema.json");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");

const router = new express.Router();

// This should return the handle and name for all of the company objects. It should also allow for the following query string parameters:

// search: If the query string parameter is passed, a filtered list of handles and names should be displayed based on the search term and if the name includes it.
// min_employees: If the query string parameter is passed, titles and company handles should be displayed that have a number of employees greater than the value of the query string parameter.
// max_employees: If the query string parameter is passed, a list of titles and company handles should be displayed that have a number of employees less than the value of the query string parameter.
// If the min_employees parameter is greater than the max_employees parameter, respond with a 400 status and a message notifying that the parameters are incorrect.
router.get("/", ensureLoggedIn, async (req, res, next) => {
	try {
		const search = req.query.search;
		const min_employees = parseInt(req.query.min_employees);
		const max_employees = parseInt(req.query.max_employees);
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

// creates a new company
// validates req.body based on JSON schema from createCompanySchema.json
// returns the details of the new company in JSON format - {company: {companyDetails}}
router.post("/", ensureAdmin, async (req, res, next) => {
	try {
		const result = jsonschema.validate(req.body, createCompanySchema);
		if (!result.valid) {
			let errorsList = result.errors.map((error) => error.stack);
			let error = new ExpressError(errorsList, 400);
			return next(error);
		}
		const company = await Company.create(req.body);
		return res.status(201).json({ company: company });
	} catch (e) {
		return next(e);
	}
});

// Retrieves a company - finds the company based on its handle
// returns the company & associated jobs in JSON format - {user: {userDetails..., jobs: [allJobs]}}
// if handle not found, returns 404 error message
router.get("/:handle", ensureLoggedIn, async (req, res, next) => {
	try {
		const company = await Company.getByHandle(req.params.handle);
		return res.json({ company: company });
	} catch (e) {
		return next(e);
	}
});

// Updates a company - finds the user based on its handle
// validates req.body based on JSON schema from updateCompanySchema.json
// returns the newly updated company in JSON format - {company: {companyDetails}}
// if handle not found, returns 404 error message
router.patch("/:handle", ensureAdmin, async (req, res, next) => {
	try {
		const result = jsonschema.validate(req.body, updateCompanySchema);
		if (!result.valid) {
			let errorsList = result.errors.map((error) => error.stack);
			let error = new ExpressError(errorsList, 400);
			return next(error);
		}
		const company = await Company.update(req.params.handle, req.body);
		return res.json({ company: company });
	} catch (e) {
		return next(e);
	}
});

// Deletes a company - finds the company based on its handle
// returns a deleted message in JSON format - {message: "Company deleted"}
// if handle not found, returns 404 error message
router.delete("/:handle", ensureAdmin, async (req, res, next) => {
	try {
		await Company.delete(req.params.handle);
		return res.json({ message: "Company deleted" });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
