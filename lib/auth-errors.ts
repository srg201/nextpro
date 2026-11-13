type AuthError = {
  status?: number;
  code?: string;
  message?: string;
} | null | undefined;

const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Invalid email or password",
  EMAIL_NOT_VERIFIED: "Please verify your email. We've sent you a new code.",
  INVALID_OTP: "Invalid or expired code. Please check the code or request a new one.",
  OTP_EXPIRED: "This code has expired. Please request a new one.",
  TOO_MANY_ATTEMPTS: "Too many incorrect attempts. Please request a new code.",
  USER_ALREADY_EXISTS: "An account with this email already exists",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "An account with this email already exists",
  PASSWORD_TOO_SHORT: "Password is too short",
  PASSWORD_TOO_LONG: "Password is too long",
  INVALID_EMAIL: "Invalid email address",
  INVALID_CODE: "Invalid code. Please check the code and try again.",
  OTP_HAS_EXPIRED: "This code has expired. Please request a new one.",
  TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE: "Too many incorrect attempts. Please request a new code.",
  INVALID_TWO_FACTOR_COOKIE: "Your sign-in session expired. Please sign in again.",
  ACCOUNT_TEMPORARILY_LOCKED: "Too many failed attempts. Please try again later.",
};

export const getAuthErrorMessage = (
  error: AuthError,
  fallback = "Something went wrong. Please try again."
) => {
  if (!error) return fallback;
  if (error.status === 429) {
    return "Too many requests. Please wait a minute and try again.";
  }
  if (error.code && MESSAGES[error.code]) return MESSAGES[error.code];
  return error.message || fallback;
};
