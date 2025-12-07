const AdminModel = require("../models/AdminModel");
const CustomerModel = require("../models/CustomerModel");
const { generateToken, storeToken } = require("../services/JwtService");
const AsyncWrapper = require("../utils/AsyncWrapper");
const { adminDTO, customerDTO } = require("../utils/DTOs");
const ErrorHandler = require("../utils/ErrorHandler");
const SuccessMessage = require("../utils/SuccessMessage");
const { removeFile } = require("../utils/fileDirectory");
const bcrypt = require("bcrypt");

const login = AsyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  const admin = await AdminModel.findOne({ email });
  if (!admin) {
    return next(new ErrorHandler("Invalid email or password", 422));
  }

  // Check if account is locked
  if (admin.lockUntil && admin.lockUntil > new Date()) {
    const unlockTime = admin.lockUntil.toLocaleString();
    return next(
      new ErrorHandler(`Account is locked. Try again after: ${unlockTime}`, 400)
    );
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    admin.passwordTries += 1;

    // Lock account if tries reach 5
    if (admin.passwordTries >= 5) {
      admin.lockUntil = new Date(Date.now() + 10 * 60 * 60 * 1000); // 10 hours
    }

    await admin.save();
    return next(new ErrorHandler("Invalid email or password", 422));
  }

  // Reset passwordTries and lockUntil on successful login
  admin.passwordTries = 0;
  admin.lockUntil = null;
  await admin.save();

  const accessToken = generateToken({
    _id: admin._id,
    role: admin.role,
  });

  await storeToken(accessToken, admin._id, "ADMIN");
  return SuccessMessage(
    res,
    "Logged in successfully",
    { userData: adminDTO(admin), accessToken },
    200
  );
});

// const register = AsyncWrapper(async (req, res, next) => {
//   const data = {
//     fullName: "Admin Khan",
//     email: "admin@example.com",
//     password: "Admin@1234",
//     phoneNumber: "03434423567",
//   };
//   const { fullName, email, password, phoneNumber } = data;
//   const existingAdmin = await AdminModel.findOne({ email });
//   if (existingAdmin) {
//     return next(new ErrorHandler("Email already exists", 409));
//   }
//   const hashedPassword = await bcrypt.hash(password, 10);
//   const admin = new AdminModel({
//     email,
//     fullName,
//     password: hashedPassword,
//     phoneNumber,
//   });
//   const result = await admin.save();
//   if (!result) {
//     return next(new ErrorHandler("Failed to register admin", 500));
//   }

//   return SuccessMessage(res, "Admin registered successfully");
// });

const profile = AsyncWrapper(async (req, res, next) => {
  const adminData = await AdminModel.findById(req.user._id).select(
    "-activeAccessToken -Password"
  );
  if (!adminData) {
    return next(new ErrorHandler("Admin not found", 404));
  }
  return SuccessMessage(res, "Admin fetched successfully", adminDTO(adminData));
});

const updateProfile = AsyncWrapper(async (req, res, next) => {
  const { phoneNumber, email, fullName } = req.body;

  const adminData = await AdminModel.findById({ _id: req.user._id });
  if (!adminData) {
    return next(new ErrorHandler("Admin not found", 404));
  }

  adminData.phoneNumber = phoneNumber;
  adminData.email = email;
  adminData.fullName = fullName;
  if (req?.file && adminData?.profilePicture) {
    removeFile(adminData.profilePicture);
  }
  adminData.profilePicture = req?.file?.filename || adminData.profilePicture;
  adminData.destination = req?.file?.destination || adminData.destination;
  await adminData.save();
  return SuccessMessage(
    res,
    "Admin profile updated successfully",
    adminDTO(adminData)
  );
});

const getAllCustomer = AsyncWrapper(async (req, res, next) => {
  const allCustomer = await CustomerModel.find();

  const customerData = allCustomer?.length
    ? allCustomer.map((user) => customerDTO(user))
    : [];
  return SuccessMessage(res, "Customer fetched successfully", customerData);
});

const deleteCustomer = AsyncWrapper(async (req, res, next) => {
  const customerData = await CustomerModel.findByIdAndDelete(req.params.id);
  if (!customerData) {
    return next(new ErrorHandler("Customer not found", 404));
  }
  return SuccessMessage(res, "Customer deleted successfully");
});

const updateCustomer = AsyncWrapper(async (req, res, next) => {
  const { status } = req.body;
  const customerData = await CustomerModel.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!customerData) {
    return next(new ErrorHandler("Customer not found", 404));
  }

  return SuccessMessage(
    res,
    "Customer status updated successfully",
    customerDTO(customerData)
  );
});

const updateCourseAcccess = AsyncWrapper(async (req, res, next) => {
  const { customerId } = req.params;
  const customerData = await CustomerModel.findById(customerId);
  if (!customerData) {
    return next(new ErrorHandler("Customer not found", 404));
  }

  customerData.accessPaidCourse = !customerData.accessPaidCourse;
  await customerData.save();
  return SuccessMessage(
    res,
    "Customer's course access updated successfully",
    customerDTO(customerData)
  );
});

module.exports = {
  login,
  // register,
  profile,
  updateProfile,
  getAllCustomer,
  deleteCustomer,
  updateCustomer,
  updateCourseAcccess,
};
