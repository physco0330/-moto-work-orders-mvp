require('dotenv').config();

const getDbConfig = () => {
  const opts = {
    dialect: 'postgres',
    logging: false,
    define: {
      underscored: true,
      freezeTableName: true,
      quoteIdentifiers: false,
    },
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false,
    },
  };
  
  if (process.env.DATABASE_URL) {
    return { url: process.env.DATABASE_URL, ...opts };
  }
  
  return {
    username: process.env.DB_USER || process.env.JAWSDB_USERNAME,
    password: process.env.DB_PASSWORD || process.env.JAWSDB_PASSWORD,
    database: process.env.DB_NAME || process.env.JAWSDB_NAME,
    host: process.env.DB_HOST || process.env.JAWSDB_HOST,
    port: process.env.DB_PORT || 5432,
    ...opts,
  };
};

module.exports = {
  development: getDbConfig(),
  test: getDbConfig(),
  production: getDbConfig(),
};
