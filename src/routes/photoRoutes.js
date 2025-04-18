const express = require("express");
const {
  uploadPhoto,
  getPhotos,
  getPhoto,
  deletePhoto,
} = require("../controllers/photoController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const router = express.Router();
// const upload = require("../middleware/multer.js");
const multer = require("multer");
// const { upload } = require("mu");

// Protect all routes
// router.use(protect);

// Upload photo
router.post("/upload", upload.array("photo", 1), uploadPhoto);

// Get all photos
router.get("/", getPhotos);

// Get single photo
router.get("/:id", getPhoto);

// Delete photo
router.delete("/:id", deletePhoto);

module.exports = router;
