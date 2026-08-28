"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Camera } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PageHeader } from "@/components/shared/page-header";
import { useCurrentUser } from "@/hooks/use-auth";
import { useUpdateProfile } from "@/hooks/use-addresses";
import { profileSchema, type ProfileFormValues } from "@/lib/validators/address";
import { getInitials } from "@/lib/format";
import { useAuthStore } from "@/store/auth-store";

export function ProfileContent() {
  useCurrentUser();
  const user = useAuthStore((state) => state.user);
  const updateProfile = useUpdateProfile();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    },
  });

  React.useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile.mutate({
      ...values,
      avatar: avatarFile ?? undefined,
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My profile" description="Update your personal information." />

      <Card>
        <CardHeader>
          <CardTitle className="text-display text-lg">Personal details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
              <div className="border-border/60 bg-muted/20 flex items-center gap-5 rounded-xl border p-4">
                <div className="group relative">
                  <Avatar className="ring-background size-20 shadow-luxury-md ring-4">
                    <AvatarImage src={avatarPreview ?? user.avatar ?? undefined} alt={user.name} />
                    <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    className="bg-background hover-lift-sm absolute -right-1 -bottom-1 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Change photo"
                  >
                    <Camera className="size-3.5" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)}
                  />
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Click the camera icon to update your photo.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Saving…" : "Save changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
