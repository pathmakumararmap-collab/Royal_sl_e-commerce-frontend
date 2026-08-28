"use client";

import { Bell, BellRing, CheckCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/use-notifications";
import { formatRelativeTime } from "@/lib/format";
import type { AppNotification } from "@/types/notification";

function describeNotification(notification: AppNotification): string {
  const type = notification.data.type ?? notification.type;

  switch (type) {
    case "order.status_updated":
      return `Your order status was updated to ${String(notification.data.status ?? "")}.`;
    case "order.placed":
      return "Your order has been placed successfully.";
    case "low_stock_alert":
      return "A product is running low on stock.";
    default:
      return (notification.data.message as string) ?? "You have a new notification.";
  }
}

export function NotificationsContent() {
  const { data, isLoading, isError, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const items = Array.isArray(data?.data) ? data.data : (data?.data.data ?? []);
  const unreadCount = data?.unread_count ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Updates about your orders and account."
        actions={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
              <CheckCheck className="size-3.5" />
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
      ) : (
        <div className="stagger-children space-y-2.5">
          {items.map((notification) => {
            const isUnread = !notification.read_at;
            return (
              <Card
                key={notification.id}
                className={cn(
                  "hover-lift-sm relative overflow-hidden",
                  isUnread && "border-primary/30 bg-primary/[0.04] shadow-luxury-sm"
                )}
              >
                {isUnread && (
                  <span className="bg-primary absolute inset-y-0 left-0 w-1" aria-hidden />
                )}
                <CardContent className="flex items-start justify-between gap-4 py-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={cn(
                        "ring-1 flex size-9 shrink-0 items-center justify-center rounded-full",
                        isUnread
                          ? "bg-primary/10 text-primary ring-primary/10"
                          : "bg-muted text-muted-foreground ring-transparent"
                      )}
                    >
                      {isUnread ? <BellRing className="size-4" /> : <Bell className="size-4" />}
                    </div>
                    <div className="space-y-0.5">
                      <p className={cn("text-sm", isUnread && "font-medium")}>
                        {describeNotification(notification)}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatRelativeTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                  {isUnread && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markRead.mutate(notification.id)}
                      disabled={markRead.isPending}
                    >
                      Mark read
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
