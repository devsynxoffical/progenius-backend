const Joi = require("joi");

const fileSchema = Joi.object({
  fieldname: Joi.string().required(),

  originalname: Joi.string().required().messages({
    "string.empty": "File name cannot be empty",
    "any.required": "File name is required",
  }),

  mimetype: Joi.string()
    .valid(
      "image/jpeg",
      "image/png",
      "image/jpg", // Image formats
      "application/pdf" // PDF format
    )
    .required()
    .messages({
      "any.only": "File must be an image (JPEG, PNG, JPG) or a PDF",
      "any.required": "File type is required",
    }),

  size: Joi.number()
    .max(10 * 1024 * 1024) // 10 MB max for PDFs and images
    .required()
    .messages({
      "number.max": "File size must not exceed 10 MB",
      "any.required": "File size is required",
    }),
}).unknown(true);

const fileValidation = {
  file: fileSchema,
};

module.exports = fileValidation;
