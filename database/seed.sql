-- ====================================================================
-- Seed Script: Store Rating Management System (Bangalore / India Edition)
-- Standalone SQL script for MySQL Workbench or mysql command line
-- All passwords are pre-hashed with bcrypt (Salt rounds = 10)
-- Default Passwords:
--   Admin: Admin@12345
--   Owner: Owner@12345
--   User : User@12345
-- ====================================================================

USE store_rating_db;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE ratings;
TRUNCATE TABLE stores;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------------------
-- Seed Users (Admins, Store Owners, Normal Users)
-- --------------------------------------------------------------------
INSERT INTO users (id, name, email, password, address, role) VALUES
(
  1,
  'Prashant Choudhary Admin Head',
  'admin@bengalurustores.in',
  '$2b$10$quOYFd4R7wd8YM7PVHo9TuO0KcwW5HBkRetCfHzgVtOJL4vNf/s2C',
  'Level 14, WeWork Galaxy, 43 Residency Road, Shanthala Nagar, Ashok Nagar, Bengaluru, Karnataka 560025',
  'ADMIN'
),
(
  2,
  'Rajesh Kumar Venkatachalam',
  'rajesh@koramangalatech.in',
  '$2b$10$KlzTQ.q.rBiIxot5.4CtF.MIOJ6knDYqOytTM6ysY5ZL53AdZWxcW',
  'Plot No. 124, 5th Main Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034',
  'OWNER'
),
(
  3,
  'Ananya Swaminathan Krishnan',
  'ananya@indiranagarorganic.in',
  '$2b$10$KlzTQ.q.rBiIxot5.4CtF.MIOJ6knDYqOytTM6ysY5ZL53AdZWxcW',
  'Villa 18, Palm Meadows, ITPL Main Road, Whitefield, Bengaluru, Karnataka 560066',
  'OWNER'
),
(
  4,
  'Priyanka Radhakrishnan Iyer',
  'priyanka@bengaluruhub.in',
  '$2b$10$upeCxvlbOYqyUEzPrIa7sOs/crTsGr0MreoQLj5fugELkpnLIrAfe',
  'Flat 402, Sobha Iris, Outer Ring Road, Devarabisanahalli, Bellandur, Bengaluru, Karnataka 560103',
  'USER'
),
(
  5,
  'Siddharth Ramesh Narayanan',
  'siddharth@bengaluruhub.in',
  '$2b$10$upeCxvlbOYqyUEzPrIa7sOs/crTsGr0MreoQLj5fugELkpnLIrAfe',
  'House No. 56, 14th Main, 7th Sector, HSR Layout, Bengaluru, Karnataka 560102',
  'USER'
);

-- --------------------------------------------------------------------
-- Seed Stores (Linked to Owners)
-- --------------------------------------------------------------------
INSERT INTO stores (id, name, email, address, owner_id) VALUES
(
  1,
  'Koramangala Tech Gadgets MegaStore',
  'contact@koramangalatech.in',
  'Shop No. 12, Ground Floor, 80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034',
  2
),
(
  2,
  'Indiranagar Organic Farms Supermarket',
  'care@indiranagarorganic.in',
  '452, 100 Feet Road, 12th Main Junction, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
  3
);

-- --------------------------------------------------------------------
-- Seed Ratings (User feedback on Stores)
-- --------------------------------------------------------------------
INSERT INTO ratings (id, user_id, store_id, rating) VALUES
(1, 4, 1, 5), -- Priyanka rated Koramangala Tech Store 5 Stars
(2, 5, 1, 4), -- Siddharth rated Koramangala Tech Store 4 Stars
(3, 4, 2, 5); -- Priyanka rated Indiranagar Organic Store 5 Stars
