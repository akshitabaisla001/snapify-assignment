const express = require('express');
const { getStats } = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();

// Protect all routes and restrict to admin
router.use(protect);
router.use(restrictTo('admin'));

// Get admin stats
router.get('/stats', getStats);

module.exports = router;