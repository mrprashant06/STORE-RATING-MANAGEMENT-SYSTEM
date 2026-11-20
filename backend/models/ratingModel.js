const { pool } = require('../config/db');

/**
 * Rating Model - Encapsulates all SQL operations for the `ratings` table
 */
class RatingModel {
  /**
   * Find rating by user_id and store_id
   */
  static async findByUserAndStore(userId, storeId) {
    const [rows] = await pool.query(
      'SELECT id, user_id, store_id, rating, created_at, updated_at FROM ratings WHERE user_id = ? AND store_id = ? LIMIT 1',
      [userId, storeId]
    );
    return rows[0] || null;
  }

  /**
   * Submit a new rating
   */
  static async create({ userId, storeId, rating }) {
    const [result] = await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating) 
       VALUES (?, ?, ?)`,
      [userId, storeId, rating]
    );
    return {
      id: result.insertId,
      user_id: userId,
      store_id: storeId,
      rating
    };
  }

  /**
   * Update an existing rating
   */
  static async update({ userId, storeId, rating }) {
    const [result] = await pool.query(
      `UPDATE ratings 
       SET rating = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = ? AND store_id = ?`,
      [rating, userId, storeId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Get all ratings submitted for a specific store (including reviewer user details)
   */
  static async findByStoreId(storeId) {
    const [rows] = await pool.query(
      `SELECT r.id, r.rating, r.created_at, r.updated_at,
              u.id AS user_id, u.name AS user_name, u.email AS user_email
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = ?
       ORDER BY r.updated_at DESC`,
      [storeId]
    );
    return rows;
  }

  /**
   * Get ratings submitted for a store owned by a specific owner ID
   */
  static async findByOwnerId(ownerId) {
    const [rows] = await pool.query(
      `SELECT r.id, r.rating, r.created_at, r.updated_at,
              u.id AS user_id, u.name AS user_name, u.email AS user_email,
              s.id AS store_id, s.name AS store_name
       FROM ratings r
       JOIN stores s ON r.store_id = s.id
       JOIN users u ON r.user_id = u.id
       WHERE s.owner_id = ?
       ORDER BY r.updated_at DESC`,
      [ownerId]
    );
    return rows;
  }

  /**
   * Get average rating and count for a store
   */
  static async getStoreAverage(storeId) {
    const [rows] = await pool.query(
      `SELECT ROUND(COALESCE(AVG(rating), 0), 1) AS average_rating,
              COUNT(id) AS total_ratings
       FROM ratings
       WHERE store_id = ?`,
      [storeId]
    );
    return rows[0];
  }

  /**
   * Get overall system metrics for Admin Dashboard
   */
  static async getSystemStatistics() {
    const [[usersResult], [storesResult], [ratingsResult]] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total_users FROM users'),
      pool.query('SELECT COUNT(*) AS total_stores FROM stores'),
      pool.query('SELECT COUNT(*) AS total_ratings FROM ratings')
    ]);

    return {
      totalUsers: usersResult[0].total_users,
      totalStores: storesResult[0].total_stores,
      totalRatings: ratingsResult[0].total_ratings
    };
  }

  /**
   * Get ratings submitted by a specific user (for User Details view in Admin)
   */
  static async findByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT r.id, r.rating, r.created_at, r.updated_at,
              s.id AS store_id, s.name AS store_name, s.address AS store_address
       FROM ratings r
       JOIN stores s ON r.store_id = s.id
       WHERE r.user_id = ?
       ORDER BY r.updated_at DESC`,
      [userId]
    );
    return rows;
  }
}

module.exports = RatingModel;
