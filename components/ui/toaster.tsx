"use client";

import { Toaster as Sonner } from "sonner";
import { useTheme } from "next-themes";

export function Toaster() {
  const { theme } = useTheme();
  return (
    <Sonner
      theme={theme === "dark" ? "dark" : "light"}
      position="top-center"
      expand={false}
      closeButton
    />
  );
}
