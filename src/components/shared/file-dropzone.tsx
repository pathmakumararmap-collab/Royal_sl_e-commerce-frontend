"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileDropzoneProps {
  value: File[];
  onChange: (files: File[]) => void;
  multiple?: boolean;
  className?: string;
  label?: string;
  hint?: string;
}

export function FileDropzone({
  value,
  onChange,
  multiple = false,
  className,
  label = "Upload images",
  hint = "PNG, JPG up to 4MB",
}: FileDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const previews = React.useMemo(
    () => value.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [value]
  );

  React.useEffect(() => {
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [previews]);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const files = Array.from(fileList);
    onChange(multiple ? [...value, ...files] : [files[0]]);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "hover:bg-muted/50"
        )}
      >
        <ImagePlus className="text-muted-foreground size-6" />
        <p className="text-sm font-medium">{label}</p>
        <p className="text-muted-foreground text-xs">{hint}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {previews.map((preview, index) => (
            <div
              key={`${preview.file.name}-${index}`}
              className="group bg-muted relative aspect-square overflow-hidden rounded-lg border"
            >
              <Image
                src={preview.url}
                alt={preview.file.name}
                fill
                className="object-cover"
                unoptimized
              />
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                className="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(event) => {
                  event.stopPropagation();
                  onChange(value.filter((_, i) => i !== index));
                }}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
