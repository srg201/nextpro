const VERIFY_KEY = "nextpro:pending-email";
const TWO_FACTOR_KEY = "nextpro:two-factor-email";

const read = (key: string) => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string | null) => {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {}
};

export const setPendingEmail = (email: string) => write(VERIFY_KEY, email);
export const getPendingEmail = () => read(VERIFY_KEY);
export const clearPendingEmail = () => write(VERIFY_KEY, null);

export const setTwoFactorEmail = (email: string) => write(TWO_FACTOR_KEY, email);
export const getTwoFactorEmail = () => read(TWO_FACTOR_KEY);
export const clearTwoFactorEmail = () => write(TWO_FACTOR_KEY, null);
