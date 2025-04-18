const fs = require("fs");
const util = require("util");
const path = require("path");
const uploadOnCloudinary = require("../config/cloudinary");
const { Photo } = require("../models");
const logger = require("../utils/logger");
const cloudinary = require("cloudinary");

// Make fs.unlink return a promise
const unlinkAsync = util.promisify(fs.unlink);

// @desc    Upload a photo
// @route   POST /photos/upload
// @access  Private
exports.uploadPhoto = async (req, res, next) => {
  try {
    // Check if file exists in request
    // if (!req.file?.photo[0]) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Please upload a file",
    //   });
    // }

    const { caption, title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const imagePath = req.files?.photo[0].path;
    await cloudinary.uploader.upload(imagePath, {
      resource_type: "auto",
    });
    console.log(imagePath);

    // Upload file to cloudinary
    // const result = await uploadOnCloudinary(imagePath);

    // Create photo record in database
    const photo = await Photo.create({
      userId: req.user.id,
      title,
      caption: caption || "",
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      cloudinaryId: result.public_id,
      cloudinaryUrl: result.secure_url,
    });

    // Delete local file after upload
    await unlinkAsync(req.file.path);

    res.status(201).json({
      success: true,
      data: photo,
    });
  } catch (err) {
    logger.error("Photo upload error:", err);

    // If file was saved locally but error occurred later, delete it
    if (req.file) {
      try {
        await unlinkAsync(req.file.path);
      } catch (unlinkErr) {
        logger.error("Error deleting file:", unlinkErr);
      }
    }

    next(err);
  }
};

// @desc    Get all photos
// @route   GET /photos
// @access  Private
exports.getPhotos = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Get photos for current user with pagination
    const { count, rows: photos } = await Photo.findAndCountAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      count,
      total: count,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
      data: photos,
    });
  } catch (err) {
    logger.error("Get photos error:", err);
    next(err);
  }
};

// @desc    Get single photo
// @route   GET /photos/:id
// @access  Private
exports.getPhoto = async (req, res, next) => {
  try {
    const photo = await Photo.findByPk(req.params.id);

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Photo not found",
      });
    }

    // Check if user owns this photo
    if (photo.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this photo",
      });
    }

    res.status(200).json({
      success: true,
      data: photo,
    });
  } catch (err) {
    logger.error("Get photo error:", err);
    next(err);
  }
};

// @desc    Delete photo
// @route   DELETE /photos/:id
// @access  Private
exports.deletePhoto = async (req, res, next) => {
  try {
    const photo = await Photo.findByPk(req.params.id);

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Photo not found",
      });
    }

    // Check if user owns this photo
    if (photo.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this photo",
      });
    }

    // Delete image from cloudinary
    await cloudinary.uploader.destroy(photo.cloudinaryId);

    // Delete from database
    await photo.destroy();

    res.status(200).json({
      success: true,
      data: {},
      message: "Photo deleted successfully",
    });
  } catch (err) {
    logger.error("Delete photo error:", err);
    next(err);
  }
};
