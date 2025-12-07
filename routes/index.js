const { existsSync } = require("fs");
const path = require("path");
const router = require("express").Router();
const AsyncWrapper = require("../utils/AsyncWrapper");
const ErrorHandler = require("../utils/ErrorHandler");
const AdminRoutes = require("./AdminRoutes");
const CourseRoutes = require("./CourseRoutes");
const CustomerRoutes = require("./CustomerRoutes");
const ChapterRoutes = require("./ChapterRoutes");
const LessonRoutes = require("./LessonRoutes");
const AuthRoutes = require("./AuthRoutes");
const DashboardRoutes = require("./DashboardRoutes");

router.get("/health", (req, res) => {
  return res.status(200).json({ message: "Server is up and running" });
});

router.use("/admin", AdminRoutes);
router.use("/customer", CustomerRoutes);
router.use("/course", CourseRoutes);
router.use("/chapter", ChapterRoutes);
router.use("/lesson", LessonRoutes);
router.use("/auth", AuthRoutes);
router.use("/dashboard", DashboardRoutes);

router.get(
  "/file/*/:fileName",
  AsyncWrapper(async (req, res, next) => {
    const { fileName } = req.params;
    const destination = req.params[0];
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".pdf"];
    if (!fileName || !destination) {
      return next(
        new ErrorHandler("File name and destination are required", 400)
      );
    }

    console.log(path.extname(fileName));
    const fileExtension = path.extname(fileName).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return next(
        new ErrorHandler(
          "Invalid file type. Only images and PDFs are allowed",
          400
        )
      );
    }

    const filePath = path.join(__dirname, `../${destination}/${fileName}`);
    console.log(filePath);
    if (!existsSync(filePath)) {
      return next(
        new ErrorHandler("File not found or may have been deleted", 404)
      );
    }
    res.sendFile(filePath);
  })
);
module.exports = router;
