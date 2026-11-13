"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";

interface EmailOTPVerificationProps {
  email: string;
  onSuccess?: () => void;
}

export const EmailOTPVerification = ({
  email,
  onSuccess,
}: EmailOTPVerificationProps) => {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Verify OTP using better-auth emailOtp plugin
      const response = await authClient.emailOtp.verifyEmail({
        email,
        otp,
      });

      if (response.error) {
        const errorMsg =
          response.error?.message || "Invalid verification code";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      toast.success("Email verified successfully!");
      onSuccess?.();
      router.push("/");
    } catch (error: any) {
      const errorMsg =
        error?.message || "An error occurred. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Resend OTP code
      const response = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });

      if (response.error) {
        const errorMsg =
          response.error?.message || "Failed to resend code";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      toast.success("Verification code sent to your email");
      setOtp("");
    } catch (error: any) {
      const errorMsg = error?.message || "Failed to resend code";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a 6-digit code to {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Enter the 6-digit code from your email
              </p>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                disabled={isLoading}
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
            </div>

            <Button
              onClick={handleVerify}
              disabled={isLoading || otp.length !== 6}
              className="w-full"
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">Didn't receive a code?</p>
              <Button
                variant="link"
                onClick={handleResendCode}
                disabled={isLoading}
                className="text-sm p-0 h-auto mt-1"
              >
                Resend code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
