const express = require("express");
const ExpressError = require("../helpers/expressError");
const Job = require("../models/job");
const jsonschema = require("jsonschema");
const jobSchema = require("../schemas/jobSchema.json");

const router = new express.Router();

// create & add a new job to the database
router.post("/", async (req, res, next) => {
	try {
		const result = jsonschema.validate(jobSchema, req.body);
		if (!result.valid) {
			const errorList = result.errors.map((error) => error.stack);
			const error = new ExpressError(errorList, 400);
			return next(error);
		}
		const job = await Job.create(req.body);
		return res.json({ job: job });
	} catch (e) {
		return next(e);
	}
});

router.get("/", async (req, res, next) => {
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

router.get("/:id", async (req, res, next) => {
	try {
		const job = await Job.getOne(req.params.id);
		return res.json({ job: job });
	} catch (e) {
		return next(e);
	}
});

router.patch("/:id", async (req, res, next) => {
	try {
		const result = jsonschema.validate(jobSchema, req.body);
		if (!result.valid) {
			const errorList = result.errors.map((error) => error.stack);
			const error = new ExpressError(errorList, 400);
			return next(error);
		}
		const job = await Job.partialUpdate(req.params.id, req.body);
		return res.json({ job: job });
	} catch (e) {
		return next(e);
	}
});

router.delete("/:id", async (req, res, next) => {
	try {
		await Job.delete(req.params.id);
		return res.json({ message: "Job deleted" });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
