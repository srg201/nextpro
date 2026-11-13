import { Suspense } from "react";
import { EmailOTPVerification } from "@/components/web/email-otp-verification";

interface VerifyEmailPageProps {
  searchParams: Promise<{
    email?: string;
  }>;
}

async function VerifyEmailContent({ email }: { email: string }) {
  return <EmailOTPVerification email={email} />;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams;
  const email = params.email || "";

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

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent email={email} />
    </Suspense>
  );
}
