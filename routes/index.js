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
const CourseModel = require("../models/CourseModel");
const LessonModel = require("../models/LessonModel");

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
    const destination = req.params[0]; // e.g., "uploads/course_01" or "uploads/course_01/chap_.../lesson_..."

    if (!fileName || !destination) {
      return next(
        new ErrorHandler("File name and destination are required", 400)
      );
    }

    // 1. Try to find in CourseModel first (Course Images)
    if (destination.startsWith("uploads/course_") && !destination.includes("chap_")) {
      const courseId = destination.split("_")[1];
      const course = await CourseModel.findById(courseId);

      if (course && course.imageData) {
        res.set("Content-Type", course.imageContentType || "image/jpeg");
        return res.send(course.imageData);
      }
    }

    // 2. Try to find in LessonModel (Lesson PDFs)
    if (destination.includes("lesson_")) {
      const lessonId = destination.split("lesson_")[1].split("/")[0];
      const lesson = await LessonModel.findById(lessonId);

      if (lesson && lesson.pdfs && lesson.pdfs.length > 0) {
        const pdf = lesson.pdfs.find(p => p.file === fileName || p.title === fileName.replace(/\.pdf$/, ""));
        if (pdf && pdf.data) {
          res.set("Content-Type", pdf.contentType || "application/pdf");
          return res.send(pdf.data);
        }
      }
    }

    // Fallback: Check local filesystem (for backward compatibility during migration)
    const localPath = path.join(__dirname, `../${destination}/${fileName}`);
    if (existsSync(localPath)) {
      return res.sendFile(localPath);
    }

    return next(
      new ErrorHandler("File not found or may have been deleted", 404)
    );
  })
);
module.exports = router;
