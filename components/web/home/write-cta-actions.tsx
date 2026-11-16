"use client";

import Link from "next/link";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui/button";

// Buttons sitting on the Klein Blue band (colors come from the .home tokens).
const onAccent =
  "h-11 px-6 text-base bg-white text-home-accent hover:bg-white/90 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-home-accent";
const onAccentOutline =
  "h-11 px-6 text-base bg-transparent text-white border-white/70 hover:bg-white/10 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-home-accent";

/** Buttons for the "Write for NextPro" band. Auth is only known on the client. */
export function WriteCtaActions() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    // min-h keeps the band from jumping while auth loads
    <div className="flex min-h-11 flex-wrap items-center gap-3">
      {isLoading ? null : isAuthenticated ? (
        <Button asChild className={onAccent}>
          <Link href="/create">Create a post</Link>
        </Button>
      ) : (
        <>
          <Button asChild className={onAccent}>
            <Link href="/auth/signup">Sign up</Link>
          </Button>
          <Button asChild className={onAccentOutline}>
            <Link href="/auth/login">Log in</Link>
          </Button>
        </>
      )}
    </div>
  );
}
