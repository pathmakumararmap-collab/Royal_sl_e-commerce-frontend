"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Trash2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ImageLightbox } from "@/components/shared/image-lightbox";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { PageHeader } from "@/components/shared/page-header";
import { StarRating } from "@/components/shared/star-rating";
import {
  useAdminReviews,
  useApproveReview,
  useDeleteReview,
  useRejectReview,
} from "@/hooks/use-admin-reviews";
import { formatDateTime } from "@/lib/format";

type StatusFilter = "pending" | "approved" | "rejected";

const STATUS_BADGE: Record<StatusFilter, "warning" | "success" | "destructive"> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
};

export function AdminReviewsContent() {
  const [status, setStatus] = React.useState<StatusFilter>("pending");
  const [page, setPage] = React.useState(1);
  const [deleteTargetId, setDeleteTargetId] = React.useState<number | null>(null);
  const [lightbox, setLightbox] = React.useState<{
    images: { id: number; url: string }[];
    index: number;
  } | null>(null);

  const { data: reviews, isLoading, isError, refetch } = useAdminReviews({ status, page });
  const approveReview = useApproveReview();
  const rejectReview = useRejectReview();
  const deleteReview = useDeleteReview();

  return (
    <div className="space-y-6">
      <PageHeader title="Reviews" description="Approve or reject customer product reviews before they go live." />

      <Tabs
        value={status}
        onValueChange={(value) => {
          setStatus(value as StatusFilter);
          setPage(1);
        }}
      >
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <LoadingSpinner className="py-16" />
      ) : !reviews?.data.length ? (
        <EmptyState title={`No ${status} reviews`} />
      ) : (
        <div className="space-y-3">
          {reviews.data.map((review) => (
            <div key={review.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {review.product ? (
                      <Link
                        href={`/admin/products/${review.product.id}/edit`}
                        className="text-sm font-medium hover:underline"
                      >
                        {review.product.name}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium">Product</span>
                    )}
                    <Badge variant={STATUS_BADGE[review.status as StatusFilter]}>{review.status}</Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {review.reviewer_name ?? "Customer"} · {formatDateTime(review.created_at)}
                  </p>
                  <StarRating value={review.rating} size="sm" />
                  {review.title && <p className="text-sm font-medium">{review.title}</p>}
                  {review.comment && <p className="text-muted-foreground text-sm">{review.comment}</p>}
                  {!!review.images?.length && (
                    <div className="flex gap-2 pt-1">
                      {review.images.map((image, imageIndex) => (
                        <button
                          key={image.id}
                          type="button"
                          onClick={() => setLightbox({ images: review.images!, index: imageIndex })}
                          className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-lg border"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- small thumbnail in a scrollable moderation list, not worth next/image overhead */}
                          <img src={image.url} alt="Customer photo" className="size-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 gap-2">
                  {status !== "approved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={approveReview.isPending}
                      onClick={() => approveReview.mutate(review.id)}
                    >
                      <Check className="size-4" />
                      Approve
                    </Button>
                  )}
                  {status !== "rejected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={rejectReview.isPending}
                      onClick={() => rejectReview.mutate(review.id)}
                    >
                      <X className="size-4" />
                      Reject
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTargetId(review.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {reviews.meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-muted-foreground text-xs">
                Page {reviews.meta.current_page} of {reviews.meta.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= reviews.meta.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        title="Delete this review?"
        description="This will permanently remove the review. This action cannot be undone."
        confirmLabel="Delete"
        loading={deleteReview.isPending}
        onConfirm={() => {
          if (deleteTargetId) {
            deleteReview.mutate(deleteTargetId, { onSuccess: () => setDeleteTargetId(null) });
          }
        }}
      />

      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          index={lightbox.index}
          onIndexChange={(index) => setLightbox({ ...lightbox, index })}
          open
          onOpenChange={(open) => !open && setLightbox(null)}
        />
      )}
    </div>
  );
}
