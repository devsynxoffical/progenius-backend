const { ROLES } = require("../config/Constants");
const ChapterModel = require("../models/ChapterModel");
const CourseModel = require("../models/CourseModel");
const CustomerModel = require("../models/CustomerModel");
const LessonModel = require("../models/LessonModel");
const AsyncWrapper = require("../utils/AsyncWrapper");
const ErrorHandler = require("../utils/ErrorHandler");
const SuccessMessage = require("../utils/SuccessMessage");
const {
  moveFile,
  makeChapterAndLessonDirectory,
  deleteFolder,
  removeFile,
} = require("../utils/fileDirectory");

const addLesson = AsyncWrapper(async (req, res, next) => {
  const { title, videos, quizes, chapter } = req.body;
  const chapterData = await ChapterModel.findById(chapter);
  if (!chapterData) {
    return next(new ErrorHandler("Chapter not found", 404));
  }

  const pdfs = [];
  if (req?.files?.length) {
    req.files.map((item) => {
      pdfs.push({
        title: item.originalname.replace(/\.pdf$/, ""),
        file: item.originalname,
        destination: `uploads/course_${chapterData.course}/chap_${chapter}/lesson_placeholder`,
        data: item.buffer,
        contentType: item.mimetype,
      });
    });
  }

  const newLesson = new LessonModel({
    title,
    videos,
    quizes,
    chapter,
    pdfs,
  });

  const result = await newLesson.save();
  if (!result) {
    return next(new ErrorHandler("Failed to add lesson"));
  }

  // Update destinations with actual lesson ID
  if (result?.pdfs?.length) {
    result.pdfs.forEach((pdf) => {
      pdf.destination = `uploads/course_${chapterData.course}/chap_${chapter}/lesson_${result._id}`;
    });
    await result.save();
  }

  return SuccessMessage(res, "Lesson Added successfully", result);
});

const getLessonDetail = AsyncWrapper(async (req, res, next) => {
  const { lessonId } = req.params;
  const lesson = await LessonModel.findById(lessonId).select("-pdfs.data");
  if (!lesson) {
    return next(new ErrorHandler("Lesson not found", 404));
  }

  if (req.user.role === ROLES.ADMIN) {
    return SuccessMessage(res, "Lesson fetched successfully", lesson);
  } else {
    // Populate for student check
    const lessonData = await LessonModel.findById(lessonId)
      .populate("chapter", "course")
      .select("-pdfs.data");

    if (!lessonData) {
      return next(new ErrorHandler("Lesson not found", 404));
    }

    const course = await CourseModel.findOne({
      _id: lessonData.chapter.course,
      $or: [
        { status: "UNPAID" },
        { status: "PAID", students: req.user._id },
      ],
    });

    if (!course) {
      return next(
        new ErrorHandler(
          "You cannot view this lesson because it is part of a paid course.",
          403
        )
      );
    }

    return SuccessMessage(res, "Lesson fetched successfully", lessonData);
  }
});

const deleteLesson = AsyncWrapper(async (req, res, next) => {
  const { lessonId } = req.params;
  const lessonData = await LessonModel.findById(lessonId);
  if (!lessonData) {
    return next(new ErrorHandler("Lesson not found", 404));
  }
  // No need to delete folder as we are using DB
  await LessonModel.deleteOne({ _id: lessonId });
  return SuccessMessage(res, "Lesson deleted successfully");
});

const updateLessons = AsyncWrapper(async (req, res, next) => {
  const { lessonId } = req.params;
  const lessonData = await LessonModel.findById(lessonId);

  if (!lessonData) {
    return next(new ErrorHandler("Lesson not found", 404));
  }

  const { title, videos, quizes } = req.body;

  const updatedData = await LessonModel.updateOne(
    { _id: lessonId },
    {
      title,
      videos,
      quizes,
    },
    {
      new: true,
    }
  );

  if (!updatedData) {
    return next(new ErrorHandler("Failed to update lesson"));
  }
  return SuccessMessage(res, "Lesson updated successfully", updatedData);
});

const addNewPDF = AsyncWrapper(async (req, res, next) => {
  const { lessonId } = req.params;
  const lessonData = await LessonModel.findById(lessonId).populate(
    "chapter",
    "_id course"
  );
  if (!lessonData) {
    return next(new ErrorHandler("Lesson not found", 404));
  }

  const pdfs = [];
  if (req?.files?.length) {
    req.files.map((item) => {
      pdfs.push({
        title: item.originalname.replace(/\.pdf$/, ""),
        file: item.originalname,
        destination: `uploads/course_${lessonData.chapter.course}/chap_${lessonData?.chapter._id}/lesson_${lessonId}`,
        data: item.buffer,
        contentType: item.mimetype,
      });
    });
  }

  lessonData.pdfs = [...lessonData.pdfs, ...pdfs];
  const result = await lessonData.save();
  if (!result) {
    return next(new ErrorHandler("Failed to add new PDF"));
  }

  return SuccessMessage(res, "Lesson Added successfully", result);
});

const removePdf = AsyncWrapper(async (req, res, next) => {
  const { lessonId } = req.params;
  const lessonData = await LessonModel.findById(lessonId).populate(
    "chapter",
    "_id course"
  );
  if (!lessonData) {
    return next(new ErrorHandler("Lesson not found", 404));
  }

  const { pdfIds } = req.body;
  const existArray = [];
  const remainderArray = [];

  lessonData.pdfs.forEach((pdf) => {
    if (pdfIds.includes(pdf._id.toString())) {
      existArray.push(pdf);
    } else {
      remainderArray.push(pdf);
    }
  });

  if (existArray.length) {
    existArray.forEach((item) => {
      removeFile(
        `course_${lessonData.chapter.course}/chap_${lessonData.chapter._id}/lesson_${lessonId}/${item.file}`
      );
    });
  }

  lessonData.pdfs = remainderArray;
  const result = await lessonData.save();
  if (!result) {
    return next(new ErrorHandler("Failed to remove PDF"));
  }
  return SuccessMessage(res, "Pdf removed successfully", result);
});

const toggleLessonComplete = AsyncWrapper(async (req, res, next) => {
  const { lessonId } = req.params;
  const { _id } = req.user;

  const customer = await CustomerModel.findById(_id);
  if (!customer) {
    return next(new ErrorHandler("Customer not found", 404));
  }

  if (!customer.completedLessons) {
    customer.completedLessons = [];
  }

  const lessonIndex = customer.completedLessons.indexOf(lessonId);
  if (lessonIndex > -1) {
    customer.completedLessons.splice(lessonIndex, 1); // Unmark complete
  } else {
    customer.completedLessons.push(lessonId); // Mark complete
  }

  await customer.save();

  return SuccessMessage(res, "Lesson status updated", {
    isCompleted: lessonIndex === -1,
    completedLessonsCount: customer.completedLessons.length,
  });
});

module.exports = {
  addLesson,
  getLessonDetail,
  deleteLesson,
  updateLessons,
  addNewPDF,
  removePdf,
  toggleLessonComplete,
};
