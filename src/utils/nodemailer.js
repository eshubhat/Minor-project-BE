import nodemailer from "nodemailer";

// Create the transporter
export const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "eshubhat03",
    pass: "mkms wlno jfss afdb",
  },
});
