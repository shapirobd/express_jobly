const express = require("express");
const ExpressError = require("../helpers/expressError");
const Job = require("../models/job");
const jsonschema = require("jsonschema");
const createJobSchema = require("../schemas/createJobSchema.json");
const updateJobSchema = require("../schemas/updateJobSchema.json");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");

const router = new express.Router();

// creates a new job & adds to database
// validates req.body based on JSON schema from createJobSchema.json
// returns the details of the new job in JSON format - {job: {jobDetails}}
router.post("/", ensureAdmin, async (req, res, next) => {
	try {
		const result = jsonschema.validate(req.body, createJobSchema);
		if (!result.valid) {
			const errorList = result.errors.map((error) => error.stack);
			const error = new ExpressError(errorList, 400);
			return next(error);
		}
		const job = await Job.create(req.body);
		return res.status(201).json({ job: job });
	} catch (e) {
		return next(e);
	}
});

// This route should list all the titles and company handles for all jobs, ordered by the most recently posted jobs. It should also allow for the following query string parameters

// search: If the query string parameter is passed, a filtered list of titles and company handles should be displayed based on the search term and if the job title includes it.
// min_salary: If the query string parameter is passed, titles and company handles should be displayed that have a salary greater than the value of the query string parameter.
// min_equity: If the query string parameter is passed, a list of titles and company handles should be displayed that have an equity greater than the value of the query string parameter.
// It should return JSON of {jobs: [job, ...]}
router.get("/", ensureLoggedIn, async (req, res, next) => {
	try {
		const filters = {
			search: req.query.search,
			min_salary: req.query.min_salary,
			min_equity: req.query.min_equity,
		};
		const jobs = await Job.getAll(filters);
		return res.json({ jobs: jobs });
	} catch (e) {
		return next(e);
	}
});

// This route should show information about a specific job including a
// key of company which is an object that contains all of the information
// about the company associated with it in JSON format - {job: {...jobDetails, company: {companyDetails}}}
// if id not found, returns 404 error message
router.get("/:id", ensureLoggedIn, async (req, res, next) => {
	try {
		const job = await Job.getById(req.params.id);
		return res.json({ job: job });
	} catch (e) {
		return next(e);
	}
});

// Updates a job - finds the job based on its id
// validates req.body based on JSON schema from updateJobSchema.json
// returns the newly updated job in JSON format - {job: {jobDetails}}
// if id not found, returns 404 error message
router.patch("/:id", ensureAdmin, async (req, res, next) => {
	try {
		const result = jsonschema.validate(req.body, updateJobSchema);
		if (!result.valid) {
			const errorList = result.errors.map((error) => error.stack);
			const error = new ExpressError(errorList, 400);
			return next(error);
		}
		const job = await Job.update(req.params.id, req.body);
		return res.json({ job: job });
	} catch (e) {
		return next(e);
	}
});

// Deletes a job - finds the job based on its id
// returns a deleted message in JSON format - {message: "Job deleted"}
// if id not found, returns 404 error message
router.delete("/:id", ensureAdmin, async (req, res, next) => {
	try {
		await Job.delete(req.params.id);
		return res.json({ message: "Job deleted" });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
