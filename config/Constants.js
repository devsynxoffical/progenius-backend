require("dotenv").config();
const envVariables = {
  appPort: process.env.PORT,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  shortTokenSecret: process.env.SHORT_TOKEN_SECRET,
  hashSecret: process.env.HASH_SECRET,
  mongoDbURI: process.env.MONGODB_URI,
  supportEmail: process.env.SMTP_SUPPORT_USER_EMAIL,
  smtpHost: process.env.SMTP_HOST,
  smtpPassword: process.env.SMTP_USER_PASS,
};

const ROLES = {
  ADMIN: "ADMIN",
  CUSTOMER: "CUSTOMER",
};

module.exports = {
  envVariables,
  ROLES,
};
