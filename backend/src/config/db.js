const { Sequelize } = require('sequelize');
const env = require('./env');

const commonOptions = {
  dialect: 'postgres',
  logging: env.NODE_ENV === 'development' ? false : false,
  define: {
    freezeTableName: false,
  },
  dialectOptions: env.DB_SSL
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
};

const sequelize = env.DATABASE_URL
  ? new Sequelize(env.DATABASE_URL, commonOptions)
  : new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
      host: env.DB_HOST,
      port: env.DB_PORT,
      ...commonOptions,
    });

module.exports = sequelize;
