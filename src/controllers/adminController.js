const { User, Photo, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');
const logger = require('../utils/logger');

// @desc    Get admin stats
// @route   GET /admin/stats
// @access  Private/Admin
exports.getStats = async (req, res, next) => {
  try {
    // Get total uploads
    const totalUploads = await Photo.count();
    
    // Get most active uploader
    const mostActiveUploaderQuery = `
      SELECT "userId", "User"."name", COUNT(*) as "photoCount"
      FROM "Photos"
      JOIN "Users" AS "User" ON "Photos"."userId" = "User"."id"
      GROUP BY "userId", "User"."name"
      ORDER BY "photoCount" DESC
      LIMIT 1
    `;
    
    const mostActiveUploader = await sequelize.query(mostActiveUploaderQuery, {
      type: QueryTypes.SELECT,
    });
    
    // Get largest photo
    const largestPhotoQuery = `
      SELECT "id", "fileName", "fileSize", "cloudinaryUrl", "title"
      FROM "Photos"
      ORDER BY "fileSize" DESC
      LIMIT 1
    `;
    
    const largestPhoto = await sequelize.query(largestPhotoQuery, {
      type: QueryTypes.SELECT,
    });
    
    // Get user count
    const userCount = await User.count();
    
    // Get average photo size
    const avgSizeQuery = `
      SELECT AVG("fileSize") as "avgSize"
      FROM "Photos"
    `;
    
    const avgSize = await sequelize.query(avgSizeQuery, {
      type: QueryTypes.SELECT,
    });
    
    // Get uploads per day for the last 7 days
    const uploadsPerDayQuery = `
      SELECT 
        DATE("createdAt") as "date",
        COUNT(*) as "count"
      FROM "Photos"
      WHERE "createdAt" >= NOW() - INTERVAL '7 days'
      GROUP BY DATE("createdAt")
      ORDER BY "date" DESC
    `;
    
    const uploadsPerDay = await sequelize.query(uploadsPerDayQuery, {
      type: QueryTypes.SELECT,
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalUploads,
        mostActiveUploader: mostActiveUploader.length > 0 ? mostActiveUploader[0] : null,
        largestPhoto: largestPhoto.length > 0 ? largestPhoto[0] : null,
        userCount,
        avgPhotoSize: avgSize.length > 0 ? Math.round(avgSize[0].avgSize) : 0,
        uploadsPerDay,
      },
    });
  } catch (err) {
    logger.error('Admin stats error:', err);
    next(err);
  }
};