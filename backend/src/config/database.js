const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

const pgOptions = {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false,
  },
  define: {
    underscored: true,
    freezeTableName: true,
    quoteIdentifiers: false,
  },
};

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, pgOptions);
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || process.env.JAWSDB_NAME,
    process.env.DB_USER || process.env.JAWSDB_USERNAME,
    process.env.DB_PASSWORD || process.env.JAWSDB_PASSWORD,
    {
      host: process.env.DB_HOST || process.env.JAWSDB_HOST,
      port: process.env.DB_PORT || 5432,
      ...pgOptions,
    }
  );
}

module.exports = sequelize;
