const { verifyAccessToken } = require("../services/JwtService");
const ErrorHandler = require("../utils/ErrorHandler");

const auth = async (req, res, next) => {
  try {
    const accesstoken = req.header("Authorization")?.split(" ")[1];
    if (!accesstoken) {
      return next(new ErrorHandler("Token not provided", 404));
    }
    const userData = await verifyAccessToken(accesstoken);
    req.user = userData;
    next();
  } catch (error) {
    return next(new ErrorHandler("JWT expired", 401));
  }
};

module.exports = auth;
