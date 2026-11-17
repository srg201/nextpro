import type { GenericCtx } from "@convex-dev/better-auth";
import { requireActionCtx } from "@convex-dev/better-auth/utils";
import { internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";

type OtpType =
  | "sign-in"
  | "email-verification"
  | "forget-password"
  | "change-email";

const OTP_SUBJECTS: Record<OtpType, string> = {
  "sign-in": "Your sign-in verification code",
  "email-verification": "Confirm your email address",
  "forget-password": "Reset your password",
  "change-email": "Confirm your new email address",
};

const layout = (title: string, body: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 420px; margin: 0 auto; color: #111;">
    <h2 style="margin-bottom: 16px;">${title}</h2>
    ${body}
    <p style="color: #666; font-size: 12px; margin-top: 24px;">
      If you didn't request this, you can safely ignore this email. Never share this code with anyone.
    </p>
  </div>
`;

// Emails are sent by a Node action (nodemailer + Gmail SMTP), see mailer.ts.
// Better Auth runs its email callbacks inside Convex HTTP actions, so the auth
// ctx is an action ctx and can call it directly.
async function sendEmail(ctx: GenericCtx<DataModel>, to: string, subject: string, html: string) {
  await requireActionCtx(ctx).runAction(internal.mailer.send, { to, subject, html });
}

export async function sendOtpEmail(
  ctx: GenericCtx<DataModel>,
  to: string,
  otp: string,
  type: OtpType,
  expiresInMinutes: number
) {
  const subject = OTP_SUBJECTS[type];
  await sendEmail(
    ctx,
    to,
    subject,
    layout(
      subject,
      `
        <p>Your verification code is:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px;">${otp}</span>
        </div>
        <p>This code expires in ${expiresInMinutes} minutes.</p>
      `
    )
  );
}

export async function sendExistingAccountEmail(ctx: GenericCtx<DataModel>, to: string) {
  await sendEmail(
    ctx,
    to,
    "Sign-up attempt with your email",
    layout(
      "Someone tried to sign up with your email",
      `
        <p>An account with this email address already exists.</p>
        <p>If this was you, sign in instead or use "Forgot password" to reset your password.</p>
      `
    )
  );
}

export async function sendPasswordChangedEmail(ctx: GenericCtx<DataModel>, to: string) {
  await sendEmail(
    ctx,
    to,
    "Your password was changed",
    layout(
      "Your password was changed",
      `
        <p>The password for your account was just reset and all active sessions were signed out.</p>
        <p>If this wasn't you, reset your password immediately.</p>
      `
    )
  );
}
