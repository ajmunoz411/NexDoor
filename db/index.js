const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DB,
  password: process.env.DB_PASS,
  allowExitOnIdle: true,
  port: 5432,
});

module.exports = {
  query: (text, params, callback) => pool.query(text, params, callback),
};
