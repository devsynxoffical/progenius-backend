const CustomerModel = require("../models/CustomerModel");
const {
  generateShortToken,
  verifyShortToken,
} = require("../services/JwtService");
const { generateOtp, verifyOtp } = require("../services/OtpService");
const AsyncWrapper = require("../utils/AsyncWrapper");
const { sendOtpEmail } = require("../utils/Email");
const ErrorHandler = require("../utils/ErrorHandler");
const SuccessMessage = require("../utils/SuccessMessage");
const bcrypt = require("bcrypt");

const sendOTP = AsyncWrapper(async (req, res, next) => {
  const { email } = req.body;
  const user = await CustomerModel.findOne({ email: email, status: "ACTIVE" });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  const { otp, hashedOtp, expire } = await generateOtp(email);

  await sendOtpEmail(email, otp);

  return SuccessMessage(res, "Otp sent successfully", {
    hashedOtp: `${hashedOtp}.${expire}`,
  });
});

const verifyOTP = AsyncWrapper(async (req, res, next) => {
  const { email, hashedOtp, otp } = req.body;
  const [hash, expire] = hashedOtp.split(".");

  const user = await CustomerModel.findOne({ email: email, status: "ACTIVE" });

  if (Date.now() > +expire) {
    return next(new ErrorHandler("OTP expired", 400));
  }

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const data = `${email}.${expire}.${otp}`;
  const isValid = await verifyOtp(data, hash);
  if (!isValid) {
    return next(new ErrorHandler("Incorrect OTP", 400));
  }

  await user.save();
  const token = generateShortToken(
    {
      _id: user._id,
      role: user.role,
    },
    "5m"
  );
  return SuccessMessage(res, "OTP verified successfully", { token });
});

const updatePassword = AsyncWrapper(async (req, res, next) => {
  const { password, token } = req.body;
  const { _id, role } = await verifyShortToken(token);

  const user = await CustomerModel.findById(_id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  await user.save();
  return SuccessMessage(res, "Password updated successfully");
});

module.exports = {
  verifyOTP,
  sendOTP,
  updatePassword,
};
