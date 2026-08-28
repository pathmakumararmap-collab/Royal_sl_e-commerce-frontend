"use client";

import * as React from "react";
import { CalendarRange, HardDrive, Megaphone, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge, type badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CampaignFormDialog } from "@/components/admin/campaign-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { useCampaignStore, type Campaign, type CampaignStatus } from "@/store/campaign-store";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const STATUS_ORDER: CampaignStatus[] = ["planned", "active", "completed"];

const STATUS_META: Record<
  CampaignStatus,
  { label: string; badge: BadgeVariant; dot: string }
> = {
  planned: { label: "Planned", badge: "outline", dot: "bg-muted-foreground" },
  active: { label: "Active", badge: "success", dot: "bg-success" },
  completed: { label: "Completed", badge: "secondary", dot: "bg-muted-foreground" },
};

const CHANNEL_LABELS: Record<Campaign["channel"], string> = {
  email: "Email",
  sms: "SMS",
  social: "Social",
  push: "Push",
  other: "Other",
};

function CampaignCard({
  campaign,
  onEdit,
  onDelete,
}: {
  campaign: Campaign;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="hover-lift-sm group gap-3 py-4">
      <CardContent className="space-y-3 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1.5">
            <p className="truncate font-medium leading-snug">{campaign.name}</p>
            <Badge variant="outline" className="text-xs">
              {CHANNEL_LABELS[campaign.channel]}
            </Badge>
          </div>
          <div className="flex shrink-0 gap-1 opacity-0 transition-luxury group-hover:opacity-100 group-focus-within:opacity-100">
            <Button
              variant="ghost"
              size="icon-sm"
              className="hover:bg-primary/10 hover:text-primary"
              onClick={onEdit}
              aria-label="Edit campaign"
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="hover:bg-destructive/10 hover:text-destructive"
              onClick={onDelete}
              aria-label="Delete campaign"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>

        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <CalendarRange className="size-3.5 shrink-0" />
          <span className="tabular-nums">
            {formatDate(campaign.start_date)} – {formatDate(campaign.end_date)}
          </span>
        </div>

        {campaign.notes && (
          <p className="text-muted-foreground line-clamp-2 text-sm">{campaign.notes}</p>
        )}
      </CardContent>
    </Card>
  );
}

function ColumnSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 2 }).map((_, index) => (
        <Skeleton key={index} className="h-28 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function CampaignsContent() {
  const items = useCampaignStore((state) => state.items);
  const removeCampaign = useCampaignStore((state) => state.remove);

  const [hydrated, setHydrated] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Campaign | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = React.useState<Campaign | undefined>(undefined);

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(campaign: Campaign) {
    setEditing(campaign);
    setFormOpen(true);
  }

  const grouped = React.useMemo(() => {
    const map: Record<CampaignStatus, Campaign[]> = { planned: [], active: [], completed: [] };
    for (const campaign of items) {
      map[campaign.status].push(campaign);
    }
    return map;
  }, [items]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        description="Plan marketing campaigns across channels and track them from idea to completion."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            New campaign
          </Button>
        }
      />

      <div className="bg-muted/40 flex items-center gap-2.5 rounded-xl border border-dashed px-4 py-3">
        <div className="bg-background text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-lg border">
          <HardDrive className="size-4" />
        </div>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Campaign plans are saved locally on this device — they are not synced to the backend or
          shared with other admins.
        </p>
      </div>

      {!hydrated ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {STATUS_ORDER.map((status) => (
            <div key={status} className="space-y-3">
              <Skeleton className="h-6 w-24" />
              <ColumnSkeleton />
            </div>
          ))}
        </div>
      ) : !items.length ? (
        <EmptyState
          icon={Megaphone}
          title="No campaigns planned yet"
          description="Create a campaign plan to track upcoming marketing pushes."
        />
      ) : (
        <div className="stagger-children grid gap-4 lg:grid-cols-3">
          {STATUS_ORDER.map((status) => {
            const meta = STATUS_META[status];
            const campaigns = grouped[status];
            return (
              <div key={status} className="space-y-3">
                <div className="flex items-center justify-between px-0.5">
                  <span className="inline-flex items-center gap-2">
                    <span className={cn("size-1.5 rounded-full", meta.dot)} aria-hidden />
                    <span className="text-sm font-semibold">{meta.label}</span>
                  </span>
                  <Badge variant={meta.badge}>{campaigns.length}</Badge>
                </div>
                <div className="min-h-24 space-y-3 rounded-xl">
                  {campaigns.length ? (
                    campaigns.map((campaign) => (
                      <CampaignCard
                        key={campaign.id}
                        campaign={campaign}
                        onEdit={() => openEdit(campaign)}
                        onDelete={() => setDeleteTarget(campaign)}
                      />
                    ))
                  ) : (
                    <div className="text-muted-foreground rounded-xl border border-dashed p-6 text-center text-xs">
                      No campaigns here yet.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CampaignFormDialog open={formOpen} onOpenChange={setFormOpen} campaign={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        title="Delete campaign?"
        description={`This will remove the campaign "${deleteTarget?.name}" from this device.`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (!deleteTarget) return;
          removeCampaign(deleteTarget.id);
          setDeleteTarget(undefined);
        }}
      />
    </div>
  );
}
