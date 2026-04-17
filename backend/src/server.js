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
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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

        const columnsResult = await sequelize.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = 'work_orders' AND table_schema = 'public';
        `, { type: sequelize.QueryTypes.SELECT });

        const columns = columnsResult.map(c => c.column_name);
        
        if (!columns.includes('service_type')) {
          console.log('Adding new columns to work_orders...');
          await sequelize.query(`ALTER TABLE work_orders ADD COLUMN service_type VARCHAR(100);`);
          await sequelize.query(`ALTER TABLE work_orders ADD COLUMN pilot_name VARCHAR(100);`);
          await sequelize.query(`ALTER TABLE work_orders ADD COLUMN hours_registered DECIMAL(10,2) DEFAULT 0;`);
          await sequelize.query(`ALTER TABLE work_orders ADD COLUMN hours_used DECIMAL(10,2) DEFAULT 0;`);
          console.log('New columns added to work_orders');
        }

        const bikeColumnsResult = await sequelize.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = 'bikes' AND table_schema = 'public';
        `, { type: sequelize.QueryTypes.SELECT });

        const bikeColumns = bikeColumnsResult.map(c => c.column_name);
        
        if (!bikeColumns.includes('year')) {
          console.log('Adding year and hours columns to bikes...');
          await sequelize.query(`ALTER TABLE bikes ADD COLUMN year INTEGER;`);
          await sequelize.query(`ALTER TABLE bikes ADD COLUMN hours DECIMAL(10,2);`);
          console.log('New columns added to bikes');
        }

        const checklistTable = await sequelize.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name = 'WorkOrderChecklistItems'
          );
        `, { type: sequelize.QueryTypes.SELECT });

        if (!checklistTable[0].exists) {
          console.log('Creating WorkOrderChecklistItems table...');
          await sequelize.query(`
            CREATE TABLE "WorkOrderChecklistItems" (
              id SERIAL PRIMARY KEY,
              work_order_id INTEGER NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
              checklist_item_id INTEGER NOT NULL REFERENCES "ChecklistItems"(id) ON DELETE CASCADE,
              checked BOOLEAN DEFAULT false
            );
          `);
          console.log('WorkOrderChecklistItems table created');
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
