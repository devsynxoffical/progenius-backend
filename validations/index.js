const Joi = require("joi");
const { fullNameSchema, emailSchema, phoneSchema } = require("./CommonSchema");
const { ROLES } = require("../config/Constants");

const adminUpdateProfile = {
  body: Joi.object({
    email: emailSchema,
    fullName: fullNameSchema,
    phoneNumber: phoneSchema,
  }),
};

const updateCustomerSchema = {
  body: Joi.object({
    email: emailSchema,
    fullName: fullNameSchema,
    phoneNumber: phoneSchema,
    status: Joi.string().required().valid("ACTIVE", "BLOCKED"),
  }),
};

const addUpdateCourseSchema = {
  body: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().optional(),
    status: Joi.string().required().valid("PAID", "UNPAID"),
    noOfStudents: Joi.number().optional().default(0),
  }),
};

const addUpdateChapterSchema = {
  body: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().optional(),
    isLocked: Joi.boolean().required(),
    course: Joi.string().required(),
  }),
};

const assignCourse = {
  body: Joi.object({
    courseId: Joi.string().required(),
    customerIds: Joi.array().items(Joi.string().required()).required(),
  }),
};

const videoQuizSchema = Joi.object({
  title: Joi.string().required(), // Title for each quiz
  url: Joi.string().required(), // Quiz URL
});

const addUpdatelessonSchema = {
  body: Joi.object({
    title: Joi.string().required(),
    chapter: Joi.string().required(),
    videos: Joi.array().items(videoQuizSchema).default([]).optional(),
    quizes: Joi.array().items(videoQuizSchema).default([]).optional(),
  }),
};

const sendOtpSchema = {
  body: Joi.object({
    email: emailSchema,
  }),
};

const verifyOtpSchema = {
  body: Joi.object({
    email: emailSchema,
    hashedOtp: Joi.string().required(),
    otp: Joi.string().required(),
  }),
};

const updatePasswordSchema = {
  body: Joi.object({
    password: Joi.string().required(),
    token: Joi.string().required(),
  }),
};

module.exports = {
  adminUpdateProfile,
  updateCustomerSchema,
  addUpdateCourseSchema,
  addUpdateChapterSchema,
  assignCourse,
  addUpdatelessonSchema,
  sendOtpSchema,
  verifyOtpSchema,
  updatePasswordSchema,
};
