
require("dotenv").config();
const mysql = require("mysql2/promise");

const dbConfig = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

if (process.env.DB_SSL === "true") {
    dbConfig.ssl = {
        rejectUnauthorized: true,
        ...(process.env.DB_SSL_CA ? { ca: process.env.DB_SSL_CA } : {})
    };
}

const db = mysql.createPool(dbConfig);
module.exports = db;