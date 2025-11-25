/**
 * File Upload Middleware
 * Handles image uploads for character assets
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const characterId = req.body.characterId || req.params.id;

    if (!characterId) {
      return cb(new Error('Missing characterId'));
    }

    const uploadPath = path.join(__dirname, '../assets/characters', characterId);

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Use the original filename or generate from tierCode
    const tierCode = req.body.tierCode;
    const fileType = req.body.fileType || 'portrait'; // portrait or full

    let filename;
    if (tierCode) {
      const ext = path.extname(file.originalname);
      filename = `${fileType}_${tierCode}${ext}`;
    } else {
      filename = file.originalname;
    }

    cb(null, filename);
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter,
});

module.exports = upload;
