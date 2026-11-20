const RatingModel = require('../models/ratingModel');
const StoreModel = require('../models/storeModel');

/**
 * Controller for Rating Operations (Submit, Update)
 */
class RatingController {
  /**
   * POST /api/ratings
   * Submit a new rating (1 - 5) for a store
   * Authenticated user ID is strictly extracted from verified JWT token
   */
  static async submitRating(req, res, next) {
    try {
      const { store_id, rating } = req.body;
      const userId = req.user.id; // Strictly from verified token!

      // Check if the store exists
      const store = await StoreModel.findById(store_id);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'The requested store does not exist.'
        });
      }

      // Check if user has already rated this store (one rating per store rule)
      const existingRating = await RatingModel.findByUserAndStore(userId, store_id);
      if (existingRating) {
        return res.status(409).json({
          success: false,
          message: 'You have already rated this store. Please update your rating instead.',
          existingRating: existingRating.rating
        });
      }

      // Insert rating
      const newRating = await RatingModel.create({
        userId,
        storeId: store_id,
        rating: parseInt(rating, 10)
      });

      // Fetch fresh average
      const storeAverage = await RatingModel.getStoreAverage(store_id);

      res.status(201).json({
        success: true,
        message: 'Rating submitted successfully!',
        data: {
          rating: newRating.rating,
          storeAverage: storeAverage.average_rating,
          totalRatings: storeAverage.total_ratings
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/ratings/:storeId
   * Update an existing rating for a store
   */
  static async updateRating(req, res, next) {
    try {
      const storeId = parseInt(req.params.storeId, 10);
      const { rating } = req.body;
      const userId = req.user.id; // Strictly from verified token!

      // Verify existing rating exists
      const existing = await RatingModel.findByUserAndStore(userId, storeId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'No previous rating found for this store. Please submit a new rating.'
        });
      }

      // Update rating in database
      await RatingModel.update({
        userId,
        storeId,
        rating: parseInt(rating, 10)
      });

      // Fetch fresh average
      const storeAverage = await RatingModel.getStoreAverage(storeId);

      res.status(200).json({
        success: true,
        message: 'Your rating has been updated successfully!',
        data: {
          rating: parseInt(rating, 10),
          storeAverage: storeAverage.average_rating,
          totalRatings: storeAverage.total_ratings
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RatingController;
