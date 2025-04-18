const jwt = require("jsonwebtoken");
const { User } = require("../models");
const logger = require("../utils/logger");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// @desc    Register user
// @route   POST /auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    console.log(password);

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      token,
      data: {
        user,
      },
    });
  } catch (err) {
    logger.error("Registration error:", err);
    next(err);
  }
};

// @desc    Login user
// @route   POST /auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Check if user exists
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    user.password = undefined;

    res.status(200).cookie("token", token).json({
      success: true,
      token,
      data: {
        user,
      },
    });
  } catch (err) {
    logger.error("Login error:", err);
    next(err);
  }
};

// @desc    Get current user
// @route   GET /auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // User is already available in req due to the protect middleware
    const user = req.user;

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (err) {
    logger.error("GetMe error:", err);
    next(err);
  }
};
