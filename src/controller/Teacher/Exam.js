import mongoose, { Types } from "mongoose";
import Exam from "../../DB/exam.js";
import { transporter } from "../../utils/nodemailer.js";

// Create Exam
export const CreateExam = async (req, res) => {
  try {
    const exam = new Exam(req.body);
    await exam.save();
    res.status(201).json({ message: "Exam created successfully", exam });
  } catch (error) {
    res.status(500).json({ message: "Failed to create exam", error });
  }
};

// Fetch Exams
export const FetchExams = async (req, res) => {
  try {
    const { teacherName } = req.params;
    if (!teacherName) {
      return res.status(400).json({ message: "Teacher name not provided" });
    }
    const exams = await Exam.find({ teacher: teacherName });
    return res.status(200).json({ message: "Fetched exams", exams });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch exams", error });
  }
};

// sendEmail function (dynamic now)
export const sendEmail = async (req, res) => {
  try {
    const { to, subject, htmlContent } = req.body;

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("sendEmail Error:", error);
    return res.status(500).json({ message: "Failed to send email", error });
  }
};
