import Link from "next/link";
import { ModeToggle } from "../ui/theme-toggle";
import { Button } from "../ui/button";

const Navbar = () => {
    return (
        <nav className="w-full py-5 flex items-center justify-between">
            <div className="flex items-center gap-8">
                <Link href="/">
                    <h1 className="text-3xl font-bold">Next<span className="text-blue-500">Pro</span></h1>
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
                <ModeToggle />
                <Button asChild>
                    <Link href="/auth/login">Log in</Link>
                </Button>
                <Button asChild variant={'secondary'}>
                    <Link href="/auth/signup">Sign up</Link>
                </Button>
            </div>
        </nav>
    )
}

export default Navbar

