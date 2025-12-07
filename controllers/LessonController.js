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
        file: item.filename,
        destination: item.destination,
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

  // move file to new folder
  if (result?.pdfs?.length) {
    makeChapterAndLessonDirectory(chapterData.course, chapter, result._id);

    result.pdfs.forEach((pdf) => {
      moveFile(
        pdf.file,
        `course_${chapterData.course}/chap_${chapter}/lesson_${result._id}/${pdf.file}`
      );

      pdf.destination = `uploads/course_${chapterData.course}/chap_${chapter}/lesson_${result._id}`;
    });
  }

  await result.save();

  return SuccessMessage(res, "Lesson Added successfully", result);
});

const getLessonDetail = AsyncWrapper(async (req, res, next) => {
  const { lessonId } = req.params;
  if (req.user.role === ROLES.ADMIN) {
    const lesson = await LessonModel.findById(lessonId);
    if (!lesson) {
      return next(new ErrorHandler("Lesson not found", 404));
    }
    return SuccessMessage(res, "Lesson fetched successfully", lesson);
  } else {
    const lessonData = await LessonModel.findById(lessonId).populate(
      "chapter",
      "course"
    );
    if (!lessonData) {
      return next(new ErrorHandler("Lesson not found", 404));
    }

    console.log(lessonData);

    const course = await CourseModel.findOne({
      _id: lessonData.chapter.course,
      $or: [
        { status: "UNPAID" }, // If UNPAID, no need to check user
        { status: "PAID", students: req.user._id }, // If PAID, check if user is enrolled
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
  // delete pdf from local system
  const chapter = await ChapterModel.findById(lessonData?.chapter);
  if (chapter) {
    deleteFolder(
      `course_${chapter.course}/chap_${chapter._id}/lesson_${lessonId}`
    );
  }
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
        file: item.filename,
        destination: `uploads/course_${lessonData.chapter.course}/chap_${lessonData?.chapter._id}/lesson_${lessonId}`,
      });
    });
  }

  lessonData.pdfs = [...lessonData.pdfs, ...pdfs];
  const result = await lessonData.save();
  if (!result) {
    return next(new ErrorHandler("Failed to add new PDF"));
  }
  // move file to new folder
  for (const pdf of pdfs) {
    makeChapterAndLessonDirectory(
      lessonData.chapter.course,
      lessonData?.chapter._id,
      lessonId
    );
    moveFile(
      pdf.file,
      `course_${lessonData.chapter.course}/chap_${lessonData?.chapter._id}/lesson_${lessonId}/${pdf.file}`
    );
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

module.exports = {
  addLesson,
  getLessonDetail,
  deleteLesson,
  updateLessons,
  addNewPDF,
  removePdf,
};
