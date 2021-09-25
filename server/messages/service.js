const db = require('../../db/index');

const messagesModels = {
  addMessage: async (params, body) => {
    const { taskId, userId } = params;
    const {
      messageBody,
      date,
      time,
      imgUrl,
    } = body;

    const queryStr = `
      INSERT INTO nexdoor.messages
      (
        task_id,
        user_id,
        message_body,
        date,
        time,
        photo_url
      )
      VALUES
      (
        ${taskId},
        ${userId},
        '${messageBody}',
        '${date}',
        '${time}',
        '${imgUrl}'
      )
      RETURNING message_id;
    ;`;

    const data = await db.query(queryStr);
    const insertId = data.rows[0];
    return insertId;
  },

  getMessagesByTask: async (taskId) => {
    const queryStr = `
      SELECT
        nexdoor.users.user_id,
        firstname,
        lastname,
        message_body,
        date,
        time,
        profile_picture_url
      FROM
        nexdoor.messages
      INNER JOIN
        nexdoor.users
        ON nexdoor.users.user_id=nexdoor.messages.user_id
      WHERE
        task_id=${taskId}
      ORDER BY
        date ASC,
        time ASC;
    `;

    const data = await db.query(queryStr);
    const messages = data.rows;
    return messages;
  },
};

module.exports = messagesModels;
