"use client";

import { useSearchParams } from "next/navigation";
import { LoginOTPVerification } from "@/components/web/login-otp-verification";

export default function Login2FAPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Email not provided</h1>
          <p className="text-gray-600">
            Please sign in to complete two-factor authentication.
          </p>
        </div>
      </div>
    );
  }

  return <LoginOTPVerification email={email} />;
}
