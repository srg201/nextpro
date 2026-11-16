import { Loader2Icon, Search } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";

const SearchInput = () => {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the results dropdown when the user clicks/taps anywhere outside it.
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const results = useQuery(
    api.posts.searchPosts,
    term.length > 2 ? {limit: 5, term} : "skip"
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTerm(e.target.value);
    setOpen(true)
  };

  return (
    <div ref={containerRef} className="relative w-full min-w-0 max-w-60">
      <div className="relative">
        <Search className="absolute left-2.5 top-2 size-4 text-muted-foreground" />
        <Input
          value={term}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          type="search"
          placeholder="Search Posts..."
          className="w-full min-w-0 pl-8 bg-background text-xs md:text-sm"
        />
      </div>

      {open && term.length > 2 && (
        <div className="z-10 absolute top-full mt-2 p-1 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 w-full">
            {results === undefined ? (
                <div className="w-full flex gap-2 items-center justify-center min-h-20">
                    <Loader2Icon className="animate-spin" />
                    Searching...
                </div>
            ) : results.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2 px-4">No results found!</p>
            ) : (
                <div className="py-1 flex flex-col gap-2">
                    {results.map(post => (
                        <Link onClick={() => {
                          setOpen(false)
                          setTerm("")
                        }} className="p-0.5 rounded-md flex gap-4 items-center hover:bg-accent transition-all duration-500" key={post._id} href={`/blog/${post._id}`}>
                            {post?.imageUrl !== null ? <Image className="rounded-md aspect-video w-16 shrink-0 object-cover sm:w-20" src={post.imageUrl} alt="Image" width={100} height={30} /> : ""}
                            <div className="min-w-0">
                                <h3 className="text-sm truncate">{post.title}</h3>
                            <p className="text-muted-foreground text-xs line-clamp-1">{post.body}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
