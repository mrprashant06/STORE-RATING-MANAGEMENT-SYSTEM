const StoreModel = require('../models/storeModel');
const RatingModel = require('../models/ratingModel');

/**
 * Controller for Store Owner specific endpoints
 * Strictly restricts data to the store owned by the authenticated user
 */
class OwnerController {
  /**
   * GET /api/owner/dashboard
   * Owner dashboard overview: store details, average rating, total ratings count
   */
  static async getDashboard(req, res, next) {
    try {
      const ownerId = req.user.id; // Strictly from verified token
      const store = await StoreModel.findByOwnerId(ownerId);

      if (!store) {
        return res.status(200).json({
          success: true,
          message: 'No store has been assigned to your account yet. Please contact the administrator.',
          store: null,
          stats: {
            averageRating: 0,
            totalRatings: 0
          }
        });
      }

      res.status(200).json({
        success: true,
        store: {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address
        },
        stats: {
          averageRating: store.average_rating,
          totalRatings: store.total_ratings
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/owner/ratings
   * View all customer ratings for the authenticated owner's store
   */
  static async getRatings(req, res, next) {
    try {
      const ownerId = req.user.id;
      const ratings = await RatingModel.findByOwnerId(ownerId);

      res.status(200).json({
        success: true,
        ratings
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/owner/average-rating
   * View the aggregated average rating and count for owner's store
   */
  static async getAverageRating(req, res, next) {
    try {
      const ownerId = req.user.id;
      const store = await StoreModel.findByOwnerId(ownerId);

      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'No store found associated with your owner account.'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          storeId: store.id,
          storeName: store.name,
          averageRating: store.average_rating,
          totalRatings: store.total_ratings
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OwnerController;
