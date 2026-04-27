// utils/mailer.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

exports.sendResetEmail = async (toEmail, code) => {
  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: toEmail,
    subject: "Password Reset Code",
    html: `
      <div style="font-family: Arial;">
        <h2>Password Reset</h2>
        <p>Use the following code to reset your password:</p>

        <h1 style="
          letter-spacing:5px;
          color:#17B8A6;
        ">
          ${code}
        </h1>

        <p>This code expires in <b>15 minutes</b>.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};