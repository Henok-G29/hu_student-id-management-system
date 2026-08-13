require("dotenv").config();

const env = {
  port: Number(process.env.PORT) || 3000,

  database: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
};

module.exports = env;
