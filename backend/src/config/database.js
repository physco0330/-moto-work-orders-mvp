const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
const dbName = process.env.MYSQL_DATABASE || process.env.DB_NAME;
const dbUser = process.env.MYSQL_USER || process.env.DB_USER;
const dbPassword = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD;
const dbHost = process.env.MYSQLHOST || process.env.DB_HOST;
const dbPort = process.env.MYSQLPORT || process.env.DB_PORT || 3306;

const sequelize = new Sequelize(
  dbName,
  dbUser,
  dbPassword,
  {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = sequelize;
