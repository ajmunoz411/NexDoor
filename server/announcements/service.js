const db = require('../../db/index');

const announcementModels = {
  addAnnouncement: async (userId, announcementBody, date, time) => {
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

    const data = await db.query(queryStr);
    const insertId = data.rows[0];
    return insertId;
  },

  getAnnouncements: async (quantity) => {
    const queryStr = `
      SELECT *
      FROM nexdoor.announcements
      LIMIT ${quantity}
    ;`;

    const data = await db.query(queryStr);
    const announcements = data.rows;
    return announcements;
  },
};

module.exports = announcementModels;
