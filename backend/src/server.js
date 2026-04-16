const app = require('./app');
const sequelize = require('./config/database');
const { execSync } = require('child_process');
require('dotenv').config();

const PORT = process.env.PORT || 4000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexion a base de datos establecida');

    if (process.env.NODE_ENV === 'production') {
      try {
        console.log('Running migrations...');
        execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
        console.log('Running seeds...');
        execSync('npx sequelize-cli db:seed:all', { stdio: 'inherit' });
      } catch (e) {
        console.log('Migrations/seeds may already be done or failed:', e.message);
      }
    }

    app.listen(PORT, () => {
      console.log(`Servidor ejecutandose en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('No fue posible iniciar el servidor:', error.message);
    process.exit(1);
  }
};

start();
