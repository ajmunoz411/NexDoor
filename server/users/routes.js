const express = require('express');

const userCtrl = require('./controllers');

const users = express.Router();

users
  .get('/info/:userId', userCtrl.getUser)
  .get('/rating/:quantity', userCtrl.getUsersByRating)
  .get('/rangerating/:quantity/:userId/:range', userCtrl.getUsersInRangeByRating)
  .post('/', userCtrl.addUser);

module.exports = users;
