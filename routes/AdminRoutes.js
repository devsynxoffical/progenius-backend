const router = require("express").Router();
const { validate } = require("express-validation");
const { ROLES } = require("../config/Constants");
const {
  login,
  // register,
  profile,
  updateProfile,
  getAllCustomer,
  deleteCustomer,
  updateCustomer,
  updateCourseAcccess,
} = require("../controllers/AdminController");
const auth = require("../middlewares/Auth");
const roleAuthorization = require("../middlewares/RoleAuthorization");
const { adminUpdateProfile, updateCustomerSchema } = require("../validations");
const { loginSchema, signupSchema } = require("../validations/CommonSchema");
const { uploadSingleFile } = require("../utils/ImageUpload");

router
  .route("/")
  .get([auth, roleAuthorization([ROLES.ADMIN])], profile)
  .patch(
    [auth, roleAuthorization([ROLES.ADMIN])],
    uploadSingleFile,
    validate(adminUpdateProfile),
    updateProfile
  );
router.route("/signin").post(validate(loginSchema), login);
// router.route("/signup").get(register);
router
  .route("/customers")
  .get([auth, roleAuthorization([ROLES.ADMIN])], getAllCustomer);

router
  .route("/customer/:id")
  .delete([auth, roleAuthorization([ROLES.ADMIN])], deleteCustomer)
  .patch(
    [auth, roleAuthorization([ROLES.ADMIN])],
    validate(updateCustomerSchema),
    updateCustomer
  );

router
  .route("/customer/update-access/:customerId")
  .patch([auth, roleAuthorization([ROLES.ADMIN])], updateCourseAcccess);

module.exports = router;
