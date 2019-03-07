const db = require("../db");
const express = require("express");
const ExpressError = require("../expressError");

const router = new express.Router();

/** Get all invoices */

router.get("/invoices", async function (req, res, next) {
  try {
    const results = await db.query(
      `SELECT id, comp_code
             FROM invoices`);

    return res.json(results.rows);
  }

  catch (err) {
    return next(err);
  }
});


/** Get invoices by id */

router.get("/invoices/:id", async function (req, res, next) {
  try {

    const input_id = req.params.id;

    const results = await db.query(
      `SELECT id, amt, paid, add_date, paid_date, comp_code, name, description
            FROM invoices
            JOIN companies ON comp_code = companies.code
            WHERE id=$1`, [input_id]);

    if (results.rows.length === 0) {
      throw new ExpressError("Your company could not be found!", 404);
    }

    let { id,
          amt,
          paid,
          add_date,
          paid_date,
          ...company } = results.rows[0] //<-- loook so smarttt

    let invoice = {
        id,
        amt,
        paid,
        add_date,
        paid_date,
        company
      }

    return res.json(invoice);
  }

  catch (err) {
    return next(err);
  }
});


/** Adding a new invoice */

router.post("/invoices", async function (req, res, next) {

  try {
    const { comp_code, amt} = req.body;

    if (!comp_code || !amt) {
      throw new ExpressError("Code and Amount are required!", 400);
    }

    const results = await db.query(
      `INSERT INTO invoices (comp_code, amt)
      VALUES ($1, $2)
      RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt]);

    return res.json(results.rows[0]);
  }

  catch (err) {
    return next(err);
  }
});


/** Put company. Update a compnay */

router.put("/companies/:code", async function (req, res, next) {
  try {
    const code = req.params.code;
    const { name, description } = req.body;

    const results = await db.query(
      `UPDATE companies
             SET name=$1, description=$2
             WHERE code=$3
             RETURNING code, name, description`, [name, description, code]);

    if (results.rows.length !== 1) {
      throw new ExpressError("Company does not exist", 404);
    }

    return res.json(results.rows[0]);
  }

  catch (err) {
    return next(err);
  }
});


/** Delete company. */

router.delete("/companies/:code", async function (req, res, next) {
  try {
    const code = req.params.code;

    // const checkResult = await db.query(`SELECT code FROM companies WHERE code=$1`, [code]);
    // if( checkResult.rows.length === 0) {
    //   throw new ExpressError("Company does not exist", 404);
    // }

    const results = await db.query(
      `DELETE FROM companies
             WHERE code=$1
             RETURNING code`, [code]);

    if (results.rows.length !== 1) {
      throw new ExpressError("Company does not exist", 404);
    }

    return res.json({ status: "deleted" });
  }

  catch (err) {
    return next(err);
  }
});



module.exports = router