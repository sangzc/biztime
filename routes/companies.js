const db = require("../db");
const express = require("express");
const ExpressError = require("../expressError");

const router = new express.Router();

/** (Fixed) Get users: [user, user, user] */

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


/** (Fixed) Get users: [user, user, user] */

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


  /** (Fixed) Get users: [user, user, user] */

router.get("/", async function (req, res, next) {
    try {
      const results = await db.query(
            `SELECT id, name, type FROM users`);
  
      return res.json(results.rows);
    }
  
    catch (err) {
      return next(err);
    }
  });


  /** (Fixed) Get users: [user, user, user] */

router.get("/", async function (req, res, next) {
    try {
      const results = await db.query(
            `SELECT id, name, type FROM users`);
  
      return res.json(results.rows);
    }
  
    catch (err) {
      return next(err);
    }
  });


  /** (Fixed) Get users: [user, user, user] */

router.get("/", async function (req, res, next) {
    try {
      const results = await db.query(
            `SELECT id, name, type FROM users`);
  
      return res.json(results.rows);
    }
  
    catch (err) {
      return next(err);
    }
  });

  /** (Fixed) Get users: [user, user, user] */

router.get("/", async function (req, res, next) {
    try {
      const results = await db.query(
            `SELECT id, name, type FROM users`);
  
      return res.json(results.rows);
    }
  
    catch (err) {
      return next(err);
    }
  });
  module.exports = router