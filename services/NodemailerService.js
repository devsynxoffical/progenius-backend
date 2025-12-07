const nodemailer = require("nodemailer");
const { envVariables } = require("../config/Constants");
const { smtpHost, supportEmail, smtpPassword } = envVariables;

const supportTransporter = nodemailer.createTransport({
  host: smtpHost,
  port: 465, // Use 587 if you're using TLS
  secure: true, // true for port 465 (SSL), false for 587 (TLS)
  auth: {
    user: supportEmail,
    pass: smtpPassword,
  },
});

const sendSupportMail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: supportEmail,
    to,
    subject,
    html,
  };

  try {
    const info = await supportTransporter.sendMail(mailOptions);
    console.log("Email sent");
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};

module.exports = {
  sendSupportMail,
};
