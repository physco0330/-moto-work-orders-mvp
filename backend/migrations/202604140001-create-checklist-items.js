module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ChecklistItems', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.bulkInsert('ChecklistItems', [
      { name: 'Lavada de moto' },
      { name: 'Limpieza filtro de aire' },
      { name: 'Revisión de frenos' },
      { name: 'Tensión de cadena' },
      { name: 'Revisión de radios' },
      { name: 'Revisión de suspensión' },
      { name: 'Revisión de maniguetas y controles' },
      { name: 'Revisión de plásticos' },
      { name: 'Lubricación de partes móviles' },
      { name: 'Revisión nivel de aceite 2t' },
      { name: 'Revisión nivel de refrigerante' },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ChecklistItems');
  },
};