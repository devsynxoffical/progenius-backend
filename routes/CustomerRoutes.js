const router = require("express").Router();
const { validate } = require("express-validation");
const { loginSchema, signupSchema } = require("../validations/CommonSchema");
const {
  login,
  getProfile,
  updateProfile,
  register,
  getPaiCourses,
} = require("../controllers/CustomerController");
const auth = require("../middlewares/Auth");
const roleAuthorization = require("../middlewares/RoleAuthorization");
const { ROLES } = require("../config/Constants");
const { updateCustomerSchema } = require("../validations");
const { uploadSingleFile } = require("../utils/ImageUpload");

router
  .route("/")
  .get([auth, roleAuthorization([ROLES.CUSTOMER])], getProfile)
  .patch(
    [auth, roleAuthorization([ROLES.CUSTOMER])],
    uploadSingleFile,
    validate(updateCustomerSchema),
    updateProfile
  );

router
  .route("/paid-courses")
  .get([auth, roleAuthorization([ROLES.CUSTOMER])], getPaiCourses);

router.route("/signin").post(validate(loginSchema), login);
router.route("/signup").post(validate(signupSchema), register);

module.exports = router;
