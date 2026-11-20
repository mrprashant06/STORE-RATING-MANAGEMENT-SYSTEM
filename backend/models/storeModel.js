const { pool } = require('../config/db');

/**
 * Store Model - Encapsulates all SQL operations for the `stores` table
 */
class StoreModel {
  /**
   * Create a new store record
   */
  static async create({ name, email, address, owner_id }) {
    const [result] = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id) 
       VALUES (?, ?, ?, ?)`,
      [name, email, address, owner_id]
    );
    return {
      id: result.insertId,
      name,
      email,
      address,
      owner_id
    };
  }

  /**
   * Find store by ID
   */
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, address, owner_id, created_at, updated_at FROM stores WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Find store assigned to a specific owner
   */
  static async findByOwnerId(ownerId) {
    const [rows] = await pool.query(
      `SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at, s.updated_at,
              ROUND(COALESCE(AVG(r.rating), 0), 1) AS average_rating,
              COUNT(r.id) AS total_ratings
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.owner_id = ?
       GROUP BY s.id
       LIMIT 1`,
      [ownerId]
    );
    return rows[0] || null;
  }

  /**
   * Find all stores with owner information and aggregated average rating
   * Supports search by name, email, and address, along with sorting and pagination
   */
  static async findAll({ search = '', sortBy = 'id', sortOrder = 'DESC', limit = 10, offset = 0, currentUserId = null }) {
    const allowedSortFields = ['id', 'name', 'email', 'address', 'created_at', 'average_rating', 'total_ratings'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const conditions = [];
    const params = [];

    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      conditions.push('(s.name LIKE ? OR s.email LIKE ? OR s.address LIKE ?)');
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // If currentUserId is passed, we also subquery user's submitted rating for each store
    const userRatingSelect = currentUserId
      ? `, (SELECT r_user.rating FROM ratings r_user WHERE r_user.store_id = s.id AND r_user.user_id = ${parseInt(currentUserId, 10)} LIMIT 1) AS my_rating`
      : '';

    const query = `
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address, 
        s.owner_id, 
        s.created_at, 
        s.updated_at,
        u.name AS owner_name,
        u.email AS owner_email,
        ROUND(COALESCE(AVG(r.rating), 0), 1) AS average_rating,
        COUNT(r.id) AS total_ratings
        ${userRatingSelect}
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      ${whereClause}
      GROUP BY s.id, u.name, u.email
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Count total stores matching search criteria
   */
  static async countAll({ search = '' }) {
    const conditions = [];
    const params = [];

    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      conditions.push('(name LIKE ? OR email LIKE ? OR address LIKE ?)');
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `SELECT COUNT(*) as total FROM stores ${whereClause}`;

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  /**
   * Find single store with owner details and rating aggregation
   */
  static async findByIdWithDetails(id, currentUserId = null) {
    const userRatingSelect = currentUserId
      ? `, (SELECT r_user.rating FROM ratings r_user WHERE r_user.store_id = s.id AND r_user.user_id = ${parseInt(currentUserId, 10)} LIMIT 1) AS my_rating`
      : '';

    const query = `
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address, 
        s.owner_id, 
        s.created_at, 
        s.updated_at,
        u.name AS owner_name,
        u.email AS owner_email,
        ROUND(COALESCE(AVG(r.rating), 0), 1) AS average_rating,
        COUNT(r.id) AS total_ratings
        ${userRatingSelect}
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.id = ?
      GROUP BY s.id, u.name, u.email
      LIMIT 1
    `;

    const [rows] = await pool.query(query, [id]);
    return rows[0] || null;
  }
}

module.exports = StoreModel;
