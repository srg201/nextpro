"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import Link from "next/link";
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
import { authClient } from "@/lib/auth-client";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { setPendingEmail, setTwoFactorEmail } from "@/lib/pending-email";
import { loginSchema } from "@/app/schemas/auth";

type LoginInput = z.input<typeof loginSchema>;
type LoginData = z.output<typeof loginSchema>;

export const LoginForm = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    resetField,
    formState: { isSubmitting },
  } = useForm<LoginInput, unknown, LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginData) => {
    setErrorMessage("");
    const { data: result, error } = await authClient.signIn.email(data);

    if (result && "twoFactorRedirect" in result && result.twoFactorRedirect) {
      reset();
      const { error: sendError } = await authClient.twoFactor.sendOtp();
      if (sendError) {
        const message = getAuthErrorMessage(sendError, "Failed to send verification code");
        setErrorMessage(message);
        toast.error(message);
        return;
      }
      setTwoFactorEmail(data.email);
      toast.info("We've sent a sign-in code to your email");
      router.push("/auth/two-factor");
      return;
    }

    if (error?.code === "EMAIL_NOT_VERIFIED") {
      reset();
      setPendingEmail(data.email);
      toast.info(getAuthErrorMessage(error));
      router.push("/auth/verify-email");
      return;
    }

    if (error) {
      const message = getAuthErrorMessage(error, "Sign in failed. Please try again.");
      setErrorMessage(message);
      toast.error(message);
      resetField("password");
      return;
    }

    reset();
    toast.success("Welcome back!");
    router.push("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Sign in to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FieldGroup>
              <Controller
                name="email"
                control={control}
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

            <FieldGroup>
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Link
                        href="/auth/forgot-password"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      {...field}
                      id="password"
                      type="password"
                      autoComplete="current-password"
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
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Don&apos;t have an account? </span>
            <Link href="/auth/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
