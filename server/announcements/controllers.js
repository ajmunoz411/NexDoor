/* eslint-disable max-len */
/* eslint-disable spaced-comment */
const announcementsService = require('./service');

/*________________________________________________________________
TABLE OF CONTENTS
- Add an announcement: 10 - 57
- Get x # of announcements: 59 - 93
________________________________________________________________*/
const announcementControllers = {
  // *************************************************************
  // ADD ANNOUNCEMENT
  // *************************************************************
  //   Needs from Front End - UserId (optional), defaults to null
  //   Returns - String confirmation
  // *************************************************************
  /*
    POST api/announce/${userId}
    req.body = {
      "announcementBody": "There was a robbery at 123 East Main Street last night",
      "date": "10/17/2020",
      "time": "05:25"
    }
    res = '{
      "announcement_id": 11
    }'
  */
  // *************************************************************
  addAnnouncement: async (req, res) => {
    const { userId } = req.params || null;
    const {
      announcementBody,
      date,
      time,
    } = req.body;

    try {
      const insertId = await announcementsService.addAnnouncement(userId, announcementBody, date, time);
      res.status(200).send(insertId);
    } catch (err) {
      res.status(400).send(err.stack);
    }
  },
  // *************************************************************

  // *************************************************************
  // GET ANNOUNCEMENTS
  // *************************************************************
  /*
    GET /api/announce/:quantity
    req.body = none
    res =
      [
        {
          "announcement_id": 5,
          "user_id": 16,
          "announcement_body": "There has been a break-in on Frankline street",
          "date": "2021-07-20T07:00:00.000Z",
          "time": "06:15:00"
        },
        ....
      ]
  */
  // *************************************************************
  getAnnouncements: async (req, res) => {
    const { quantity } = req.params || 25;

    try {
      const announcements = await announcementsService.getAnnouncements(quantity);
      res.status(200).send(announcements);
    } catch (err) {
      res.status(400).send(err.stack);
    }
  },
  // *************************************************************
};

module.exports = announcementControllers;
