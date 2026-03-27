import nodemailer from 'nodemailer';

/**
 * TranspaSys Email Utility
 * 
 * Uses Nodemailer to send real emails via Brevo SMTP.
 * Requires BREVO_SMTP_LOGIN and BREVO_SMTP_KEY in .env.local
 */

const transporter = process.env.BREVO_SMTP_LOGIN && process.env.BREVO_SMTP_KEY 
  ? nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      auth: {
        user: process.env.BREVO_SMTP_LOGIN,
        pass: process.env.BREVO_SMTP_KEY,
      },
    })
  : null;

export async function sendNotificationEmail({ to, subject, body, userName }) {
  if (!transporter) {
    console.warn('[Email Warning] Brevo SMTP setup is missing. Mocking email to:', to);
    return true;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Barangay Transparency System" <kitrileysagusay45@gmail.com>`,
      to: to,
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #6366f1; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">TranspaSys Official Notice</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <p style="font-size: 16px; color: #334155;">Hello ${userName || 'Resident'},</p>
            <p style="font-size: 16px; color: #334155; line-height: 1.6;">${body}</p>
          </div>
          <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 12px; color: #64748b; margin: 0;">This is an automated message from your Barangay Transparency System.</p>
          </div>
        </div>
      `,
    });
    console.log(`[Email Success] Sent to ${to}:`, info.messageId);
    return true;
  } catch (error) {
    console.error(`[Email Error] Failed to send to ${to}:`, error);
    return false;
  }
}

export async function notifyAllResidents({ supabase, subject, body }) {
  const { data: residents } = await supabase
    .from('users')
    .select('email, name')
    .eq('is_approved', true)
    .eq('role', 'user');

  if (!residents) return;

  console.log(`[Email Mock] Notifying ${residents.length} residents...`);

  const promises = residents.map((r) => 
    sendNotificationEmail({
      to: r.email,
      userName: r.name,
      subject,
      body
    })
  );

  await Promise.all(promises);
}

export async function sendRegistrationEmail(to, confirmationUrl) {
  if (!transporter) {
    console.warn('[Email Warning] Brevo SMTP missing. Mocking registration email to:', to);
    return true;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Barangay Transparency System" <kitrileysagusay45@gmail.com>`,
      to: to,
      subject: "Confirm Your Registration",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Confirm Your Registration</title>
        </head>
        <body style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 40px 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 35px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700;">Welcome to TranspaSys!</h1>
                </div>
                <div style="padding: 40px 30px; text-align: center;">
                    <div style="background-color: #eef2ff; width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                        <h1 style="font-size: 30px; margin: 0; padding-top: 5px;">🚀</h1>
                    </div>
                    <p style="font-size: 16px; color: #475569; margin-bottom: 24px; line-height: 1.6; text-align: left;">
                        Hi there,<br><br>
                        Thank you for registering on the <strong>Barangay Transparency System</strong>! Before you can log in, access your dashboard, and participate in the community, you must verify your email address.
                    </p>
                    <a href="${confirmationUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 15px 0 30px;">
                        Verify Email Address
                    </a>
                    <p style="font-size: 14px; color: #94a3b8; margin-bottom: 0;">
                        If you didn't create an account, you can safely ignore this email.
                    </p>
                </div>
                <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 12px; color: #64748b; margin: 0;">&copy; 2026 Barangay Transparency System. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `
    });
    console.log(`[Email Success] Registration email sent to ${to}:`, info.messageId);
    return true;
  } catch (error) {
    console.error(`[Email Error] Failed to send registration email to ${to}:`, error);
    return false;
  }
}
