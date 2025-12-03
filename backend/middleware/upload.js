const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure base uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// File upload configurations
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profile_pictures/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const profileUpload = multer({
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
});

// Create necessary directories
const profilePicturesDir = path.join(__dirname, '..', 'uploads', 'profile_pictures');
if (!fs.existsSync(profilePicturesDir)) {
  fs.mkdirSync(profilePicturesDir, { recursive: true });
}

module.exports = {
  upload,
  profileUpload,
};




