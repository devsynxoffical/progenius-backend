const router = require("express").Router();
const { validate } = require("express-validation");
const { ROLES } = require("../config/Constants");
const {
  addCourse,
  getCourseDetail,
  updateCourse,
  deleteCourse,
  getAllFreeCourses,
  getAllPaidCourses,
  updateCourseStudents,
  // updateCourseCustomers,
} = require("../controllers/CourseController");
const auth = require("../middlewares/Auth");
const roleAuthorization = require("../middlewares/RoleAuthorization");
const { addUpdateCourseSchema, assignCourse } = require("../validations");
const { uploadCourseImage } = require("../utils/ImageUpload");
const fileValidator = require("../middlewares/FileValidator");

router
  .route("/")
  .post(
    [auth, roleAuthorization([ROLES.ADMIN])],
    uploadCourseImage,
    fileValidator,
    validate(addUpdateCourseSchema),
    addCourse
  );

router.route("/free").get(auth, getAllFreeCourses);
router.route("/paid").get(auth, getAllPaidCourses);
router
  .route("/update-course-customer")
  .patch(
    [auth, roleAuthorization([ROLES.ADMIN])],
    validate(assignCourse),
    updateCourseStudents
  );

router
  .route("/:courseId")
  .get(auth, getCourseDetail)
  .patch(
    [auth, roleAuthorization([ROLES.ADMIN])],
    uploadCourseImage,
    validate(addUpdateCourseSchema),
    updateCourse
  )
  .delete([auth, roleAuthorization([ROLES.ADMIN])], deleteCourse);

module.exports = router;
