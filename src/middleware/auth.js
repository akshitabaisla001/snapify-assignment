const jwt = require("jsonwebtoken");
const { User } = require("../models");
const logger = require("../utils/logger");

// Middleware to check if the user is authenticated
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if auth header exists and has the right format
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    console.log(token);
    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user still exists
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "The user belonging to this token no longer exists",
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (err) {
      logger.error("JWT verification failed:", err);
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }
  } catch (err) {
    logger.error("Auth middleware error:", err);
    next(err);
  }
};

// Middleware to restrict access to admin only
exports.restrictTo = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};
