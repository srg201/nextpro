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

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set in the Convex environment");
  }

  // Dev only: Resend's test sender can deliver only to the account owner.
  const override = process.env.EMAIL_OVERRIDE_TO;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "NextPro <onboarding@resend.dev>",
      to: override || to,
      subject: override ? `[to: ${to}] ${subject}` : subject,
      html,
    }),
  });

  if (!res.ok) {
    console.error("Resend error:", res.status, await res.text());
    throw new Error("Failed to send email");
  }
}

export async function sendOtpEmail(
  to: string,
  otp: string,
  type: OtpType,
  expiresInMinutes: number
) {
  const subject = OTP_SUBJECTS[type];
  await sendEmail(
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

export async function sendExistingAccountEmail(to: string) {
  await sendEmail(
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

export async function sendPasswordChangedEmail(to: string) {
  await sendEmail(
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
