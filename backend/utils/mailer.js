// utils/mailer.js
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // ✅ REQUIRED for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
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