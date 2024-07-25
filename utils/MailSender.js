const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const PasswordReset = require("../models/utils_models/PasswordReset");
const Users = require("../models/doctor");
const config = require("../config");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: config.AUTH_EMAIL, pass: config.AUTH_PASS },
});

/**
 * Sends a password reset email with a verification code.
 * @param {string} email - The email address of the user.
 * @param {Object} user - The user object.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with status and message.
 */
const sendResetEmail = async (email, user, res) => {
  if (!user) {
    return res.status(400).json({ message: "Account not found" });
  }

  const verificationCode = `${Math.floor(100000 + Math.random() * 900000)}`;

  const mailOptions = {
    from: config.AUTH_EMAIL,
    to: email,
    subject: "Password Verification Code",
    html: `
      <div style="background-color: #f0f0f0; padding: 20px;">
        <h2 style="color: #333; font-size: 24px;">Password Verification Code</h2>
        <p style="color: #555; font-size: 16px;">Enter the verification code below to verify your email and initiate a password reset.</p>
        <p style="color: #555; font-size: 16px;"><b>Verification Code:</b> <span style="background-color: #e0e0e0; padding: 5px 10px; border-radius: 5px;">${verificationCode}</span></p>
        <p style="color: #555; font-size: 16px;">This code expires in 1 hour.</p>
      </div>
    `,
  };

  try {
    await PasswordReset.deleteMany({ userId: user._id });
    const salt = 10;
    const hashedVerificationCode = await bcrypt.hash(verificationCode, salt);

    const newPasswordReset = new PasswordReset({
      userId: user._id,
      verificationCode: hashedVerificationCode,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000, // 1 hour in milliseconds
    });

    await newPasswordReset.save();
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Verification code sent successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error sending verification code" });
  }
};

/**
 * Verifies the password reset code and prepares for password update.
 * @param {string} verificationCode - The verification code entered by the user.
 * @param {string} userId - The ID of the user.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with status and message.
 */
const resetPassword = async (verificationCode, userId, res) => {
  try {
    const passwordReset = await PasswordReset.findOne({ userId: userId });

    if (!passwordReset) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    const validPassword = await bcrypt.compare(
      verificationCode,
      passwordReset.verificationCode
    );

    if (!validPassword) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    await PasswordReset.deleteOne({ _id: passwordReset._id });

    return res.status(200).json({ message: "Email verification complete" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred" });
  }
};

/**
 * Updates the user's password.
 * @param {string} userId - The ID of the user.
 * @param {string} newPassword - The new password.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with status and message.
 */
const updateUserPassword = async (userId, newPassword, res) => {
  try {
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating password" });
  }
};

/**
 * Sends an email to a specified recipient .
 * @param {string} name - The name of the recipient.
 * @param {string} recipient - The email address of the recipient.
 * @param {string} subject - The subject of the email.
 * @param {string} message - The HTML content of the email.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with status and message.
 */
const sendEmail = async (name, recipient, subject, message, res) => {
  const mailOptions = {
    from: config.AUTH_EMAIL,
    to: recipient,
    subject: subject,
    html: `
    <div style="background-color: #f0f0f0; padding: 20px; border-radius: 10px; font-family: 'Arial', sans-serif; color: #333;">
    <h2 style="color: #007BFF; font-size: 20px; margin-bottom: 15px;">Hello ${name},</h2><br>
    ${message}
    </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error sending email" });
  }
};

module.exports = {
  sendResetEmail,
  resetPassword,
  updateUserPassword,
  sendEmail,
};