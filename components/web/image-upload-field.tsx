"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageUpIcon, UploadCloudIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useMemo } from "react";

type ImageUploadFieldProps = {
  id?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  onBlur?: () => void;
  disabled?: boolean;
  invalid?: boolean;
};

export function ImageUploadField({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  invalid,
}: ImageUploadFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const previewUrl = useMemo(
    () => (value ? URL.createObjectURL(value) : null),
    [value],
  );

  // Free the blob memory when the file changes or the component unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    // Reset so picking the same file again after removing it still fires onChange.
    e.target.value = "";
    if (file) onChange(file);
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div>
      {previewUrl ? (
        <div className="relative w-full aspect-video overflow-hidden rounded-xl border bg-muted group">
          <Image
            src={previewUrl}
            alt={value?.name ?? "Selected image"}
            fill
            unoptimized
            className="object-cover"
          />
          <Button
            type="button"
            size="icon"
            variant="secondary"
            onClick={handleRemove}
            disabled={disabled}
            aria-label="Remove image"
            className="absolute top-2 right-2 size-8 rounded-full shadow-md hover:cursor-pointer"
          >
            <XIcon className="size-4" />
          </Button>
          {/* A native <label> opens the picker on touch devices too; JS input.click() is unreliable there. */}
          <Button
            asChild
            size="sm"
            variant="secondary"
            className={cn(
              "absolute bottom-2 right-2 shadow-md hover:cursor-pointer",
              disabled && "pointer-events-none opacity-50",
            )}
          >
            <label htmlFor={inputId} aria-disabled={disabled}>
              <ImageUpIcon className="size-4" />
              Change
            </label>
          </Button>
          <p className="absolute bottom-2 left-2 max-w-[55%] truncate rounded-md bg-background/80 px-2 py-1 text-xs">
            {value?.name}
          </p>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          aria-disabled={disabled}
          className={cn(
            "aspect-video flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-accent text-accent-foreground transition-colors hover:cursor-pointer hover:bg-accent/70 select-none",
            disabled && "pointer-events-none opacity-50",
            invalid && "border-destructive",
          )}
        >
          <UploadCloudIcon className="size-14" />
          <span className="text-sm text-muted-foreground">
            Tap to upload an image
          </span>
        </label>
      )}
      <input
        id={inputId}
        type="file"
        accept="image/*"
        // sr-only instead of display:none: some mobile browsers ignore hidden file inputs.
        className="sr-only"
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
      />
    </div>
  );
}
