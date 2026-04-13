const app = require('./app');
const sequelize = require('./config/database');
require('dotenv').config();

const PORT = process.env.PORT || 4000;

// Levanta el servidor solo cuando la DB responde correctamente.
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexion a base de datos establecida');

    app.listen(PORT, () => {
      console.log(`Servidor ejecutandose en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('No fue posible iniciar el servidor:', error.message);
    process.exit(1);
  }
};

start();
