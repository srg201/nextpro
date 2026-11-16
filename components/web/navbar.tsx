"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { Menu, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { authClient } from "@/lib/auth-client";
import { ModeToggle } from "../ui/theme-toggle";
import { Button } from "../ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "../ui/drawer";
import SearchInput from "./search-input";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Blog" },
    { href: "/create", label: "Create" },
];

type NavVariant = "desktop" | "mobile";

const isLinkActive = (pathname: string | null, href: string) =>
    !!pathname && (href === "/" ? pathname === "/" : pathname.startsWith(href));

const NavLinkList = ({ variant, pathname }: { variant: NavVariant; pathname: string | null }) =>
    variant === "desktop" ? (
        <>
            {NAV_LINKS.map((link) => (
                <Button
                    key={link.href}
                    asChild
                    variant="ghost"
                    className={cn(isLinkActive(pathname, link.href) && "bg-accent text-accent-foreground")}
                >
                    <Link href={link.href}>{link.label}</Link>
                </Button>
            ))}
        </>
    ) : (
        <>
            {NAV_LINKS.map((link) => (
                <DrawerClose asChild key={link.href}>
                    <Link
                        href={link.href}
                        className={cn(
                            "rounded-md px-3 py-2.5 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                            isLinkActive(pathname, link.href)
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground",
                        )}
                    >
                        {link.label}
                    </Link>
                </DrawerClose>
            ))}
        </>
    );

// usePathname() is URL data: with cacheComponents it suspends on routes with unknown
// dynamic params (e.g. /blog/[id]). Isolating it here keeps the rest of the navbar
// in the prerendered shell; the fallback shows the same links without highlighting.
const ActiveNavLinks = ({ variant }: { variant: NavVariant }) => {
    const pathname = usePathname();
    return <NavLinkList variant={variant} pathname={pathname} />;
};

const NavLinks = ({ variant }: { variant: NavVariant }) => (
    <Suspense fallback={<NavLinkList variant={variant} pathname={null} />}>
        <ActiveNavLinks variant={variant} />
    </Suspense>
);

const Navbar = () => {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useConvexAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const signOut = () =>
        authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    setMenuOpen(false);
                    toast.success("Successfully signed out");
                    router.replace("/");
                    router.refresh();
                },
                onError: (err) => {
                    toast.error(err.error?.message || "Sign out failed. Please try again.");
                },
            },
        });

    return (
        <nav className="w-full py-4 lg:py-5 flex items-center gap-2 sm:gap-3 lg:gap-4 xl:gap-8">
            <Link href="/" className="shrink-0">
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold">
                    Next<span className="text-primary">Pro</span>
                </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-1">
                <NavLinks variant="desktop" />
            </div>

            {/* Search: right-aligned, capped by max-w-sm on mobile; fixed width on desktop */}
            <div className="flex-1 min-w-0 flex justify-end lg:flex-none lg:ml-auto lg:w-64 xl:w-80">
                <SearchInput />
            </div>

            {/* Desktop actions */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
                {isLoading ? null : isAuthenticated ? (
                    <Button onClick={signOut}>Log out</Button>
                ) : (
                    <>
                        <Button asChild>
                            <Link href="/auth/login">Log in</Link>
                        </Button>
                        <Button asChild variant="secondary">
                            <Link href="/auth/signup">Sign up</Link>
                        </Button>
                    </>
                )}
                <ModeToggle />
            </div>
            {/* Mobile menu */}
            <Drawer direction="left" open={menuOpen} onOpenChange={setMenuOpen}>
                <DrawerTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="lg:hidden shrink-0"
                        aria-label="Open menu"
                    >
                        <Menu />
                    </Button>
                </DrawerTrigger>
                <DrawerContent className="lg:hidden">
                    <DrawerHeader className="flex-row items-center justify-between border-b">
                        <div>
                            <DrawerTitle className="text-lg font-bold">
                                Next<span className="text-primary">Pro</span>
                            </DrawerTitle>
                            <DrawerDescription className="sr-only">Site navigation</DrawerDescription>
                        </div>
                        <DrawerClose asChild>
                            <Button variant="ghost" size="icon" aria-label="Close menu">
                                <X />
                            </Button>
                        </DrawerClose>
                    </DrawerHeader>

                    <div className="flex flex-col gap-1 p-4">
                        <NavLinks variant="mobile" />
                    </div>

                    <DrawerFooter className="border-t">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Theme</span>
                            <ModeToggle />
                        </div>
                        {isLoading ? null : isAuthenticated ? (
                            <Button onClick={signOut} className="w-full">
                                Log out
                            </Button>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                <DrawerClose asChild>
                                    <Button asChild>
                                        <Link href="/auth/login">Log in</Link>
                                    </Button>
                                </DrawerClose>
                                <DrawerClose asChild>
                                    <Button asChild variant="secondary">
                                        <Link href="/auth/signup">Sign up</Link>
                                    </Button>
                                </DrawerClose>
                            </div>
                        )}
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </nav>
    );
};

export default Navbar;
