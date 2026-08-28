"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ImageLightboxProps {
  images: { id: number; url: string }[];
  index: number;
  onIndexChange: (index: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageLightbox({
  images,
  index,
  onIndexChange,
  open,
  onOpenChange,
}: ImageLightboxProps) {
  const goPrev = React.useCallback(
    () => onIndexChange((index - 1 + images.length) % images.length),
    [index, images.length, onIndexChange]
  );
  const goNext = React.useCallback(
    () => onIndexChange((index + 1) % images.length),
    [index, images.length, onIndexChange]
  );

  React.useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, goPrev, goNext]);

  const current = images[index];
  if (!current) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-3xl overflow-visible border-none bg-transparent p-0 shadow-none sm:max-w-3xl"
      >
        <DialogTitle className="sr-only">Photo {index + 1} of {images.length}</DialogTitle>

        <div className="relative">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="absolute top-2 right-2 z-20 flex size-9 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform hover:scale-105"
          >
            <X className="size-5" />
          </button>

          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black">
            <Image
              src={current.url}
              alt={`Photo ${index + 1} of ${images.length}`}
              fill
              className="object-contain"
              sizes="(min-width: 768px) 640px, 100vw"
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous photo"
                className="absolute top-1/2 left-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow-lg transition-transform hover:scale-105"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next photo"
                className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow-lg transition-transform hover:scale-105"
              >
                <ChevronRight className="size-5" />
              </button>
              <div className="mt-3 flex justify-center gap-1.5">
                {images.map((image, i) => (
                  <button
                    key={image.id}
                    type="button"
                    aria-label={`Go to photo ${i + 1}`}
                    onClick={() => onIndexChange(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
