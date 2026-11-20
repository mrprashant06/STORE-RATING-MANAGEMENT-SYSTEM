const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const StoreModel = require('../models/storeModel');
const RatingModel = require('../models/ratingModel');

/**
 * Controller for all System Administrator operations
 */
class AdminController {
  /**
   * GET /api/admin/dashboard
   * System-wide statistics for the admin dashboard
   */
  static async getDashboard(req, res, next) {
    try {
      const stats = await RatingModel.getSystemStatistics();
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/users
   * Admin creating new USER, ADMIN, or OWNER account
   */
  static async createUser(req, res, next) {
    try {
      const { name, email, password, address, role } = req.body;

      // Check for existing email
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'A user with this email address already exists.'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await UserModel.create({
        name,
        email,
        password: hashedPassword,
        address,
        role: role.toUpperCase()
      });

      res.status(201).json({
        success: true,
        message: `${newUser.role} account created successfully.`,
        user: newUser
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/users
   * Get all registered users with search, role filter, sorting, and pagination
   */
  static async getUsers(req, res, next) {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
      const offset = (page - 1) * limit;

      const { search = '', role = '', sortBy = 'id', sortOrder = 'DESC' } = req.query;

      const [users, total] = await Promise.all([
        UserModel.findAll({ search, role, sortBy, sortOrder, limit, offset }),
        UserModel.countAll({ search, role })
      ]);

      res.status(200).json({
        success: true,
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/users/:id
   * Get individual user details with role-specific associations
   */
  static async getUserById(req, res, next) {
    try {
      const userId = parseInt(req.params.id, 10);
      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.'
        });
      }

      let associatedData = {};

      if (user.role === 'OWNER') {
        const store = await StoreModel.findByOwnerId(userId);
        associatedData.store = store;
      } else if (user.role === 'USER') {
        const ratings = await RatingModel.findByUserId(userId);
        associatedData.ratings = ratings;
      }

      res.status(200).json({
        success: true,
        user,
        ...associatedData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/stores
   * Admin creating a new store and assigning it to an owner
   */
  static async createStore(req, res, next) {
    try {
      const { name, email, address, owner_id } = req.body;

      // Verify owner exists and has OWNER role
      const owner = await UserModel.findById(owner_id);
      if (!owner) {
        return res.status(404).json({
          success: false,
          message: 'The specified store owner does not exist.'
        });
      }

      if (owner.role !== 'OWNER') {
        return res.status(400).json({
          success: false,
          message: `User '${owner.name}' does not have the 'OWNER' role. Please assign an account with the OWNER role.`
        });
      }

      const newStore = await StoreModel.create({
        name,
        email,
        address,
        owner_id
      });

      res.status(201).json({
        success: true,
        message: 'Store created and linked to owner successfully.',
        store: newStore
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/stores
   * Get all stores with owner info, average rating, search, sorting, and pagination
   */
  static async getStores(req, res, next) {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
      const offset = (page - 1) * limit;

      const { search = '', sortBy = 'id', sortOrder = 'DESC' } = req.query;

      const [stores, total] = await Promise.all([
        StoreModel.findAll({ search, sortBy, sortOrder, limit, offset }),
        StoreModel.countAll({ search })
      ]);

      res.status(200).json({
        success: true,
        stores,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/stores/:id
   * Get store details, owner information, and all submitted user ratings
   */
  static async getStoreById(req, res, next) {
    try {
      const storeId = parseInt(req.params.id, 10);
      const store = await StoreModel.findByIdWithDetails(storeId);

      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found.'
        });
      }

      const ratings = await RatingModel.findByStoreId(storeId);

      res.status(200).json({
        success: true,
        store,
        ratings
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;
