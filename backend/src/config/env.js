require('dotenv').config();

function required(name, fallback) {
  const val = process.env[name] ?? fallback;
  return val;
}

module.exports = {
  PORT: Number(process.env.PORT || 5000),
  NODE_ENV: process.env.NODE_ENV || 'development',

  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: Number(process.env.DB_PORT || 5432),
  DB_NAME: process.env.DB_NAME || 'showroom_db',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DATABASE_URL: process.env.DATABASE_URL || null,
  DB_SSL: process.env.DB_SSL === 'true',

  JWT_SECRET: required('JWT_SECRET', 'dev_secret_change_me'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',

  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
};
