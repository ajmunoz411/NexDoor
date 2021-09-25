const express = require('express');

const messageCtrl = require('./controllers');

const announcements = express.Router();

announcements
  .get('/:taskId', messageCtrl.getMessagesByTask)
  .post('/:taskId/:userId', messageCtrl.addMessage);

module.exports = announcements;
