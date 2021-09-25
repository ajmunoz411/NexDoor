/* eslint-disable spaced-comment */
/* eslint-disable max-len */
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const session = require('express-session');
const db = require('../../db/index');

const userModels = {
  addUser: async (body) => {
    const {
      streetAddress,
      city,
      state,
      zipcode,
      coordinate,
      neighborhood,
      firstName,
      lastName,
      hashPass,
      email,
      imgUrl,
    } = body;

    const queryStr = `
      WITH X AS (
        INSERT INTO nexdoor.address (
          street_address,
          city,
          state,
          zipcode,
          neighborhood,
          coordinate
        )
        VALUES (
          '${streetAddress}',
          '${city}',
          '${state}',
          ${zipcode},
          '${neighborhood}',
          ${coordinate}
        )
        RETURNING address_id
      )
      INSERT INTO nexdoor.users (
        firstname,
        lastname,
        password,
        email,
        address_id,
        karma,
        task_count,
        avg_rating,
        profile_picture_url,
        acct_created_timestamp
      )
      SELECT
        '${firstName}',
        '${lastName}',
        '${hashPass}',
        '${email}',
        address_id,
        0,
        0,
        null,
        '${imgUrl}',
        (SELECT CURRENT_TIMESTAMP)
      FROM X
      RETURNING
        user_id, firstname, lastname, email, address_id, karma, task_count, avg_rating, profile_picture_url
    `;

    const data = await db.query(queryStr);
    const user = data.rows[0];
    return user;
  },

  getUser: async (userId) => {
    const queryStr = `
      SELECT
        user_id,
        firstname,
        lastname,
        email,
        karma,
        task_count,
        avg_rating,
        profile_picture_url, (
          SELECT ROW_TO_JSON(add)
          FROM (
            SELECT
              street_address,
              city,
              state,
              zipcode,
              neighborhood
            FROM nexdoor.address
            WHERE address_id=nexdoor.users.address_id
          ) add
        ) as address
      FROM nexdoor.users
      WHERE user_id=${userId};
    `;

    const data = await db.query(queryStr);
    const user = data.rows[0];
    return user;
  },

  getUsersByRating: async (quantity) => {
    const queryStr = `
      SELECT
        user_id,
        firstname,
        lastname,
        address_id,
        karma,
        task_count,
        avg_rating,
        profile_picture_url,
        (
          SELECT ARRAY_TO_JSON(ARRAY_AGG(reviews))
          FROM (
            SELECT *
            FROM nexdoor.reviews
            WHERE helper_id=nexdoor.users.user_id
          ) reviews
        ) as reviews
      FROM nexdoor.users
      ORDER BY avg_rating
      LIMIT ${quantity}
    `;
    const data = await db.query(queryStr);
    const users = data.rows;
    return users;
  },

  getUsersInRangeByRating: async (params) => {
    const { userId, range, quantity } = params;

    const queryStr = `
      SELECT
        user_id,
        firstname,
        lastname,
        address_id,
        karma,
        task_count,
        avg_rating,
        profile_picture_url,
        (
          SELECT ARRAY_TO_JSON(ARRAY_AGG(reviews))
          FROM (
            SELECT *
            FROM nexdoor.reviews
            WHERE helper_id=nexdoor.users.user_id
          ) reviews
        ) as reviews
      FROM nexdoor.users
      WHERE
        (
          (
            SELECT coordinate
            FROM nexdoor.address
            WHERE address_id=
            (
              SELECT address_id
              FROM nexdoor.users
              WHERE user_id=${userId}
            )
          )
          <@>
          (
            SELECT coordinate
            FROM nexdoor.address
            WHERE address_id=nexdoor.users.address_id
          ) < ${range}
        )
      ORDER BY avg_rating
      LIMIT ${quantity}
    `;

    const data = await db.query(queryStr);
    const users = data.rows;
    return users;
  },

  checkForEmail: async (email) => {
    const queryStr = `
      SELECT EXISTS (
        SELECT true FROM nexdoor.users
        WHERE email='${email}'
        LIMIT 1
      )
    `;

    const data = await db.query(queryStr);
    const result = data.rows[0].exists;
    return result;
  },

  getUserCredentials: async (userId) => {
    const queryStr = `
      SELECT email, password
      FROM nexdoor.users
      WHERE user_id=${userId}
    ;`;

    const data = await db.query(queryStr);
    const credentials = data.rows[0];
    return credentials;
  },

  authenticateLogin: async (body) => {
    const { email, password } = body;
    const queryStr = `
      SELECT user_id, password
      FROM nexdoor.users
      WHERE email='${email}'
    ;`;

    const data = await db.query(queryStr);
    const userId = data.rows[0].user_id;
    const passwordDB = data.rows[0].password;
    const match = bcrypt.compareSync(password, passwordDB);
    return {
      userId,
      match,
    };
  },
};

module.exports = userModels;
