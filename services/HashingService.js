const crypto = require("crypto");
const { envVariables } = require("../config/Constants");
/**
 * Hash the provided data using HMAC SHA256
 * @param {string} data - The data to hash
 * @returns {string} - The hashed value
 */
async function cryptoHash(data) {
  const hash = await crypto
    .createHmac("sha256", envVariables.hashSecret)
    .update(data)
    .digest("hex");
  return hash;
}

module.exports = cryptoHash;
