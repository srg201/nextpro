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
import { signUpSchema } from "@/app/schemas/auth";

type SignUpFormData = z.infer<typeof signUpSchema>;

export const SignupForm = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setErrorMessage("");

      // Step 1: Create the account
      const signUpResponse = await authClient.signUp.email(data, {
        onRequest: () => {
          setErrorMessage("");
        },
        onSuccess: async () => {
          // Step 2: Send OTP code to email after account creation
          try {
            await authClient.emailOtp.sendVerificationOtp({
              email: data.email,
              type: "email-verification",
            });

            toast.success("Account created! Check your email for verification code.");

            // Step 3: Redirect to email verification page
            router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
          } catch (error: any) {
            const errorMsg =
              error?.message ||
              "Account created but failed to send verification code";
            setErrorMessage(errorMsg);
            toast.error(errorMsg);
          }
        },
        onError: (ctx) => {
          const errorMsg =
            ctx.error?.message || "Sign up failed. Please try again.";
          setErrorMessage(errorMsg);
          toast.error(errorMsg);
        },
      });
    } catch (error: any) {
      const errorMsg =
        error?.message || "An unexpected error occurred. Please try again.";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create an account to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FieldGroup>
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Full Name</FieldLabel>
                    <Input
                      {...field}
                      placeholder="John Doe"
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                    />
                    {fieldState.invalid && fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <FieldGroup>
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Email</FieldLabel>
                    <Input
                      {...field}
                      type="email"
                      placeholder="john@example.com"
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                    />
                    {fieldState.invalid && fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
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
                    <FieldLabel>Password</FieldLabel>
                    <Input
                      {...field}
                      type="password"
                      placeholder="••••••••"
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                    />
                    {fieldState.invalid && fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                Password must contain at least 8 characters, including uppercase, lowercase, and a number.
              </p>
            </FieldGroup>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
