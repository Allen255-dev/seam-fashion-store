import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  // Return early or log if SMTP is not configured, to prevent app crashing during development
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP credentials not provided. Email not sent:", options.subject, "to", options.email);
    console.warn("Content:", options.message);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'SEAM Store'}" <${process.env.FROM_EMAIL || 'noreply@seam.test'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.htmlMessage,
  };

  await transporter.sendMail(mailOptions);
};
