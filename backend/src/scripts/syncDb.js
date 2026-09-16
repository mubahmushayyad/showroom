const sequelize = require('../config/db');
require('../models');

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('✔ Database schema synced.');
    process.exit(0);
  } catch (err) {
    console.error('✘ Sync failed:', err);
    process.exit(1);
  }
})();
