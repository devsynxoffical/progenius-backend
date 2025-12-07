const router = require("express").Router();
const { validate } = require("express-validation");
const {
  addLesson,
  getLessonDetail,
  deleteLesson,
  updateLessons,
  addNewPDF,
  removePdf,
} = require("../controllers/LessonController");
const auth = require("../middlewares/Auth");
const uploadPdf = require("../utils/uploadPdf");
const { addUpdatelessonSchema } = require("../validations");
const roleAuthorization = require("../middlewares/RoleAuthorization");
const { ROLES } = require("../config/Constants");

router.route("/").post(
  [auth, roleAuthorization([ROLES.ADMIN])],
  uploadPdf.array("pdfs"),
  (req, res, next) => {
    // 🔥 Custom Middleware to Fix Array Conversion
    try {
      if (typeof req.body.videos === "string") {
        req.body.videos = JSON.parse(req.body.videos);
      }
      if (typeof req.body.quizes === "string") {
        req.body.quizes = JSON.parse(req.body.quizes);
      }
    } catch (error) {
      return res
        .status(400)
        .json({ error: "Invalid JSON format in videos or quizes" });
    }
    next();
  },
  validate(addUpdatelessonSchema),
  addLesson
);
router
  .route("/pdf/:lessonId")
  .patch(
    [auth, roleAuthorization([ROLES.ADMIN])],
    uploadPdf.array("pdfs"),
    addNewPDF
  );

router
  .route("/removePdf/:lessonId")
  .patch([auth, roleAuthorization([ROLES.ADMIN])], removePdf);

router
  .route("/:lessonId")
  .get(auth, getLessonDetail)
  .delete([auth, roleAuthorization([ROLES.ADMIN])], deleteLesson)
  .patch([auth, roleAuthorization([ROLES.ADMIN])], updateLessons);

module.exports = router;
