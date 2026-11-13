"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
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
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { OtpField } from "@/components/web/otp-field";
import { authClient } from "@/lib/auth-client";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { useCooldown } from "@/hooks/use-cooldown";
import { forgotPasswordSchema, resetPasswordSchema } from "@/app/schemas/auth";

type EmailInput = z.input<typeof forgotPasswordSchema>;
type EmailData = z.output<typeof forgotPasswordSchema>;
type ResetData = z.infer<typeof resetPasswordSchema>;

const RESEND_COOLDOWN_SECONDS = 60;

const ErrorBox = ({ message }: { message: string }) =>
  message ? (
    <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
      {message}
    </div>
  ) : null;

export const ForgotPasswordForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const cooldown = useCooldown(RESEND_COOLDOWN_SECONDS);

  const emailForm = useForm<EmailInput, unknown, EmailData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: "", password: "", confirmPassword: "" },
  });

  const requestCode = async (address: string) => {
    const { error } = await authClient.emailOtp.requestPasswordReset({ email: address });
    if (error) {
      const message = getAuthErrorMessage(error, "Failed to send reset code");
      setErrorMessage(message);
      toast.error(message);
      return false;
    }
    cooldown.start();
    return true;
  };

  const onEmailSubmit = async ({ email }: EmailData) => {
    setErrorMessage("");
    if (await requestCode(email)) {
      setEmail(email);
      toast.success("If an account exists for this email, we've sent a reset code");
    }
  };

  const onResend = async () => {
    if (!email || cooldown.isActive) return;
    setErrorMessage("");
    setIsResending(true);
    const sent = await requestCode(email);
    setIsResending(false);
    if (sent) {
      resetForm.setValue("otp", "");
      toast.success("A new code has been sent");
    }
  };

  const onResetSubmit = async ({ otp, password }: ResetData) => {
    if (!email) return;
    setErrorMessage("");
    const { error } = await authClient.emailOtp.resetPassword({ email, otp, password });

    if (error) {
      const message = getAuthErrorMessage(error, "Failed to reset password");
      setErrorMessage(message);
      toast.error(message);
      resetForm.setValue("otp", "");
      return;
    }

    resetForm.reset();
    emailForm.reset();
    setEmail(null);
    toast.success("Password updated. Please sign in with your new password.");
    router.replace("/auth/login");
  };

  if (!email) {
    const { isSubmitting } = emailForm.formState;
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Forgot password</CardTitle>
            <CardDescription>
              Enter your email and we&apos;ll send you a code to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorBox message={errorMessage} />
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4" noValidate>
              <FieldGroup>
                <Controller
                  name="email"
                  control={emailForm.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="john@example.com"
                        aria-invalid={fieldState.invalid}
                        disabled={isSubmitting}
                      />
                      {fieldState.error && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send reset code"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { isSubmitting } = resetForm.formState;
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to <span className="font-medium text-foreground">{email}</span> and
            choose a new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorBox message={errorMessage} />
          <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4" noValidate>
            <Controller
              name="otp"
              control={resetForm.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Verification code</FieldLabel>
                  <div className="flex justify-center">
                    <OtpField
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                      invalid={fieldState.invalid}
                    />
                  </div>
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <FieldGroup>
              <Controller
                name="password"
                control={resetForm.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="password">New password</FieldLabel>
                    <Input
                      {...field}
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                    />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <p className="text-xs text-muted-foreground mt-1">
                At least 8 characters, including uppercase, lowercase and a number.
              </p>
            </FieldGroup>

            <FieldGroup>
              <Controller
                name="confirmPassword"
                control={resetForm.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
                    <Input
                      {...field}
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                    />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Resetting..." : "Reset password"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm space-y-1">
            <Button
              variant="link"
              onClick={onResend}
              disabled={isResending || cooldown.isActive}
              className="text-sm p-0 h-auto"
            >
              {cooldown.isActive ? `Resend code in ${cooldown.remaining}s` : "Resend code"}
            </Button>
            <div>
              <button
                type="button"
                onClick={() => {
                  setEmail(null);
                  setErrorMessage("");
                  resetForm.reset();
                }}
                className="text-muted-foreground hover:underline"
              >
                Use a different email
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
