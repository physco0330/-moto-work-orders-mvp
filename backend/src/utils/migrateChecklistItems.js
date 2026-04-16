const { sequelize } = require('../models');

const migrateChecklistItems = async () => {
  try {
    const result = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'ChecklistItems'
      );
    `, { type: sequelize.QueryTypes.SELECT });

    if (result[0].exists) {
      console.log('Tabla ChecklistItems ya existe');
      return;
    }

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

    console.log('Tabla ChecklistItems creada con datos');
  } catch (error) {
    console.error('Error migrando ChecklistItems:', error.message);
  }
};

module.exports = migrateChecklistItems;