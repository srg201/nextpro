"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OtpField } from "@/components/web/otp-field";
import { authClient } from "@/lib/auth-client";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { clearTwoFactorEmail, getTwoFactorEmail } from "@/lib/pending-email";
import { useCooldown } from "@/hooks/use-cooldown";

const RESEND_COOLDOWN_SECONDS = 60;
const noopSubscribe = () => () => {};

const maskEmail = (email: string) => {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  return `${name.slice(0, 2)}${"•".repeat(Math.max(name.length - 2, 1))}@${domain}`;
};

export const TwoFactorVerification = () => {
  const router = useRouter();
  const email = useSyncExternalStore<string | null | undefined>(
    noopSubscribe,
    getTwoFactorEmail,
    () => undefined
  );
  const [otp, setOtp] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const cooldown = useCooldown(RESEND_COOLDOWN_SECONDS, true);

  const handleError = (err: { status?: number; code?: string; message?: string }, fallback: string) => {
    if (err.code === "INVALID_TWO_FACTOR_COOKIE") setSessionExpired(true);
    const message = getAuthErrorMessage(err, fallback);
    setError(message);
    toast.error(message);
  };

  const verify = async (code: string) => {
    if (isVerifying) return;
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your email");
      return;
    }

    setIsVerifying(true);
    setError("");
    const { error } = await authClient.twoFactor.verifyOtp({ code, trustDevice });
    setIsVerifying(false);
    setOtp("");

    if (error) {
      handleError(error, "Invalid code");
      return;
    }

    clearTwoFactorEmail();
    toast.success("Welcome back!");
    router.replace("/");
    router.refresh();
  };

  const resend = async () => {
    if (cooldown.isActive) return;
    setIsResending(true);
    setError("");
    const { error } = await authClient.twoFactor.sendOtp();
    setIsResending(false);

    if (error) {
      handleError(error, "Failed to resend code");
      return;
    }

    setOtp("");
    cooldown.start();
    toast.success("A new code has been sent to your email");
  };

  if (email === undefined) return null;

  if (sessionExpired) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign-in expired</CardTitle>
            <CardDescription>
              For your security the sign-in attempt expired. Please sign in again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/auth/login">Go to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Two-factor authentication</CardTitle>
          <CardDescription>
            Enter the 6-digit code we sent to{" "}
            <span className="font-medium text-foreground">
              {email ? maskEmail(email) : "your email"}
            </span>
            . The code expires in 5 minutes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-center">
            <OtpField
              value={otp}
              onChange={setOtp}
              onComplete={verify}
              disabled={isVerifying}
              invalid={!!error}
            />
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={trustDevice}
              onChange={(e) => setTrustDevice(e.target.checked)}
              disabled={isVerifying}
              className="size-4 accent-primary"
            />
            Trust this device for 30 days
          </label>

          <Button
            onClick={() => verify(otp)}
            disabled={isVerifying || otp.length !== 6}
            className="w-full"
          >
            {isVerifying ? "Verifying..." : "Verify"}
          </Button>

          <div className="text-center text-sm space-y-1">
            <p className="text-muted-foreground">Didn&apos;t receive a code? Check your spam folder.</p>
            <Button
              variant="link"
              onClick={resend}
              disabled={isResending || cooldown.isActive}
              className="text-sm p-0 h-auto"
            >
              {cooldown.isActive ? `Resend code in ${cooldown.remaining}s` : "Resend code"}
            </Button>
            <div>
              <Link href="/auth/login" className="text-muted-foreground hover:underline">
                Back to sign in
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
