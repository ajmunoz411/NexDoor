const db = require('../../db/index');

const announcementModels = {
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
    res = 'Added announcement to db'
  */
  // *************************************************************
  addAnnouncement: async (userId, announcementBody, date, time) => {
    // const { userId } = req.params || null;
    // const {
    //   announcementBody,
    //   date,
    //   time,
    // } = req.body;

    const queryStr = `
      INSERT INTO nexdoor.announcements (
        user_id,
        announcement_body,
        date,
        time
      )
      VALUES (
        ${userId},
        '${announcementBody}',
        '${date}',
        '${time}'
      )
      RETURNING announcement_id
    `;

    // db.query(queryStr)
    //   .then(() => {
    //     res.status(200).send('Added announcement to db');
    //   })
    //   .catch((err) => {
    //     res.status(400).send(err.stack);
    //   });
    const insert = await db.query(queryStr);
    const insertId = insert.rows[0];
    return insertId;
  },
  // *************************************************************
};

module.exports = announcementModels;
