const cryptoHash = require("./HashingService");
const crypto = require("crypto");

async function generateOtp(email) {
  const otp = crypto.randomInt(100000, 999999);
  const ttl = 1000 * 60 * 5; // 1 minutes
  const expire = Date.now() + ttl; // current time +  ttl (time to leave)
  const data = `${email}.${expire}.${otp}`;
  let hashedOtp = await cryptoHash(data);
  return { otp, hashedOtp, expire };
}

async function verifyOtp(data, hashedOtp) {
  const computedHash = await cryptoHash(data);
  return computedHash === hashedOtp;
}

module.exports = {
  generateOtp,
  verifyOtp,
};
