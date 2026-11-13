"use client";
import { signUpSchema } from "@/app/schemas/auth";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import zod from "zod";

const SignupPage = () => {
  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const formSubmitHandler = (data: zod.infer<typeof signUpSchema>) => {
    console.log(data);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create an account to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(formSubmitHandler)}
          className="space-y-4"
        >
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <Field>
                    <FieldLabel>Full Name</FieldLabel>
                    <Input aria-invalid={fieldState.invalid} placeholder="John Doe" {...form.register("name")} />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <Field>
                    <FieldLabel>Email</FieldLabel>
                    <Input
                      placeholder="john@example.com"
                      aria-invalid={fieldState.invalid} 
                      {...form.register("email")}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>
          <FieldGroup>
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <Field>
                    <FieldLabel>Password</FieldLabel>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      aria-invalid={fieldState.invalid}
                      {...form.register("password")}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                );
              }}
            />
            <Button type="submit" className="w-full hover:cursor-pointer">
              Sign Up
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignupPage;
