const { Model, DataTypes } = require('sequelize');

class ChecklistItem extends Model {
  static associate(models) {
  }
}

module.exports = (sequelize) => {
  ChecklistItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'ChecklistItem',
      tableName: 'ChecklistItems',
      timestamps: false,
    }
  );

  return ChecklistItem;
};