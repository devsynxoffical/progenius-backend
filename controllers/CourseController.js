const { ROLES } = require("../config/Constants");
const ChapterModel = require("../models/ChapterModel");
const CourseModel = require("../models/CourseModel");
const CustomerModel = require("../models/CustomerModel");
const LessonModel = require("../models/LessonModel");
const AsyncWrapper = require("../utils/AsyncWrapper");
const { courseDetailDTO } = require("../utils/DTOs");
const ErrorHandler = require("../utils/ErrorHandler");
const SuccessMessage = require("../utils/SuccessMessage");
const { removeFile, deleteFolder } = require("../utils/fileDirectory");

const addCourse = AsyncWrapper(async (req, res, next) => {
  const { title, description, status, noOfStudents } = req.body;
  const newCourse = new CourseModel({
    title,
    description,
    status,
    noOfStudents,
    courseImage: (req?.file && req.file.filename) || null,
    destination: (req?.file && req.file.destination) || null,
  });
  const result = await newCourse.save();
  if (!result) {
    return next(new ErrorHandler("Failed to add course"));
  }

  return SuccessMessage(res, "Course added successfully", result);
});

const getAllFreeCourses = AsyncWrapper(async (req, res, next) => {
  const courses = await CourseModel.find({ status: "UNPAID" });
  return SuccessMessage(res, "All courses fetched successfully", courses);
});

const getAllPaidCourses = AsyncWrapper(async (req, res, next) => {
  const courses = await CourseModel.find({ status: "PAID" }).populate(
    "students",
    "_id fullName email"
  );
  return SuccessMessage(res, "All courses fetched successfully", courses);
});

const deleteCourse = AsyncWrapper(async (req, res, next) => {
  const { courseId } = req.params;
  const course = await CourseModel.findOne({ _id: courseId });
  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  const chapters = await ChapterModel.find({ course: courseId });
  for (const chapter of chapters) {
    await LessonModel.deleteMany({ chapter: chapter._id });
  }

  await ChapterModel.deleteMany({ course: courseId });
  await CourseModel.deleteOne({ _id: courseId });
  deleteFolder(`course_${courseId}`);
  return SuccessMessage(res, "Course deleted successfully");
});

const updateCourse = AsyncWrapper(async (req, res, next) => {
  const { courseId } = req.params;
  const { title, description, status, noOfStudents } = req.body;

  const course = await CourseModel.findById(courseId);
  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  course.title = title;
  course.description = description;
  course.status = status;
  course.noOfStudents = noOfStudents;

  if (req?.file) {
    removeFile(`course_${course._id}/${course.courseImage}`);
    course.courseImage = req.file.filename;
    course.destination = req.file.destination;
  }
  const result = await course.save();
  if (!result) {
    return next(new ErrorHandler("Failed to update course"));
  }

  return SuccessMessage(res, "Course updated successfully", result);
});

const getCourseDetail = AsyncWrapper(async (req, res, next) => {
  const { courseId } = req.params;

  // Execute the query
  const course = await CourseModel.findById(courseId);
  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }
  // Fetch chapters for the course and attach them to the course object
  const chapters = await ChapterModel.find({ course: courseId });
  return SuccessMessage(
    res,
    "Course details fetched successfully",
    courseDetailDTO(course, chapters)
  );
});

const updateCourseStudents = AsyncWrapper(async (req, res, next) => {
  const { customerIds, courseId } = req.body;
  if (customerIds.length) {
    const customers = await CustomerModel.find({
      _id: { $in: customerIds },
    });
    if (customers.length !== customerIds.length) {
      return next(new ErrorHandler("Some customers not found", 404));
    }
  }

  let data = [...new Set(customerIds)];
  const course = await CourseModel.findById(courseId);
  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  course.students = data;
  await course.save();
  return SuccessMessage(res, "Course assigned to user successfully", course);
});

module.exports = {
  addCourse,
  getAllFreeCourses,
  getAllPaidCourses,
  deleteCourse,
  updateCourse,
  getCourseDetail,
  updateCourseStudents,
};
