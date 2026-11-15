"use client";
import Link from "next/link";
import { ModeToggle } from "../ui/theme-toggle";
import { Button } from "../ui/button";
import { useConvexAuth } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const Navbar = () => {
    const router = useRouter();
    const {isAuthenticated, isLoading} = useConvexAuth();
    return (
        <nav className="w-full py-5 flex items-center justify-between">
            <div className="flex items-center gap-8">
                <Link href="/">
                    <h1 className="text-3xl font-bold">Next<span className="text-primary">Pro</span></h1>
                </Link>
                <div className="flex items-center gap-2">
                    <Button asChild variant={'ghost'}>
                        <Link href="/">Home</Link>
                    </Button>
                    <Button asChild variant={'ghost'}>
                        <Link href="/blog">Blog</Link>
                    </Button>
                    <Button asChild variant={'ghost'}>
                        <Link href="/create">Create</Link>
                    </Button>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {isLoading ? null : isAuthenticated ? (
                    <Button onClick={() => authClient.signOut({
                        fetchOptions: {
                            onSuccess: () => {
                                toast.success("Successfully signed out");
                                router.replace("/");
                                router.refresh();
                            },
                            onError: (err) => {
                                toast.error(err.error?.message || "Sign out failed. Please try again.");
                            }
                        }
                    })}>
                        Log out
                    </Button>
            ) : (
                    <>
                    <Button asChild>
                        <Link href="/auth/login">Log in</Link>
                    </Button>
                    <Button asChild variant={'secondary'}>
                        <Link href="/auth/signup">Sign up</Link>
                    </Button>
                    </>
            )}
                    <ModeToggle />
            </div>
            
        </nav>
    )
}

export default Navbar

