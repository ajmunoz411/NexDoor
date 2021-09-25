const express = require('express');

const announcementCtrl = require('./controllers');

const announcements = express.Router();

announcements
  .get('/:quantity', announcementCtrl.getAnnouncements)
  .post('/:userId', announcementCtrl.addAnnouncement);

module.exports = announcements;
