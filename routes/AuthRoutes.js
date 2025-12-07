const { validate } = require("express-validation");
const {
  sendOtpSchema,
  verifyOtpSchema,
  updatePasswordSchema,
} = require("../validations");
const {
  sendOTP,
  verifyOTP,
  updatePassword,
} = require("../controllers/AuthController");

const router = require("express").Router();

router.post("/send-otp", validate(sendOtpSchema), sendOTP);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOTP);
router.patch(
  "/update-password",
  validate(updatePasswordSchema),
  updatePassword
);

module.exports = router;
