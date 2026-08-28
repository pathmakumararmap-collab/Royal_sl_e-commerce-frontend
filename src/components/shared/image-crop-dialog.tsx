"use client";

import * as React from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ImageCropDialogProps {
  file: File | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (blob: Blob) => void;
  loading?: boolean;
}

function defaultCrop(width: number, height: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, width / height, width, height),
    width,
    height
  );
}

export function ImageCropDialog({ file, onOpenChange, onConfirm, loading }: ImageCropDialogProps) {
  const imageRef = React.useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = React.useState<Crop>();
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!file) {
      setImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleImageLoad(event: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = event.currentTarget;
    setCrop(defaultCrop(width, height));
  }

  async function handleConfirm() {
    const image = imageRef.current;
    if (!image || !crop || !crop.width || !crop.height) return;

    // `crop` holds percentage values (0-100), relative to the image's own
    // dimensions — convert straight to natural pixel coordinates. (The
    // previous version multiplied these percentages by a displayed-vs-
    // natural pixel scale factor, which is only correct for pixel-unit
    // crops, producing a garbage-sized/near-empty canvas.)
    const sourceX = (crop.x / 100) * image.naturalWidth;
    const sourceY = (crop.y / 100) * image.naturalHeight;
    const sourceWidth = (crop.width / 100) * image.naturalWidth;
    const sourceHeight = (crop.height / 100) * image.naturalHeight;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(sourceWidth);
    canvas.height = Math.round(sourceHeight);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob((blob) => {
      if (blob) onConfirm(blob);
    }, "image/png");
  }

  return (
    <Dialog open={!!file} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Crop image</DialogTitle>
        </DialogHeader>

        {imageUrl && (
          <div className="flex max-h-[60vh] justify-center overflow-auto">
            <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)}>
              {/* eslint-disable-next-line @next/next/no-img-element -- react-image-crop needs a plain <img> ref for canvas cropping */}
              <img ref={imageRef} src={imageUrl} alt="To crop" onLoad={handleImageLoad} />
            </ReactCrop>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? "Inserting…" : "Insert image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}