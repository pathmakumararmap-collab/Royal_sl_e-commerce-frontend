"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MailCheck } from "lucide-react";

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
import { useForgotPassword } from "@/hooks/use-auth";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/validators/auth";

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();
  const [sent, setSent] = React.useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: ForgotPasswordFormValues) => {
    forgotPassword.mutate(values.email, { onSuccess: () => setSent(true) });
  };

  if (sent) {
    return (
      <Card className="glass-panel shadow-luxury-lg">
        <CardHeader>
          <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
            <MailCheck className="size-5" />
          </div>
          <CardTitle className="text-display mt-3 text-xl">Check your email</CardTitle>
          <CardDescription>
            If an account exists for that email, we&apos;ve sent a link to reset your password.
            The link expires shortly, so use it soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center text-sm">
            <Link href="/login" className="text-primary font-medium hover:underline">
              Back to log in
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel shadow-luxury-lg">
      <CardHeader>
        <CardTitle className="text-display text-xl">Forgot your password?</CardTitle>
        <CardDescription>
          Enter the email on your account and we&apos;ll send you a link to reset it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              disabled={forgotPassword.isPending}
            >
              {forgotPassword.isPending ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        </Form>
        <p className="text-muted-foreground mt-6 text-center text-sm">
          Remembered your password?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
