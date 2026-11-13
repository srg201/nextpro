import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth/minimal";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { emailOTP, twoFactor } from "better-auth/plugins";
import authConfig from "./auth.config";
import { nameSchema, passwordSchema } from "../app/schemas/auth";
import {
  sendExistingAccountEmail,
  sendOtpEmail,
  sendPasswordChangedEmail,
} from "./email";

const siteUrl = process.env.SITE_URL!;

const OTP_EXPIRES_IN_SECONDS = 10 * 60;
const TWO_FACTOR_OTP_MINUTES = 5;

const PASSWORD_FIELDS: Record<string, string> = {
  "/sign-up/email": "password",
  "/email-otp/reset-password": "password",
  "/reset-password": "newPassword",
  "/change-password": "newPassword",
};

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    // 2FA is mandatory: passwordless email sign-in and turning 2FA off would bypass it.
    disabledPaths: ["/sign-in/email-otp", "/two-factor/enable", "/two-factor/disable"],
    databaseHooks: {
      user: {
        create: {
          before: async (user) => ({ data: { ...user, twoFactorEnabled: true } }),
        },
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true,
      onPasswordReset: async ({ user }) => {
        await sendPasswordChangedEmail(user.email);
      },
      onExistingUserSignUp: async ({ user }) => {
        await sendExistingAccountEmail(user.email);
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 60,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/sign-up/email": { window: 60, max: 3 },
        "/email-otp/verify-email": { window: 60, max: 5 },
        "/email-otp/reset-password": { window: 60, max: 5 },
        "/email-otp/send-verification-otp": { window: 60, max: 3 },
        "/email-otp/request-password-reset": { window: 60, max: 3 },
        "/two-factor/verify-otp": { window: 60, max: 5 },
        "/two-factor/send-otp": { window: 60, max: 3 },
      },
    },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        const passwordField = PASSWORD_FIELDS[ctx.path];
        if (passwordField) {
          const result = passwordSchema.safeParse(ctx.body?.[passwordField]);
          if (!result.success) {
            throw new APIError("BAD_REQUEST", {
              message: result.error.issues[0].message,
              code: "WEAK_PASSWORD",
            });
          }
        }
        // Without this, an email-verification code would sign in an already
        // verified account with no password and no second factor.
        if (ctx.path === "/email-otp/verify-email") {
          const email = String(ctx.body?.email ?? "").toLowerCase();
          const existing = await ctx.context.internalAdapter.findUserByEmail(email);
          if (existing?.user.emailVerified) {
            throw new APIError("BAD_REQUEST", {
              message: "Invalid OTP",
              code: "INVALID_OTP",
            });
          }
        }
        if (ctx.path === "/sign-up/email") {
          const result = nameSchema.safeParse(ctx.body?.name);
          if (!result.success) {
            throw new APIError("BAD_REQUEST", {
              message: result.error.issues[0].message,
              code: "INVALID_NAME",
            });
          }
        }
      }),
    },
    plugins: [
      convex({ authConfig }),
      emailOTP({
        overrideDefaultEmailVerification: true,
        disableSignUp: true,
        otpLength: 6,
        expiresIn: OTP_EXPIRES_IN_SECONDS,
        allowedAttempts: 5,
        storeOTP: "hashed",
        rateLimit: { window: 60, max: 5 },
        async sendVerificationOTP({ email, otp, type }) {
          await sendOtpEmail(email, otp, type, OTP_EXPIRES_IN_SECONDS / 60);
        },
      }),
      twoFactor({
        issuer: "NextPro",
        totpOptions: { disable: true },
        twoFactorCookieMaxAge: 10 * 60,
        trustDeviceMaxAge: 30 * 24 * 60 * 60,
        otpOptions: {
          period: TWO_FACTOR_OTP_MINUTES,
          storeOTP: "hashed",
          allowedAttempts: 5,
          async sendOTP({ user, otp }) {
            await sendOtpEmail(user.email, otp, "sign-in", TWO_FACTOR_OTP_MINUTES);
          },
        },
      }),
    ],
  });
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});
