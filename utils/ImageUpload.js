const multer = require("multer");

const storage = multer.memoryStorage();

const courseStorage = multer.memoryStorage();

// File filter to accept only specific types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only jpg, jpeg or png files are allowed"));
  }
};

const upload = multer({ storage, fileFilter });
const courseUpload = multer({ storage: courseStorage, fileFilter });
// Initialize upload
const uploadSingleFile = upload.single("file");
const uploadCourseImage = courseUpload.single("file");

module.exports = { uploadSingleFile, uploadCourseImage };
