/* eslint-disable indent */
const router = require('express').Router();

const announcements = require('./announcements/routes');
const messages = require('./messages/routes');
const tasks = require('./tasks/routes');
const users = require('./users/routes');
const login = require('./login/login');
const newuser = require('./login/newuser');

router
  .use('/announce', announcements)
  .use('/messages', messages)
  .use('/tasks', tasks)
  .use('/users', users)
  .use('/login', login)
  .use('/newuser', newuser);

module.exports = router;
