const multer = require('multer');

// Allowed MIME types
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const ALLOWED_STUDENT_ID_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

// Image filter (for profile & product images)
const imageFileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error('Only JPG, JPEG, PNG, and WEBP image files are supported'), false);
  }
  cb(null, true);
};

// Student ID filter (allows PDF too)
const studentIdFileFilter = (req, file, cb) => {
  if (!ALLOWED_STUDENT_ID_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error('Only JPG, JPEG, PNG, WEBP, and PDF files are supported for student ID'), false);
  }
  cb(null, true);
};

// Reusable upload creator (MEMORY STORAGE ✅)
const createUpload = ({ maxFileSize }) =>
  multer({
    storage: multer.memoryStorage(),   // ✅ CRITICAL FIX
    fileFilter: imageFileFilter,
    limits: {
      fileSize: maxFileSize,
    },
  });

// Upload instances
const productImagesUpload = createUpload({
  maxFileSize: 5 * 1024 * 1024, // 5MB
});

const profileImageUpload = createUpload({
  maxFileSize: 5 * 1024 * 1024, // 5MB
});

// Student ID upload (separate config)
const studentIdUpload = multer({
  storage: multer.memoryStorage(),   // ✅ CRITICAL FIX
  fileFilter: studentIdFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = {
  productImagesUpload,
  profileImageUpload,
  studentIdUpload,
};