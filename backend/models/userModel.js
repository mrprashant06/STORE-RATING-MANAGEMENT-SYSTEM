const { pool } = require('../config/db');

/**
 * User Model - Encapsulates all SQL operations for the `users` table
 */
class UserModel {
  /**
   * Find user by email (includes password hash for auth checks)
   */
  static async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT id, name, email, password, address, role, created_at, updated_at FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return rows[0] || null;
  }

  /**
   * Find user by ID (excludes password hash for security)
   */
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Find user by ID with password (for password change verification)
   */
  static async findByIdWithPassword(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, password, address, role FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Create a new user (role defaults to USER if not specified)
   */
  static async create({ name, email, password, address, role = 'USER' }) {
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, address, role) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, password, address, role]
    );
    return {
      id: result.insertId,
      name,
      email,
      address,
      role
    };
  }

  /**
   * Update a user's password
   */
  static async updatePassword(id, hashedPassword) {
    const [result] = await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Get filtered and paginated list of users (for Admin)
   */
  static async findAll({ search = '', role = '', sortBy = 'id', sortOrder = 'DESC', limit = 10, offset = 0 }) {
    const allowedSortFields = ['id', 'name', 'email', 'address', 'role', 'created_at'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const conditions = [];
    const params = [];

    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      conditions.push('(name LIKE ? OR email LIKE ? OR address LIKE ?)');
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (role && role.trim() !== '') {
      conditions.push('role = ?');
      params.push(role.trim().toUpperCase());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT id, name, email, address, role, created_at, updated_at 
      FROM users 
      ${whereClause} 
      ORDER BY ${safeSortBy} ${safeSortOrder} 
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Count total users matching filters (for Admin pagination)
   */
  static async countAll({ search = '', role = '' }) {
    const conditions = [];
    const params = [];

    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      conditions.push('(name LIKE ? OR email LIKE ? OR address LIKE ?)');
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (role && role.trim() !== '') {
      conditions.push('role = ?');
      params.push(role.trim().toUpperCase());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `SELECT COUNT(*) as total FROM users ${whereClause}`;

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }
}

module.exports = UserModel;
