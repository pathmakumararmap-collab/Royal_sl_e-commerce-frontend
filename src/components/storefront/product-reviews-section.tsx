"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { ImageLightbox } from "@/components/shared/image-lightbox";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { StarRating } from "@/components/shared/star-rating";
import { useMyReview, useProductReviews, useSubmitReview } from "@/hooks/use-reviews";
import { useAuthStore } from "@/store/auth-store";
import { formatDate } from "@/lib/format";

const STATUS_LABEL: Record<string, { label: string; variant: "warning" | "success" | "destructive" }> = {
  pending: { label: "Pending approval", variant: "warning" },
  approved: { label: "Published", variant: "success" },
  rejected: { label: "Not approved", variant: "destructive" },
};

export function ProductReviewsSection({
  productId,
  ratingAverage,
  reviewsCount,
}: {
  productId: number;
  ratingAverage?: number;
  reviewsCount?: number;
}) {
  const user = useAuthStore((state) => state.user);
  const [page, setPage] = React.useState(1);
  const { data: reviews, isLoading } = useProductReviews(productId, page);
  const { data: myReview } = useMyReview(productId);
  const [lightbox, setLightbox] = React.useState<{
    images: { id: number; url: string }[];
    index: number;
  } | null>(null);

  return (
    <div className="max-w-2xl space-y-8 py-4">
      <div className="flex items-center gap-3">
        <StarRating value={ratingAverage ?? 0} size="lg" />
        <div>
          <p className="text-lg font-semibold">{(ratingAverage ?? 0).toFixed(1)} out of 5</p>
          <p className="text-muted-foreground text-sm">
            Based on {reviewsCount ?? 0} {reviewsCount === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>

      <Separator />

      {user ? (
        <ReviewForm productId={productId} existing={myReview} />
      ) : (
        <p className="text-muted-foreground text-sm">
          <Link href="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>{" "}
          to write a review for this product.
        </p>
      )}

      <Separator />

      <div className="space-y-6">
        {isLoading ? (
          <LoadingSpinner className="py-6" />
        ) : !reviews?.data.length ? (
          <p className="text-muted-foreground text-sm">No reviews yet — be the first to review this product.</p>
        ) : (
          reviews.data.map((review) => (
            <div key={review.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{review.reviewer_name ?? "Verified buyer"}</p>
                <span className="text-muted-foreground text-xs">{formatDate(review.created_at)}</span>
              </div>
              <StarRating value={review.rating} size="sm" />
              {review.title && <p className="text-sm font-medium">{review.title}</p>}
              {review.comment && (
                <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>
              )}
              {!!review.images?.length && (
                <div className="flex gap-2 pt-1">
                  {review.images.map((image, imageIndex) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setLightbox({ images: review.images!, index: imageIndex })}
                      className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-lg"
                    >
                      <Image src={image.url} alt="Customer photo" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        {reviews && reviews.meta.last_page > 1 && (
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

function ReviewForm({
  productId,
  existing,
}: {
  productId: number;
  existing?: {
    rating: number;
    title: string | null;
    comment: string | null;
    status: string;
    images?: { id: number; url: string }[];
  } | null;
}) {
  const submitReview = useSubmitReview(productId);
  const [editing, setEditing] = React.useState(!existing);
  const [rating, setRating] = React.useState(existing?.rating ?? 0);
  const [title, setTitle] = React.useState(existing?.title ?? "");
  const [comment, setComment] = React.useState(existing?.comment ?? "");
  const [images, setImages] = React.useState<File[]>([]);
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (existing) {
      setRating(existing.rating);
      setTitle(existing.title ?? "");
      setComment(existing.comment ?? "");
    }
  }, [existing]);

  if (existing && !editing) {
    const status = STATUS_LABEL[existing.status] ?? STATUS_LABEL.pending;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Your review</p>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <StarRating value={existing.rating} size="sm" />
        {existing.title && <p className="text-sm font-medium">{existing.title}</p>}
        {existing.comment && <p className="text-muted-foreground text-sm">{existing.comment}</p>}
        {!!existing.images?.length && (
          <div className="flex gap-2">
            {existing.images.map((image, imageIndex) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setLightboxIndex(imageIndex)}
                className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-lg"
              >
                <Image src={image.url} alt="Your photo" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          Edit review
        </Button>
        {existing.images && (
          <ImageLightbox
            images={existing.images}
            index={lightboxIndex ?? 0}
            onIndexChange={setLightboxIndex}
            open={lightboxIndex !== null}
            onOpenChange={(open) => !open && setLightboxIndex(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{existing ? "Edit your review" : "Write a review"}</p>
      <StarRating value={rating} interactive size="lg" onChange={setRating} />
      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Review title (optional)"
      />
      <Textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Share your experience with this product…"
        rows={4}
      />
      <div>
        <p className="mb-1.5 text-sm font-medium">Photo proof (optional)</p>
        <p className="text-muted-foreground mb-2 text-xs">
          Add up to 3 photos of the delivered package to help verify your review.
        </p>
        <FileDropzone
          value={images}
          onChange={(files) => setImages(files.slice(0, 3))}
          multiple
          label="Upload delivery photos"
          hint="PNG, JPG up to 4MB each — max 3 photos"
        />
      </div>
      <div className="flex gap-2">
        <Button
          disabled={rating === 0 || submitReview.isPending}
          onClick={() =>
            submitReview.mutate(
              {
                rating,
                title: title || undefined,
                comment: comment || undefined,
                images: images.length ? images : undefined,
              },
              { onSuccess: () => setEditing(false) }
            )
          }
        >
          {existing ? "Update review" : "Submit review"}
        </Button>
        {existing && (
          <Button variant="outline" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
