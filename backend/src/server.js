const app = require('./app');
const env = require('./config/env');
const sequelize = require('./config/db');
require('./models'); // registers all models + associations

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✔ Database connection established.');

    // Dev convenience: keep tables in sync automatically. In
    // production, prefer `npm run db:migrate` run explicitly instead
    // of syncing on every boot.
    await sequelize.sync();
    console.log('✔ Models synced.');

    app.listen(env.PORT, () => {
      console.log(`✔ Showroom Management System API listening on port ${env.PORT} (${env.NODE_ENV})`);
    });
  } catch (err) {
    console.error('✘ Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
