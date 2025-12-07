const CustomerModel = require("../models/CustomerModel");
const CourseModel = require("../models/CourseModel");
const AsyncWrapper = require("../utils/AsyncWrapper");
const SuccessMessage = require("../utils/SuccessMessage");
const { customerDTO } = require("../utils/DTOs");

const dashboardData = AsyncWrapper(async (req, res, next) => {
  const totalStudents = await CustomerModel.countDocuments();
  const studentIdAgg = await CourseModel.aggregate([
    { $unwind: "$students" },
    {
      $group: {
        _id: null,
        studentIds: { $addToSet: "$students" },
      },
    },
    {
      $project: {
        _id: 0,
        studentIds: 1,
      },
    },
  ]);

  const paidStudentsCount = studentIdAgg[0].studentIds.length;
  const freeStudentsCount = totalStudents - paidStudentsCount;

  return SuccessMessage(res, "Dashboard stats", {
    totalStudents,
    paidStudentsCount,
    freeStudentsCount,
  });
});

const paidStudentList = AsyncWrapper(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Step 1: Get all unique student IDs from CourseModel
  const studentIdAgg = await CourseModel.aggregate([
    { $unwind: "$students" },
    {
      $group: {
        _id: "$students", // Get unique student IDs
      },
    },
    { $sort: { _id: 1 } }, // Sort by _id
  ]);

  const allStudentIds = studentIdAgg.map((s) => s._id); // All IDs, sorted
  const total = allStudentIds.length;

  // Step 2: Get paginated IDs from the sorted array
  const paginatedStudentIds = allStudentIds.slice(skip, skip + limit);

  // Step 3: Fetch corresponding Customer documents
  const students = await CustomerModel.find({
    _id: { $in: paginatedStudentIds },
  }).sort({ _id: 1 }); // Match same sort order

  const totalPages = Math.ceil(total / limit);

  const studentData = students.map((item) => customerDTO(item));

  return SuccessMessage(res, "Paid Students List", {
    currentPage: page,
    totalPages,
    pageSize: limit,
    totalStudents: total,
    studentData,
  });
});

module.exports = {
  dashboardData,
  paidStudentList,
};
