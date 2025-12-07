const { sendSupportMail } = require("../services/NodemailerService");

/**
 * Send password on user email
 * @param {string} email - User email address
 * @param {string} password - User password
 * @param {string} fullName - User Full Name
 */

// const sendPassword = async (email, password, fullName) => {
//   const message = {
//     to: email,
//     subject: "Welcome to Adawat 360",
//     html: `<p>Hello <strong>${fullName}</strong>,</p>
//           <p>Welcome to <strong>Adawat 360</strong>! Your account has been created successfully. You can login using below credential:</p>
//           <p><strong>Email:</strong> ${email}</p>
//           <p><strong>Password:</strong> ${password}</p>
//           <p>Please log in and update your password as soon as possible for security reasons.</p>
//           <p>If you did not request an account, or have any questions, please reach out to us.</p>
//           <p>Best regards,<br>
//           The <strong>Adawat 360</strong> Team</p>
//         `,
//   };
//   await sendSupportMail(message);
//   return;
// };

/**
 * Send otp on user email
 * @param {string} email - User email address
 * @param {string} otp - OTP
 */

const sendOtpEmail = async (userEmail, otp) => {
  const message = {
    to: userEmail,
    subject: "Welcome to Progenius",
    html: `<p>Dear User,</p>
  <p>We received a request to reset your password for your Progenius account.</p>
  <p><strong>Your One-Time Password (OTP) is:</strong></p>
  <h2 style="color: #2e6da4;">${otp}</h2>
  <p>Please do not share it with anyone.</p>
<p>If you did not request a password reset, please ignore this email or contact our support team immediately.</p>
<p>Best regards,<br />
Progenius Support Team</p>
        `,
  };
  await sendSupportMail(message);
  return;
};

module.exports = {
  sendOtpEmail,
};
