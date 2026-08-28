"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useResetPassword } from "@/hooks/use-auth";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/validators/auth";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const resetPassword = useResetPassword();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", password_confirmation: "" },
  });

  const onSubmit = (values: ResetPasswordFormValues) => {
    resetPassword.mutate({ ...values, token, email });
  };

  if (!token || !email) {
    return (
      <Card className="glass-panel shadow-luxury-lg">
        <CardHeader>
          <CardTitle className="text-display text-xl">Invalid reset link</CardTitle>
          <CardDescription>
            This password reset link is missing or malformed. Request a new one below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="gradient" className="w-full" asChild>
            <Link href="/forgot-password">Request a new link</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel shadow-luxury-lg">
      <CardHeader>
        <CardTitle className="text-display text-xl">Set a new password</CardTitle>
        <CardDescription>Choose a new password for {email}.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password_confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              disabled={resetPassword.isPending}
            >
              {resetPassword.isPending ? "Resetting…" : "Reset password"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
