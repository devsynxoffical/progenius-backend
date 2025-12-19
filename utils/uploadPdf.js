const multer = require("multer");

// Set up storage for PDFs (using memory storage for MongoDB)
const storage = multer.memoryStorage();

// File filter to accept only PDF files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"));
  }
};

// Multer instance for multiple PDF uploads
const uploadPdf = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 10MB
});

module.exports = uploadPdf;
