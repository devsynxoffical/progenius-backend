const multer = require("multer");
const { getNextDocumentId } = require("../services/CounterService");
const { makeCourseDirectory } = require("./fileDirectory");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory to save files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique file name
  },
});

const courseStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    if (req.method === "PATCH") {
      cb(null, `uploads/course_${req.params.courseId}`);
    } else {
      const id = await getNextDocumentId("course");
      makeCourseDirectory(id);
      cb(null, `uploads/course_${id}`); // Directory to save files
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique file name
  },
});

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
