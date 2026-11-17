"use node";

import nodemailer, { type Transporter } from "nodemailer";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";

// Gmail SMTP settings, as listed in nodemailer's well-known services.
// `secure: true` is only correct for port 465 (implicit TLS).
const GMAIL_SMTP = { host: "smtp.gmail.com", port: 465, secure: true } as const;
const SEND_TIMEOUT_MS = 20_000;

let transporter: Transporter | null = null;

function getConfig() {
  const user = process.env.GMAIL_USER?.trim();
  // Google shows app passwords in groups of four ("abcd efgh ijkl mnop"); spaces are not part of it.
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  if (!user || !pass) {
    throw new Error(
      "GMAIL_USER and GMAIL_APP_PASSWORD must be set in the Convex environment (npx convex env set ...)",
    );
  }
  return { user, pass };
}

function getTransporter(user: string, pass: string): Transporter {
  // Reused across sends while this Node action instance stays warm.
  transporter ??= nodemailer.createTransport({
    ...GMAIL_SMTP,
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: SEND_TIMEOUT_MS,
  });
  return transporter;
}

/** Plain-text fallback so the email isn't HTML-only (helps deliverability). */
function htmlToText(html: string): string {
  return html
    .replace(/<\/(p|div|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim();
}

/** Sends one email through Gmail SMTP. Called from the auth email callbacks in email.ts. */
export const send = internalAction({
  args: { to: v.string(), subject: v.string(), html: v.string() },
  returns: v.null(),
  handler: async (_ctx, { to, subject, html }) => {
    const { user, pass } = getConfig();
    const fromName = process.env.EMAIL_FROM_NAME?.trim() || "NextPro";

    // Dev only: send every email to one inbox instead of the real recipient.
    const override = process.env.EMAIL_OVERRIDE_TO?.trim();

    try {
      // Gmail always sends from the authenticated account, so `from` must be GMAIL_USER.
      await getTransporter(user, pass).sendMail({
        from: { name: fromName, address: user },
        to: override || to,
        subject: override ? `[to: ${to}] ${subject}` : subject,
        html,
        text: htmlToText(html),
        signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      });
    } catch (error) {
      // Drop the cached connection so the next send starts fresh (e.g. after a changed password).
      transporter?.close();
      transporter = null;
      console.error("Gmail SMTP error:", error);
      throw new Error("Failed to send email");
    }

    return null;
  },
});
