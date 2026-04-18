const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

async function runMigrations() {
  console.log('🔄 Verificando migraciones de base de datos...');
  
  try {
    // Verificar si existe la columna 'active' en clients
    const clientColumns = await sequelize.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'clients' AND column_name = 'active'
    `, { type: QueryTypes.SELECT });
    
    if (clientColumns.length === 0) {
      console.log('➕ Agregando columna "active" a clients...');
      await sequelize.query(`
        ALTER TABLE clients ADD COLUMN active BOOLEAN DEFAULT true
      `);
      console.log('✅ Columna "active" agregada a clients');
    } else {
      console.log('✅ Columna "active" ya existe en clients');
    }

    // Verificar si existe la columna 'hours' en bikes
    const bikeColumns = await sequelize.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'bikes' AND column_name = 'hours'
    `, { type: QueryTypes.SELECT });
    
    if (bikeColumns.length === 0) {
      console.log('➕ Agregando columna "hours" a bikes...');
      await sequelize.query(`
        ALTER TABLE bikes ADD COLUMN hours DECIMAL(10,2)
      `);
      console.log('✅ Columna "hours" agregada a bikes');
    } else {
      console.log('✅ Columna "hours" ya existe en bikes');
    }

    // Verificar si existe la tabla de relación checklist
    const checklistRelationExists = await sequelize.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name = 'WorkOrderChecklistItems'
    `, { type: QueryTypes.SELECT });
    
    if (checklistRelationExists.length === 0) {
      console.log('➕ Creando tabla WorkOrderChecklistItems...');
      await sequelize.query(`
        CREATE TABLE "WorkOrderChecklistItems" (
          id SERIAL PRIMARY KEY,
          work_order_id INTEGER NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
          checklist_item_id INTEGER NOT NULL REFERENCES checklist_items(id) ON DELETE CASCADE,
          checked BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(work_order_id, checklist_item_id)
        )
      `);
      console.log('✅ Tabla WorkOrderChecklistItems creada');
    } else {
      console.log('✅ Tabla WorkOrderChecklistItems ya existe');
    }

    console.log('🎉 Migraciones completadas');
  } catch (error) {
    console.error('❌ Error en migraciones:', error.message);
  }
}

module.exports = runMigrations;