/**
 * Database Initialization Script Runner
 * Can be run directly via: node database/initDb.js
 */
const path = require('path');
const initDatabase = require(path.resolve(__dirname, '../backend/config/initDb.js'));

if (require.main === module) {
  initDatabase(true)
    .then(() => {
      console.log('✅ Database setup and Bangalore seed data successfully applied.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Database Initialization Error:', err);
      process.exit(1);
    });
}

module.exports = initDatabase;
