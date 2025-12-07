const adminDTO = (data) => {
  return {
    _id: data.id,
    fullName: data.fullName,
    email: data.email,
    role: data.role,
    phoneNumber: data.phoneNumber,
    profilePicture: data?.profilePicture,
    destination: data?.destination,
  };
};

const customerDTO = (data) => {
  return {
    _id: data.id,
    fullName: data.fullName,
    email: data.email,
    role: data.role,
    phoneNumber: data.phoneNumber,
    profilePicture: data?.profilePicture,
    status: data?.status,
    // hasAccess: data?.accessPaidCourse,
    destination: data?.destination,
  };
};

const courseDTO = (data) => {
  return {
    _id: data?.id,
    title: data?.title,
    description: data?.description,
    courseImage: data?.courseImage,
    status: data?.status,
    noOfStudents: data?.noOfStudents,
    destination: data?.destination,
    students: data?.students,
  };
};

const courseDetailDTO = (course, chapters) => {
  return {
    _id: course?._id,
    title: course?.title,
    description: course?.description,
    courseImage: course?.courseImage,
    status: course?.status,
    noOfStudents: course?.noOfStudents,
    destination: course?.destination,
    chapters: chapters,
  };
};

const chapterDetailDTO = (chapter, lessons) => {
  return {
    _id: chapter._id,
    title: chapter.title,
    description: chapter.description,
    isLocked: chapter.isLocked,
    lessons: lessons,
  };
};

module.exports = {
  adminDTO,
  customerDTO,
  courseDTO,
  courseDetailDTO,
  chapterDetailDTO,
};
