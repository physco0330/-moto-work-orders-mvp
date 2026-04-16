const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
const dbName = process.env.MYSQL_DATABASE || process.env.DB_NAME || process.env.JAWSDB_NAME;
const dbUser = process.env.MYSQL_USER || process.env.DB_USER || process.env.JAWSDB_USERNAME;
const dbPassword = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || process.env.JAWSDB_PASSWORD;
const dbHost = process.env.MYSQLHOST || process.env.DB_HOST || process.env.JAWSDB_HOST;
const dbPort = process.env.MYSQLPORT || process.env.DB_PORT || 3306;

let sequelize;
if (dbUrl) {
  sequelize = new Sequelize(dbUrl, {
    dialect: 'mysql',
    logging: false,
  });
} else {
  sequelize = new Sequelize(
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
}

module.exports = sequelize;
