const jwt = require("jsonwebtoken");
const { envVariables, ROLES } = require("../config/Constants");
const AdminModel = require("../models/AdminModel");
const CustomerModel = require("../models/CustomerModel");
const { accessTokenSecret, shortTokenSecret } = envVariables;

const generateToken = (payload) => {
  const accessTokenDuration = "500d";
  const accessToken = jwt.sign(payload, accessTokenSecret, {
    expiresIn: accessTokenDuration,
  });
  return accessToken;
};

const storeToken = async (accessToken, userId, type = ROLES.CUSTOMER) => {
  if (type === ROLES.ADMIN) {
    return await AdminModel.updateOne(
      { _id: userId },
      { activeAccessToken: accessToken }
    );
  } else if (type === ROLES.CUSTOMER) {
    return await CustomerModel.updateOne(
      { _id: userId },
      { activeAccessToken: accessToken }
    );
  } else {
    throw new Error("Invalid user type");
  }
};

const verifyAccessToken = async (token) => {
  try {
    const userData = jwt.verify(token, accessTokenSecret);
    if (userData) {
      const { role } = userData;
      let dbUser = null;
      if (role === ROLES.ADMIN)
        dbUser = await AdminModel.findOne({ activeAccessToken: token });
      else if (role === ROLES.CUSTOMER)
        dbUser = await CustomerModel.findOne({
          activeAccessToken: token,
          status: "ACTIVE",
        });
      else dbUser = null;

      if (!dbUser) throw new Error("User not found");
      return userData;
    }
    throw error;
  } catch (error) {
    error.statusCode = 401; // Set custom status code for token verification errors
    error.message = "Token expired";
    throw error;
  }
};

const generateShortToken = (payload, time) => {
  return jwt.sign(payload, shortTokenSecret, { expiresIn: time });
};

const verifyShortToken = async (token) => {
  try {
    const userData = jwt.verify(token, shortTokenSecret);
    if (userData) {
      return userData;
    }
    throw new Error("Token verification failed");
  } catch (err) {
    err.statusCode = 422; // Set custom status code for token verification errors
    throw err;
  }
};

module.exports = {
  generateToken,
  storeToken,
  verifyAccessToken,
  generateShortToken,
  verifyShortToken,
};
