const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// The PDF guide's "Vehicle" entity — kept as the existing project's
// "cars" naming/table/routes per the frontend README's note.
const STATUS = ['Available', 'Reserved', 'Sold', 'Inactive'];

const Vehicle = sequelize.define(
  'Vehicle',
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    make: { type: DataTypes.STRING, allowNull: false },
    model: { type: DataTypes.STRING, allowNull: false },
    year: { type: DataTypes.INTEGER, allowNull: false },
    variant: { type: DataTypes.STRING, allowNull: true },
    purchaseRate: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
    sellingPrice: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
    colors: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    fuel: { type: DataTypes.STRING, allowNull: true },
    transmission: { type: DataTypes.STRING, allowNull: true },
    mileage: { type: DataTypes.STRING, allowNull: true },
    engine: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    images: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    status: { type: DataTypes.ENUM(...STATUS), allowNull: false, defaultValue: 'Available' },
    featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    supplierId: { type: DataTypes.STRING, allowNull: true },
  },
  { tableName: 'vehicles' }
);

Vehicle.STATUS = STATUS;

module.exports = Vehicle;
