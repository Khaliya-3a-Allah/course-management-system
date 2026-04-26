import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  requireTLS: true,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

function ensureMailerConfigured() {
  if (!env.EMAIL_USER || !env.EMAIL_PASS) {
    throw new Error("Email is not configured. Set EMAIL_USER and EMAIL_PASS in the backend environment.");
  }
}

export async function sendVerificationEmail(toEmail, code) {
  ensureMailerConfigured();
  await transporter.sendMail({
    from: `"Courseware" <${env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Verify your Courseware account",
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background:#0c0c0e;font-family:'Segoe UI',Arial,sans-serif;">
          <div style="max-width:480px;margin:40px auto;background:#16161a;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
            <div style="height:4px;background:linear-gradient(90deg,#d97706,#f59e0b);"></div>
            <div style="padding:36px 32px;">
              <h1 style="margin:0 0 8px;font-size:1.6rem;color:#f5f2ec;font-weight:700;">Verify your email</h1>
              <p style="margin:0 0 28px;color:#9ca3af;font-size:0.95rem;line-height:1.6;">
                Enter this 6-digit code to activate your Courseware account. It expires in <strong style="color:#d97706;">15 minutes</strong>.
              </p>
              <div style="text-align:center;margin:0 0 28px;">
                <span style="display:inline-block;font-size:2.4rem;font-weight:800;letter-spacing:0.35em;color:#f5f2ec;background:rgba(217,119,6,0.1);border:1px solid rgba(217,119,6,0.3);border-radius:12px;padding:16px 28px;">
                  ${code}
                </span>
              </div>
              <p style="margin:0;color:#6b7280;font-size:0.8rem;line-height:1.6;">
                If you didn't create a Courseware account, you can safely ignore this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendPasswordCodeEmail(toEmail, code, purpose = "reset") {
  ensureMailerConfigured();
  const isChange = purpose === "change";
  await transporter.sendMail({
    from: `"Courseware" <${env.EMAIL_USER}>`,
    to: toEmail,
    subject: isChange ? "Confirm your Courseware password change" : "Reset your Courseware password",
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background:#0c0c0e;font-family:'Segoe UI',Arial,sans-serif;">
          <div style="max-width:480px;margin:40px auto;background:#16161a;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
            <div style="height:4px;background:linear-gradient(90deg,#d97706,#f59e0b);"></div>
            <div style="padding:36px 32px;">
              <h1 style="margin:0 0 8px;font-size:1.55rem;color:#f5f2ec;font-weight:700;">
                ${isChange ? "Confirm password change" : "Reset your password"}
              </h1>
              <p style="margin:0 0 28px;color:#9ca3af;font-size:0.95rem;line-height:1.6;">
                Enter this 6-digit code in Courseware. It expires in <strong style="color:#d97706;">15 minutes</strong>.
              </p>
              <div style="text-align:center;margin:0 0 28px;">
                <span style="display:inline-block;font-size:2.4rem;font-weight:800;letter-spacing:0.35em;color:#f5f2ec;background:rgba(217,119,6,0.1);border:1px solid rgba(217,119,6,0.3);border-radius:12px;padding:16px 28px;">
                  ${code}
                </span>
              </div>
              <p style="margin:0;color:#6b7280;font-size:0.8rem;line-height:1.6;">
                If you did not request this, ignore this email and your password will stay the same.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}
