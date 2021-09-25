const express = require('express');

const login = express.Router();
const { check, validationResult } = require('express-validator');
const session = require('express-session');
const users = require('../users/controllers');

login.post('/',
  [
    check('email')
      .not()
      .isEmpty()
      .isEmail()
      .withMessage('A valid email address is required'),
    check('password')
      .not()
      .isEmpty()
      .withMessage('Please enter password'),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    if (!req.session || !req.session.userId) {
      users.authenticateLogin(req, res);
    } else if (req.session) {
      res.status(200).send('success using a session!');
    }
  });

module.exports = login;
