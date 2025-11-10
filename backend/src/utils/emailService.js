import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

export const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'AgriConnect - Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #16a34a;">Welcome to AgriConnect!</h2>
        <p>Thank you for registering with us. To complete your registration, please verify your email address using the OTP below:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #1f2937; font-size: 32px; margin: 0; letter-spacing: 4px;">${otp}</h1>
        </div>
        <p><strong>Important:</strong> This OTP will expire in 10 minutes for security reasons.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 14px;">Best regards,<br>The AgriConnect Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};
