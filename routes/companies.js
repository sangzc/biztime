const db = require("../db");
const express = require("express");
const ExpressError = require("../expressError");

const router = new express.Router();

/** Get companies: [company, company, company] */

router.get("/companies", async function (req, res, next) {
    try {
      const results = await db.query(
            `SELECT code, name FROM companies`);

      return res.json(results.rows);
    }

    catch (err) {
      return next(err);
    }
  });


/** Get company */

router.get("/companies/:code", async function (req, res, next) {
    try {

      const code = req.params.code;
      const results = await db.query(
            `SELECT code, name, description
            FROM companies
            WHERE code=$1`, [code]);
      if (results.rows.length === 0) {
          throw new ExpressError("Your company could not be found!", 404);
      }
      return res.json(results.rows);
    }

    catch (err) {
      return next(err);
    }
  });


  /** Post company. Creates a company */

router.post("/companies", async function (req, res, next) {
  try {
    const { code, name, description } = req.body;

    if(!name || !code){
      throw new ExpressError("Name and Code are required!", 400);
    }

    const results = await db.query(
      `INSERT INTO companies (code, name, description)
      VALUES ($1, $2, $3)
      RETURNING code, name, description`, [code, name, description]);

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

      if(results.rows.length !== 1){
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

      if(results.rows.length !== 1){
        throw new ExpressError("Company does not exist", 404);
      }

      return res.json({status:"deleted"});
    }

    catch (err) {
      return next(err);
    }
  });



  module.exports = router