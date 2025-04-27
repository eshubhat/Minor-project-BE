import nodemailer from "nodemailer";

// Create the transporter
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // Secure from .env
    pass: process.env.GMAIL_PASS,
  },
});

// Define a reusable function to send email
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
