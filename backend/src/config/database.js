const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  const dbName = process.env.DB_NAME || process.env.JAWSDB_NAME;
  const dbUser = process.env.DB_USER || process.env.JAWSDB_USERNAME;
  const dbPassword = process.env.DB_PASSWORD || process.env.JAWSDB_PASSWORD;
  const dbHost = process.env.DB_HOST || process.env.JAWSDB_HOST;
  const dbPort = process.env.DB_PORT || 5432;

  sequelize = new Sequelize(
    dbName,
    dbUser,
    dbPassword,
    {
      host: dbHost,
      port: dbPort,
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    }
  );
}

module.exports = sequelize;
