const StoreModel = require('../models/storeModel');

/**
 * Controller for public / user-facing Store APIs
 */
class StoreController {
  /**
   * GET /api/stores
   * List stores with search by name/address, overall average rating, and user's own rating
   */
  static async getStores(req, res, next) {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 12));
      const offset = (page - 1) * limit;

      const { search = '', sortBy = 'id', sortOrder = 'DESC' } = req.query;
      const currentUserId = req.user ? req.user.id : null;

      const [stores, total] = await Promise.all([
        StoreModel.findAll({ search, sortBy, sortOrder, limit, offset, currentUserId }),
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
   * GET /api/stores/:id
   * Get single store details with user's submitted rating
   */
  static async getStoreById(req, res, next) {
    try {
      const storeId = parseInt(req.params.id, 10);
      const currentUserId = req.user ? req.user.id : null;

      const store = await StoreModel.findByIdWithDetails(storeId, currentUserId);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found.'
        });
      }

      res.status(200).json({
        success: true,
        store
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StoreController;
