import { Suspense } from "react";
import { LoginOTPVerification } from "@/components/web/login-otp-verification";

interface Login2FAPageProps {
  searchParams: Promise<{
    email?: string;
  }>;
}

async function Login2FAContent({ email }: { email: string }) {
  return <LoginOTPVerification email={email} />;
}

export default async function Login2FAPage({
  searchParams,
}: Login2FAPageProps) {
  const params = await searchParams;
  const email = params.email || "";

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

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Login2FAContent email={email} />
    </Suspense>
  );
}
