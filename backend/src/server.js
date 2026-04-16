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
        const result = await sequelize.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name = 'ChecklistItems'
          );
        `, { type: sequelize.QueryTypes.SELECT });

        if (!result[0].exists) {
          console.log('Creating ChecklistItems table...');
          await sequelize.query(`
            CREATE TABLE "ChecklistItems" (
              id SERIAL PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              active BOOLEAN DEFAULT true,
              "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
          `);

          await sequelize.query(`
            INSERT INTO "ChecklistItems" (name) VALUES
            ('Lavada de moto'),
            ('Limpieza filtro de aire'),
            ('Revisión de frenos'),
            ('Tensión de cadena'),
            ('Revisión de radios'),
            ('Revisión de suspensión'),
            ('Revisión de maniguetas y controles'),
            ('Revisión de plásticos'),
            ('Lubricación de partes móviles'),
            ('Revisión nivel de aceite 2t'),
            ('Revisión nivel de refrigerante');
          `);
          console.log('ChecklistItems table created with data');
        } else {
          console.log('ChecklistItems table already exists');
        }
      } catch (e) {
        console.log('Migrations error:', e.message);
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
