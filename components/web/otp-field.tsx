"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface OtpFieldProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
}

export const OtpField = ({ value, onChange, onComplete, disabled, invalid }: OtpFieldProps) => (
  <InputOTP
    maxLength={6}
    pattern={REGEXP_ONLY_DIGITS}
    inputMode="numeric"
    autoComplete="one-time-code"
    autoFocus
    value={value}
    onChange={onChange}
    onComplete={onComplete}
    disabled={disabled}
    aria-label="Verification code"
    aria-invalid={invalid}
  >
    <InputOTPGroup>
      <InputOTPSlot index={0} />
      <InputOTPSlot index={1} />
      <InputOTPSlot index={2} />
    </InputOTPGroup>
    <InputOTPSeparator />
    <InputOTPGroup>
      <InputOTPSlot index={3} />
      <InputOTPSlot index={4} />
      <InputOTPSlot index={5} />
    </InputOTPGroup>
  </InputOTP>
);
