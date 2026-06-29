import nodemailer from 'nodemailer';
import { env } from '@oja/config';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false, // STARTTLS on port 587
  auth: {
    user: env.GMAIL_USER,
    pass: env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Send an OTP verification code via email.
 * Never logs the OTP code or Gmail App Password in production.
 */
export async function sendOtpEmail(toEmail: string, code: string): Promise<void> {
  if (env.NODE_ENV !== 'production') {
    console.log(`[DEV] OTP email would be sent to ${toEmail}`);
  }

  await transporter.sendMail({
    from: `"Oja Ogbomoso" <${env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Your Oja Ogbomoso verification code',
    text: `Your verification code is: ${code}. This code expires in 5 minutes.`,
  });
}
