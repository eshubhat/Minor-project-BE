import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';

// Get current directory path when using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generates a certificate PDF and sends it via email
 * @param {Object} studentData - The student data for the certificate
 * @param {string} studentData.email - Student's email address
 * @param {string} studentData.name - Student's name
 * @param {string} studentData.course - Course title
 * @param {string} studentData.completionDate - Completion date
 */
export async function generateAndSendCertificate(studentData) {
  try {
    // 1. Read the HTML template
    const templatePath = path.join(__dirname, 'certificate.html');
    const templateHtml = fs.readFileSync(templatePath, 'utf8');
    
    // 2. Compile the template with Handlebars
    const template = handlebars.compile(templateHtml);
    
    // 3. Set the certificate data with image paths
    const certificateData = {
      name: studentData.name,
      course: studentData.course,
      completionDate: studentData.completionDate,
      logoUrl: path.join(__dirname, 'public', 'logo.png'), // Update with your logo path
      qrCodeUrl: path.join(__dirname, 'public', 'qr.jpg'), // Update with your QR path
    };
    
    // 4. Apply the data to the template
    const html = template(certificateData);
    
    // 5. Create a temporary HTML file with the CSS
    const tempHtmlPath = path.join(__dirname, `certificate-${Date.now()}.html`);
    const cssPath = path.join(__dirname, 'DroneStyles.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Add the CSS inline to ensure it's included in the PDF
    const htmlWithCss = html.replace('</head>', `<style>${cssContent}</style></head>`);
    fs.writeFileSync(tempHtmlPath, htmlWithCss);
    
    // 6. Launch a headless browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // 7. Load the HTML file
    await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle0' });
    
    // 8. Generate PDF
    const pdfPath = path.join(__dirname, `certificate-${studentData.name.replace(/\s+/g, '-')}.pdf`);
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
      }
    });
    
    await browser.close();
    
    // 9. Clean up the temporary HTML file
    fs.unlinkSync(tempHtmlPath);
    
    // 10. Send the PDF via email
    await sendCertificateEmail(studentData.email, studentData.name, pdfPath);
    
    // 11. Optional: Remove the PDF file after sending
    // fs.unlinkSync(pdfPath);
    
    console.log(`Certificate sent to ${studentData.email}`);
    return { success: true, message: 'Certificate generated and sent successfully' };
    
  } catch (error) {
    console.error('Error generating or sending certificate:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Sends the certificate as an email attachment
 * @param {string} email - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} pdfPath - Path to the PDF file
 */
async function sendCertificateEmail(email, name, pdfPath) {
  // Configure your email transporter (you mentioned you already have Nodemailer set up)
  const transporter = nodemailer.createTransport({
    // Your nodemailer configuration here
    // Example:
    service: 'gmail',
    auth: {
      user: 'eshubhat03@gmail.com',
      pass: 'shtt qlkm bzsr ntcx'
    }
  });
  
  // Email options
  const mailOptions = {
    from: '"Drone Certification" eshubhat03@gmail.com',
    to: email,
    subject: 'Your Drone Operator Certificate',
    text: `Dear ${name},\n\nCongratulations on completing your drone operator certification! Please find your certificate attached to this email.\n\nBest regards,\nThe Drone Certification Team`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Congratulations on Your Achievement!</h2>
        <p>Dear ${name},</p>
        <p>We are pleased to present you with your Drone Operator Certificate. Your dedication and hard work have paid off!</p>
        <p>Please find your certificate attached to this email.</p>
        <p>Best regards,<br>The Drone Certification Team</p>
      </div>
    `,
    attachments: [
      {
        filename: `${name.replace(/\s+/g, '-')}-Drone-Certificate.pdf`,
        path: pdfPath,
        contentType: 'application/pdf'
      }
    ]
  };
  
  // Send the email
  return transporter.sendMail(mailOptions);
}

// Example usage in an Express route:
// app.post('/send-certificate', async (req, res) => {
//   try {
//     const studentData = {
//       email: req.body.email,
//       name: req.body.name,
//       course: req.body.course || 'Drone Operator Certification',
//       completionDate: new Date().toLocaleDateString('en-US', { 
//         year: 'numeric', 
//         month: 'long', 
//         day: 'numeric' 
//       })
//     };
//     
//     const result = await generateAndSendCertificate(studentData);
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });