const multer = require('multer');

// Files are held in memory just long enough to stream to Cloudinary / disk-process for preview
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'pdf') {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed for the "pdf" field'), false);
    }
  }
  if (file.fieldname === 'cover') {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      return cb(new Error('Cover image must be JPEG, PNG, or WEBP'), false);
    }
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB cap per file
});

// Expects multipart form with fields "cover" (1 image) and "pdf" (1 file)
const uploadNoteFiles = upload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
]);

module.exports = { uploadNoteFiles };
