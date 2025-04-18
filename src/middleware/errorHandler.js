const logger = require('../utils/logger');

// Central error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(err.stack);
  
  // Default error object
  const error = {
    success: false,
    message: err.message || 'Server Error',
    errors: err.errors || undefined,
  };
  
  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || 
      err.name === 'SequelizeUniqueConstraintError') {
    error.message = 'Validation Error';
    error.errors = err.errors.map(e => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json(error);
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token. Please log in again.';
    return res.status(401).json(error);
  }
  
  if (err.name === 'TokenExpiredError') {
    error.message = 'Your token has expired. Please log in again.';
    return res.status(401).json(error);
  }
  
  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.message = 'File too large';
    return res.status(400).json(error);
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error.message = 'Too many files or wrong field name';
    return res.status(400).json(error);
  }
  
  // Handle other known errors
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json(error);
};

module.exports = errorHandler;