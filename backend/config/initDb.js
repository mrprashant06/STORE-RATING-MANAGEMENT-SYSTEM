const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const initDatabase = async (forceReseed = false) => {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || 'root';
  const port = parseInt(process.env.DB_PORT, 10) || 3306;
  const dbName = process.env.DB_NAME || 'store_rating_db';

  console.log('🔄 Initializing Store Rating Database (Bangalore / India Edition)...');
  console.log(`Connecting to MySQL server at ${host}:${port}...`);

  // Step 1: Connect to MySQL root
  const rootConn = await mysql.createConnection({
    host,
    user,
    password,
    port
  });

  // Step 2: Create database if it does not exist
  await rootConn.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );
  console.log(`✅ Database "${dbName}" verified or created.`);
  await rootConn.end();

  // Step 3: Connect directly to the database
  const dbConn = await mysql.createConnection({
    host,
    user,
    password,
    port,
    database: dbName
  });

  // Step 4: Create 'users' table
  await dbConn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(60) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      address VARCHAR(400) NOT NULL,
      role ENUM('ADMIN', 'USER', 'OWNER') NOT NULL DEFAULT 'USER',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_users_role (role),
      INDEX idx_users_email (email),
      INDEX idx_users_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✅ Table "users" verified or created.');

  // Step 5: Create 'stores' table
  await dbConn.query(`
    CREATE TABLE IF NOT EXISTS stores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(60) NOT NULL,
      email VARCHAR(255) NOT NULL,
      address VARCHAR(400) NOT NULL,
      owner_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
      INDEX idx_stores_owner (owner_id),
      INDEX idx_stores_name (name),
      INDEX idx_stores_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✅ Table "stores" verified or created.');

  // Step 6: Create 'ratings' table
  await dbConn.query(`
    CREATE TABLE IF NOT EXISTS ratings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      store_id INT NOT NULL,
      rating TINYINT UNSIGNED NOT NULL CHECK (rating >= 1 AND rating <= 5),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_store_rating (user_id, store_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE ON UPDATE CASCADE,
      INDEX idx_ratings_store (store_id),
      INDEX idx_ratings_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✅ Table "ratings" verified or created.');

  // Step 7: Clear tables if re-seeding requested
  if (forceReseed || process.argv.includes('--force') || process.argv.includes('--seed-fresh')) {
    console.log('🧹 Clearing existing records to apply fresh Bangalore demo dataset...');
    await dbConn.query('SET FOREIGN_KEY_CHECKS = 0');
    await dbConn.query('TRUNCATE TABLE ratings');
    await dbConn.query('TRUNCATE TABLE stores');
    await dbConn.query('TRUNCATE TABLE users');
    await dbConn.query('SET FOREIGN_KEY_CHECKS = 1');
  }

  // Step 8: Seed Indian users and Bangalore locations if users table is empty
  const [usersCount] = await dbConn.query('SELECT COUNT(*) as count FROM users');
  if (usersCount[0].count === 0) {
    console.log('🌱 Seeding Bangalore / Indian demo dataset...');

    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('Admin@12345', salt);
    const ownerPasswordHash = await bcrypt.hash('Owner@12345', salt);
    const userPasswordHash = await bcrypt.hash('User@12345', salt);

    // 1. Seed System Administrator (Prashant Choudhary)
    const [adminResult] = await dbConn.query(
      `INSERT INTO users (name, email, password, address, role) 
       VALUES (?, ?, ?, ?, 'ADMIN')`,
      [
        'Prashant Choudhary Admin Head', // 28 chars
        'admin@bengalurustores.in',
        adminPasswordHash,
        'Level 14, WeWork Galaxy, 43 Residency Road, Shanthala Nagar, Ashok Nagar, Bengaluru, Karnataka 560025'
      ]
    );

    // 2. Seed Store Owner 1 (Rajesh Kumar Venkatachalam)
    const [owner1Result] = await dbConn.query(
      `INSERT INTO users (name, email, password, address, role) 
       VALUES (?, ?, ?, ?, 'OWNER')`,
      [
        'Rajesh Kumar Venkatachalam', // 26 chars
        'rajesh@koramangalatech.in',
        ownerPasswordHash,
        'Plot No. 124, 5th Main Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034'
      ]
    );

    // 3. Seed Store Owner 2 (Ananya Swaminathan Krishnan)
    const [owner2Result] = await dbConn.query(
      `INSERT INTO users (name, email, password, address, role) 
       VALUES (?, ?, ?, ?, 'OWNER')`,
      [
        'Ananya Swaminathan Krishnan', // 27 chars
        'ananya@indiranagarorganic.in',
        ownerPasswordHash,
        'Villa 18, Palm Meadows, ITPL Main Road, Whitefield, Bengaluru, Karnataka 560066'
      ]
    );

    // 4. Seed Normal User 1 (Priyanka Radhakrishnan Iyer)
    const [user1Result] = await dbConn.query(
      `INSERT INTO users (name, email, password, address, role) 
       VALUES (?, ?, ?, ?, 'USER')`,
      [
        'Priyanka Radhakrishnan Iyer', // 27 chars
        'priyanka@bengaluruhub.in',
        userPasswordHash,
        'Flat 402, Sobha Iris, Outer Ring Road, Devarabisanahalli, Bellandur, Bengaluru, Karnataka 560103'
      ]
    );

    // 5. Seed Normal User 2 (Siddharth Ramesh Narayanan)
    const [user2Result] = await dbConn.query(
      `INSERT INTO users (name, email, password, address, role) 
       VALUES (?, ?, ?, ?, 'USER')`,
      [
        'Siddharth Ramesh Narayanan', // 26 chars
        'siddharth@bengaluruhub.in',
        userPasswordHash,
        'House No. 56, 14th Main, 7th Sector, HSR Layout, Bengaluru, Karnataka 560102'
      ]
    );

    // 6. Seed Bangalore Store 1 (Koramangala Tech Store)
    const [store1Result] = await dbConn.query(
      `INSERT INTO stores (name, email, address, owner_id) 
       VALUES (?, ?, ?, ?)`,
      [
        'Koramangala Tech Gadgets MegaStore', // 34 chars
        'contact@koramangalatech.in',
        'Shop No. 12, Ground Floor, 80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034',
        owner1Result.insertId
      ]
    );

    // 7. Seed Bangalore Store 2 (Indiranagar Organic Supermarket)
    const [store2Result] = await dbConn.query(
      `INSERT INTO stores (name, email, address, owner_id) 
       VALUES (?, ?, ?, ?)`,
      [
        'Indiranagar Organic Farms Supermarket', // 37 chars
        'care@indiranagarorganic.in',
        '452, 100 Feet Road, 12th Main Junction, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
        owner2Result.insertId
      ]
    );

    // 8. Seed Demo Ratings
    // Priyanka rates Koramangala Store (5 stars)
    await dbConn.query(
      `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)`,
      [user1Result.insertId, store1Result.insertId, 5]
    );

    // Siddharth rates Koramangala Store (4 stars)
    await dbConn.query(
      `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)`,
      [user2Result.insertId, store1Result.insertId, 4]
    );

    // Priyanka rates Indiranagar Store (5 stars)
    await dbConn.query(
      `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)`,
      [user1Result.insertId, store2Result.insertId, 5]
    );

    console.log('🎉 Bangalore Demo Dataset Seeded Successfully:');
    console.log('   👑 ADMIN: admin@bengalurustores.in / Admin@12345 (Prashant Choudhary Admin Head)');
    console.log('   🏪 OWNER: rajesh@koramangalatech.in / Owner@12345 (Rajesh Kumar Venkatachalam)');
    console.log('   🏪 OWNER: ananya@indiranagarorganic.in / Owner@12345 (Ananya Swaminathan Krishnan)');
    console.log('   👤 USER : priyanka@bengaluruhub.in / User@12345 (Priyanka Radhakrishnan Iyer)');
    console.log('   👤 USER : siddharth@bengaluruhub.in / User@12345 (Siddharth Ramesh Narayanan)');
  } else {
    console.log('ℹ️ Users table already populated. Run with --force to overwrite.');
  }

  await dbConn.end();
  console.log('✨ Database initialization finished successfully!');
};

if (require.main === module) {
  initDatabase(true)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Database Initialization Failed:', err);
      process.exit(1);
    });
}

module.exports = initDatabase;
