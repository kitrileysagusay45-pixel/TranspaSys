import nodemailer from 'nodemailer';

/**
 * TranspaSys Email Utility
 * 
 * Uses Nodemailer to send real emails via Gmail.
 * Requires GMAIL_USER and GMAIL_APP_PASSWORD in .env.local
 */

const transporter = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD 
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
  : null;

export async function sendNotificationEmail({ to, subject, body, userName }) {
  if (!transporter) {
    console.warn('[Email Warning] GMAIL setup is missing. Mocking email to:', to);
    return true;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Barangay Transparency System" <${process.env.GMAIL_USER}>`,
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
