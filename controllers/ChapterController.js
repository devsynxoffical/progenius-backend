const { ROLES } = require("../config/Constants");
const ChapterModel = require("../models/ChapterModel");
const CourseModel = require("../models/CourseModel");
const CustomerModel = require("../models/CustomerModel");
const LessonModel = require("../models/LessonModel");
const AsyncWrapper = require("../utils/AsyncWrapper");
const { chapterDetailDTO } = require("../utils/DTOs");
const ErrorHandler = require("../utils/ErrorHandler");
const SuccessMessage = require("../utils/SuccessMessage");
const { deleteFolder } = require("../utils/fileDirectory");

const addChapter = AsyncWrapper(async (req, res, next) => {
  const { title, description, isLocked, course } = req.body;

  const courseData = await CourseModel.findById(course);
  if (!courseData) {
    return next(new ErrorHandler("Course not found", 404));
  }

  const newChapter = new ChapterModel({
    title,
    description,
    isLocked,
    course: course,
  });

  const result = await newChapter.save();
  if (!result) {
    return next(new ErrorHandler("Failed to add chapter", 500));
  }

  return SuccessMessage(res, "Chapter added successfully", result);
});

const getChapterDetail = AsyncWrapper(async (req, res, next) => {
  const { chapterId } = req.params;
  if (req.user.role === ROLES.ADMIN) {
    const chapterData = await ChapterModel.findOne({
      _id: chapterId,
    });
    if (!chapterData) {
      return next(new ErrorHandler("Chapter not found", 404));
    }

    const lessons = await LessonModel.find({ chapter: chapterId });
    return SuccessMessage(
      res,
      "Chapter fetched successfully",
      chapterDetailDTO(chapterData, lessons)
    );
  } else {
    const chapterData = await ChapterModel.findById(chapterId);
    if (!chapterData) {
      return next(new ErrorHandler("Chapter not found", 404));
    }

    const course = await CourseModel.findOne({
      _id: chapterData.course,
      $or: [
        { status: "UNPAID" }, // If UNPAID, no need to check user
        { students: req.user._id }, // If PAID, check if user is enrolled
      ],
    });
    if (!course) {
      return next(
        new ErrorHandler(
          "You cannot fetch detail of this chapter as it is paid course",
          403
        )
      );
    }
    const lessons = await LessonModel.find({ chapter: chapterId });

    return SuccessMessage(
      res,
      "Chapter fetched successfully",
      chapterDetailDTO(chapterData, lessons)
    );
  }
});

const updateChapter = AsyncWrapper(async (req, res, next) => {
  const { chapterId } = req.params;
  const { title, description, isLocked, course } = req.body;
  const courseData = await CourseModel.findById(course);
  if (!courseData) {
    return next(new ErrorHandler("Course not found", 404));
  }
  const chapterData = await ChapterModel.findByIdAndUpdate(
    chapterId,
    {
      title,
      description,
      isLocked,
      course: course,
    },
    { new: true }
  );
  if (!chapterData) {
    return next(new ErrorHandler("Failed to update chapter", 500));
  }
  return SuccessMessage(res, "Chapter updated successfully", chapterData);
});

const deleteChapter = AsyncWrapper(async (req, res, next) => {
  const { chapterId } = req.params;
  const chapterData = await ChapterModel.findById(chapterId);
  if (!chapterData) {
    return next(new ErrorHandler("Chapter not found", 404));
  }

  await LessonModel.deleteMany({ chapter: chapterId });
  deleteFolder(`course_${chapterData.course}/chap_${chapterId}`);
  await ChapterModel.deleteOne({ _id: chapterId });
  return SuccessMessage(res, "Chapter deleted successfully");
});

const lockedunlockedChapter = AsyncWrapper(async (req, res, next) => {
  const { chapterId } = req.params;
  const chapterData = await ChapterModel.findById(chapterId);

  if (!chapterData) {
    return next(new ErrorHandler("Failed to update chapter", 500));
  }

  chapterData.isLocked = !chapterData.isLocked;
  await chapterData.save();
  return SuccessMessage(
    res,
    "Chapter status updated successfully",
    chapterData
  );
});

module.exports = {
  addChapter,
  getChapterDetail,
  updateChapter,
  deleteChapter,
  lockedunlockedChapter,
};
