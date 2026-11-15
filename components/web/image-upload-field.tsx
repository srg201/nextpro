"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageUpIcon, UploadCloudIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";

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
  const inputRef = useRef<HTMLInputElement>(null);

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

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

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
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={openPicker}
            disabled={disabled}
            className="absolute bottom-2 right-2 shadow-md hover:cursor-pointer"
          >
            <ImageUpIcon className="size-4" />
            Change
          </Button>
          <p className="absolute bottom-2 left-2 max-w-[55%] truncate rounded-md bg-background/80 px-2 py-1 text-xs">
            {value?.name}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled}
          className={cn(
            "aspect-video flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-accent text-accent-foreground transition-colors hover:cursor-pointer hover:bg-accent/70 disabled:cursor-not-allowed disabled:opacity-50",
            invalid && "border-destructive",
          )}
        >
          <UploadCloudIcon className="size-14" />
          <span className="text-sm text-muted-foreground">
            Click to upload an image
          </span>
        </button>
      )}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
      />
    </div>
  );
}
