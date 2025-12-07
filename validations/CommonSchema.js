const Joi = require("joi");

const phoneSchema = Joi.string().pattern(/^\d+$/).required().messages({
  "string.pattern.base": "Phone number must contain only digits.",
  "string.empty": "Phone number is required.",
  "any.required": "Phone number is required.",
});

const emailSchema = Joi.string()
  .email({ tlds: { allow: true } }) // Disable strict TLD validation
  .required()
  .messages({
    "string.email": "Please enter a valid email address.",
    "string.empty": "Email is required.",
    "any.required": "Email is required.",
  });

const passwordSchema = Joi.string()
  .pattern(
    new RegExp(
      '^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,100}$'
    )
  )
  .required()
  .messages({
    "string.pattern.base":
      "Password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character, and be 8-100 characters long",
  });

const fullNameSchema = Joi.string().required().max(70);

const loginSchema = {
  body: Joi.object({
    phoneNumber: phoneSchema.optional(),
    email: emailSchema.optional(),
    password: Joi.string().required(),
  }).xor("phoneNumber", "email"), // Ensures one of these is required, but not both
};

const signupSchema = {
  body: Joi.object({
    phoneNumber: phoneSchema,
    email: emailSchema,
    password: Joi.string().required(),
    fullName: fullNameSchema,
  }),
};

module.exports = {
  phoneSchema,
  emailSchema,
  passwordSchema,
  loginSchema,
  fullNameSchema,
  signupSchema,
};
