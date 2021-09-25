const express = require('express');

const userCtrl = require('./controllers');

const users = express.Router();

users
  .get('/info/:userId', userCtrl.getUser)
  .get('/rating/:quantity', userCtrl.getUsersByRating)
  .get('/rangerating/:quantity/:userId/:range', userCtrl.getUsersInRangeByRating)
  .get('/email', userCtrl.checkForEmail)
  .get('/credentials/:userId', userCtrl.getUserCredentials)
  .get('/session', userCtrl.authenticateSession)
  .get('/login', userCtrl.authenticateLogin)
  .post('/', userCtrl.addUser);

module.exports = users;
