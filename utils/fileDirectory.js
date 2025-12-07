const { renameSync, rmdirSync, unlink, existsSync, mkdirSync } = require("fs");
const path = require("path");
const removeFile = (fileName) => {
  if (!fileName) return;
  const filePath = path.join(__dirname, `../uploads/${fileName}`);
  if (!existsSync(filePath)) {
    console.log(`File not found or may have been deleted: ${filePath}`);
  } else {
    unlink(filePath, (err) => {
      if (err) {
        console.log(`Couldnot delete file ${filePath}`);
      }
    });
  }
  return;
};

const makeCourseDirectory = (courseId) => {
  const dir = path.join(__dirname, `../uploads/course_${courseId}`);
  if (!existsSync(dir)) {
    mkdirSync(dir);
  }
  return;
};
/**
 * Make directory for chapter and lesson
 * @param {string} courseId - Course id in which lesson to be added
 * @param {string}  chapterId - CHapter id in which lesson to be added
 * @param {string}  lessonId - Id of current lesson
 */
const makeChapterAndLessonDirectory = (courseId, chapterId, lessonId) => {
  makeCourseDirectory(courseId);
  const chapterDirectory = path.join(
    __dirname,
    `../uploads/course_${courseId}/chap_${chapterId}`
  );
  if (!existsSync(chapterDirectory)) {
    mkdirSync(chapterDirectory);
  }

  const lessonDirectory = path.join(
    __dirname,
    `../uploads/course_${courseId}/chap_${chapterId}/lesson_${lessonId}`
  );
  if (!existsSync(lessonDirectory)) {
    mkdirSync(lessonDirectory);
  }

  return;
};

const moveFile = (fileName, newPath) => {
  const oldPath = path.join(__dirname, `../uploads/${fileName}`);
  const newFolderPath = path.join(__dirname, `../uploads/${newPath}`);
  renameSync(oldPath, newFolderPath);
};

const makeRequiredDirectories = () => {
  const directories = ["uploads"];
  directories.forEach((directory) => {
    const dir = path.join(__dirname, `../${directory}`);
    if (!existsSync(dir)) {
      mkdirSync(dir);
    }
  });
};

const deleteFolder = (folderPath) => {
  const dir = path.join(__dirname, `../uploads/${folderPath}`);
  if (existsSync(dir)) {
    rmdirSync(dir, { recursive: true });
    console.log(`Folder ${folderPath} deleted successfully.`);
  } else {
    console.log("Folder does not exist.");
  }
};

module.exports = {
  removeFile,
  makeRequiredDirectories,
  makeCourseDirectory,
  makeChapterAndLessonDirectory,
  moveFile,
  deleteFolder,
};
