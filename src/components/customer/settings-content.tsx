"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { LogOut, Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { useLogout } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function SettingsContent() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  React.useEffect(() => setMounted(true), []);

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage how Royal SL looks and your account access." />

      <Card>
        <CardHeader>
          <CardTitle className="text-display text-lg">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map((option) => {
              const isActive = mounted && theme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    "transition-luxury press-scale relative flex flex-col items-center gap-2.5 rounded-xl border p-5 text-sm font-medium",
                    isActive
                      ? "border-primary bg-primary/[0.06] text-primary shadow-luxury-sm"
                      : "border-border/60 hover:border-primary/30 hover:bg-accent"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full",
                      isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <option.icon className="size-5" />
                  </span>
                  {option.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-display text-lg">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="border-border/60 bg-muted/20 flex items-center justify-between rounded-xl border p-4">
            <div>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <LogOut className="size-4" />
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
