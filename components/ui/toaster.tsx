"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="light"
      richColors
      position="top-center"
      expand={false}
      closeButton
    />
  );
}
