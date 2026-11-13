import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";
import { emailOTP } from "better-auth/plugins";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const {
  handler,
  preloadAuthQuery,
  isAuthenticated,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthNextJs({
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // Отправить OTP код на email через Resend
        try {
          await resend.emails.send({
            from: "onboarding@resend.dev", // Используй resend.dev для тестирования
            to: email,
            subject:
              type === "sign-in"
                ? "Your login verification code"
                : "Verify your email address",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
                <h2>${
                  type === "sign-in"
                    ? "Your login verification code"
                    : "Verify your email"
                }</h2>
                <p>Your verification code is:</p>
                <div style="
                  background: #f0f0f0;
                  padding: 20px;
                  text-align: center;
                  border-radius: 8px;
                  margin: 20px 0;
                ">
                  <h1 style="
                    font-size: 36px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    margin: 0;
                  ">
                    ${otp}
                  </h1>
                </div>
                <p>This code expires in 15 minutes.</p>
                <p style="color: #666; font-size: 12px;">
                  If you didn't request this, please ignore this email.
                </p>
              </div>
            `,
          });
        } catch (error) {
          console.error("Failed to send verification email:", error);
          throw error;
        }
      },
    }) as any,
  ],
} as any);