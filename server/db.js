require("dotenv").config();
const { Pool } = require("pg");

console.log(process.env.PGPASSWORD);

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

module.exports = pool;
