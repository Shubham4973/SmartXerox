const nodemailer = require("nodemailer");
require("dotenv").config(); // if not already

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendMail(to, subject, html) {
    await transporter.sendMail({
        from: `"SmartXerox" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    });
}

module.exports = sendMail;
