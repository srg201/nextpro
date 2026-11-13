"use client";

import { useSearchParams } from "next/navigation";
import { EmailOTPVerification } from "@/components/web/email-otp-verification";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Email not provided</h1>
          <p className="text-gray-600">
            Please sign up to verify your email address.
          </p>
        </div>
      </div>
    );
  }

  return <EmailOTPVerification email={email} />;
}
