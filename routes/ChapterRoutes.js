const { validate } = require("express-validation");
const { ROLES } = require("../config/Constants");
const {
  addChapter,
  deleteChapter,
  updateChapter,
  getChapterDetail,
  lockedunlockedChapter,
} = require("../controllers/ChapterController");
const auth = require("../middlewares/Auth");
const roleAuthorization = require("../middlewares/RoleAuthorization");
const { addUpdateChapterSchema } = require("../validations");

const router = require("express").Router();

router
  .route("/")
  .post(
    [auth, roleAuthorization([ROLES.ADMIN])],
    validate(addUpdateChapterSchema),
    addChapter
  );

router
  .route("/lock-unlock/:chapterId")
  .patch([auth, roleAuthorization([ROLES.ADMIN])], lockedunlockedChapter);
router
  .route("/:chapterId")
  .get(auth, getChapterDetail)
  .delete([auth, roleAuthorization([ROLES.ADMIN])], deleteChapter)
  .patch(
    [auth, roleAuthorization([ROLES.ADMIN])],
    validate(addUpdateChapterSchema),
    updateChapter
  );

module.exports = router;
