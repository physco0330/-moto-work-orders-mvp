require('dotenv').config();

const getDbConfig = () => {
  const ssl = process.env.NODE_ENV === 'production' ? { ssl: { require: true, rejectUnauthorized: false } } : {};
  
  if (process.env.DATABASE_URL) {
    return { url: process.env.DATABASE_URL, dialect: 'postgres', ...ssl };
  }
  
  return {
    username: process.env.DB_USER || process.env.JAWSDB_USERNAME,
    password: process.env.DB_PASSWORD || process.env.JAWSDB_PASSWORD,
    database: process.env.DB_NAME || process.env.JAWSDB_NAME,
    host: process.env.DB_HOST || process.env.JAWSDB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    ...ssl,
  };
};

module.exports = {
  development: getDbConfig(),
  test: getDbConfig(),
  production: getDbConfig(),
};
