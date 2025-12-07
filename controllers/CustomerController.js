const CourseModel = require("../models/CourseModel");
const CustomerModel = require("../models/CustomerModel");
const { generateToken, storeToken } = require("../services/JwtService");
const AsyncWrapper = require("../utils/AsyncWrapper");
const { customerDTO } = require("../utils/DTOs");
const ErrorHandler = require("../utils/ErrorHandler");
const SuccessMessage = require("../utils/SuccessMessage");
const { removeFile } = require("../utils/fileDirectory");
const bcrypt = require("bcrypt");

const login = AsyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  const customer = await CustomerModel.findOne({ email, status: "ACTIVE" });
  if (!customer) {
    return next(new ErrorHandler("Invalid email or password", 422));
  }

  // Check if account is locked
  if (customer.lockUntil && customer.lockUntil > new Date()) {
    const unlockTime = customer.lockUntil.toLocaleString();
    return next(
      new ErrorHandler(`Account is locked. Try again after: ${unlockTime}`, 400)
    );
  }

  const isPasswordValid = await bcrypt.compare(password, customer.password);

  if (!isPasswordValid) {
    customer.passwordTries += 1;

    // Lock account if tries reach 5
    if (customer.passwordTries >= 5) {
      customer.lockUntil = new Date(Date.now() + 10 * 60 * 60 * 1000); // 10 hours
    }

    await customer.save();
    return next(new ErrorHandler("Invalid email or password", 422));
  }

  if (customer.status === "BLOCKED") {
    return next(
      new ErrorHandler("Your account has been blocked by admin", 422)
    );
  }

  // Reset passwordTries and lockUntil on successful login
  customer.passwordTries = 0;
  customer.lockUntil = null;
  await customer.save();

  const accessToken = generateToken({
    _id: customer._id,
    role: customer.role,
  });

  await storeToken(accessToken, customer._id);
  return SuccessMessage(
    res,
    "Logged in successfully",
    { userData: customerDTO(customer), accessToken },
    200
  );
});

const register = AsyncWrapper(async (req, res, next) => {
  const { fullName, email, password, phoneNumber } = req.body;
  const existingCustomer = await CustomerModel.findOne({ email });
  if (existingCustomer) {
    return next(new ErrorHandler("Email already exists", 409));
  }

  const existingPhone = await CustomerModel.findOne({ phoneNumber });
  if (existingPhone) {
    return next(new ErrorHandler("Phone number already exists", 409));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = new CustomerModel({
    email,
    fullName,
    password: hashedPassword,
    phoneNumber,
  });
  const result = await admin.save();
  if (!result) {
    return next(new ErrorHandler("Failed to register admin", 500));
  }

  return SuccessMessage(res, "Customer registered successfully");
});

const updateProfile = AsyncWrapper(async (req, res, next) => {
  const { _id } = req.user;
  const { fullName, phoneNumber, email } = req.body;

  const customer = await CustomerModel.findOne({ _id, status: "ACTIVE" });
  if (!customer) {
    return next(new ErrorHandler("Failed to update profile", 500));
  }
  const existingCustomer = await CustomerModel.findOne({
    $or: [{ email }, { phoneNumber }],
    _id: { $ne: _id }, // Exclude the current user's ID
  });

  if (existingCustomer) {
    return next(new ErrorHandler("Email or phone number already exists", 409));
  }

  customer.fullName = fullName;
  customer.email = email;
  customer.phoneNumber = phoneNumber;
  if (req?.file && customer?.profilePicture) {
    removeFile(customer.profilePicture);
  }

  customer.profilePicture = req?.file
    ? req.file.filename
    : customer.profilePicture;
  customer.destination = req?.file
    ? req.file.destination
    : customer.destination;
  const result = await customer.save();
  if (!result) {
    return next(new ErrorHandler("Failed to update profile", 500));
  }
  return SuccessMessage(
    res,
    "Profile updated successfully",
    customerDTO(result)
  );
});

const getProfile = AsyncWrapper(async (req, res, next) => {
  const { _id } = req.user;
  const customer = await CustomerModel.findOne({ _id, status: "ACTIVE" });
  if (!customer) {
    return next(new ErrorHandler("Failed to retrieve profile", 500));
  }
  return SuccessMessage(
    res,
    "Profile retrieved successfully",
    customerDTO(customer)
  );
});

const getPaiCourses = AsyncWrapper(async (req, res, next) => {
  const { _id } = req.user;
  const courses = await CourseModel.find({
    students: _id,
  }).select("-students");

  return SuccessMessage(res, "Courses for this customer", courses);
});

module.exports = { login, register, updateProfile, getProfile, getPaiCourses };
