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
import { clearPendingEmail, getPendingEmail } from "@/lib/pending-email";
import { useCooldown } from "@/hooks/use-cooldown";

const RESEND_COOLDOWN_SECONDS = 60;
const noopSubscribe = () => () => {};

export const EmailOTPVerification = () => {
  const router = useRouter();
  const email = useSyncExternalStore<string | null | undefined>(
    noopSubscribe,
    getPendingEmail,
    () => undefined
  );
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const cooldown = useCooldown(RESEND_COOLDOWN_SECONDS, true);

  const verify = async (code: string) => {
    if (!email || isVerifying) return;
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your email");
      return;
    }

    setIsVerifying(true);
    setError("");
    const { error } = await authClient.emailOtp.verifyEmail({ email, otp: code });
    setIsVerifying(false);

    if (error) {
      const message = getAuthErrorMessage(error, "Invalid verification code");
      setError(message);
      toast.error(message);
      setOtp("");
      return;
    }

    setOtp("");
    clearPendingEmail();
    toast.success("Email verified! Welcome to NextPro.");
    router.replace("/");
    router.refresh();
  };

  const resend = async () => {
    if (!email || cooldown.isActive) return;
    setIsResending(true);
    setError("");
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });
    setIsResending(false);

    if (error) {
      const message = getAuthErrorMessage(error, "Failed to resend code");
      setError(message);
      toast.error(message);
      return;
    }

    setOtp("");
    cooldown.start();
    toast.success("A new code has been sent to your email");
  };

  if (email === undefined) return null;

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Verify your email</CardTitle>
            <CardDescription>
              Sign in with your email and password and we&apos;ll send you a new
              verification code.
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
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            We&apos;ve sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>.
            You need to confirm your email before you can use your account.
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

          <Button
            onClick={() => verify(otp)}
            disabled={isVerifying || otp.length !== 6}
            className="w-full"
          >
            {isVerifying ? "Verifying..." : "Verify Email"}
          </Button>

          <div className="text-center text-sm">
            <p className="text-muted-foreground">Didn&apos;t receive a code? Check your spam folder.</p>
            <Button
              variant="link"
              onClick={resend}
              disabled={isResending || cooldown.isActive}
              className="text-sm p-0 h-auto mt-1"
            >
              {cooldown.isActive ? `Resend code in ${cooldown.remaining}s` : "Resend code"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
