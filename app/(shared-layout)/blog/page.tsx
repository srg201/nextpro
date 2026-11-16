import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Blog | Next.js 16",
  description: "Use our blog page to improve your next.js 16 knowledge"
}

const Page = async () => {
  return (
    <div className="py-12">
      <div className="text-center pb-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Our Blog
        </h1>
        <p className="pt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
          Inside, thoughts and trends from our team.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <SkeletonLoadinUI key={i} />
            ))}
          </div>
        }
      >
        <LoadBlogList />
      </Suspense>
    </div>
  );
};

export default Page;

async function LoadBlogList() {
  'use cache';
  cacheLife('max')
  cacheTag("posts")
  const data = await fetchQuery(api.posts.getPosts);

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {data?.map((article) => (
        <Card
          key={article._id.toString()}
          className="w-full pt-0 rounded-xl flex flex-col gap-4 max-w-full"
        >
          {article?.imageUrl && <Image
            src={article.imageUrl}
            className="rounded-t-xl aspect-video w-full object-fill"
            alt="Image"
            width={500}
            height={500}
            loading="eager"
          />}
          <CardContent className="flex flex-col gap-2.5 h-full">
            <Link href={`/blog/${article._id}`} className="block">
              <h1 className="text-2xl font-bold hover:text-primary transition-all">
                {article.title}
              </h1>
            </Link>
            <CardDescription className="text-sm text-muted-foreground line-clamp-3">
              {article.content}
            </CardDescription>
            <Button asChild className="mt-auto">
              <Link href={`/blog/${article._id.toString()}`}>Read more</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SkeletonLoadinUI() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-56 w-full rounded-xl aspect-video" />
      <div className="gap-2.5 flex flex-col">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}
