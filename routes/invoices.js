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

    return res.json({invoices: results.rows});
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

    return res.json({invoice});
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

    return res.json({invoice:results.rows[0]});
  }

  catch (err) {
    return next(err);
  }
});


/** Put invoice. Update an invoice */

router.put("/invoices/:id", async function (req, res, next) {
  try {
    const inputId = req.params.id;
    const { amt } = req.body;

    const results = await db.query(
      `UPDATE invoices
             SET amt=$1
             WHERE id=$2
             RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, inputId]);

    if (results.rows.length !== 1) {
      throw new ExpressError("Invoice does not exist", 404);
    }

    return res.json({invoice:results.rows[0]});
  }

  catch (err) {
    return next(err);
  }
});


/** Delete invoice. */

router.delete("/invoices/:id", async function (req, res, next) {
  try {
    const inputId = req.params.id;

    const results = await db.query(
      `DELETE FROM invoices
             WHERE id=$1
             RETURNING id`, [inputId]);

    if (results.rows.length !== 1) {
      throw new ExpressError("Invoice does not exist", 404);
    }

    return res.json({ status: "deleted" });
  }

  catch (err) {
    return next(err);
  }
});



module.exports = router