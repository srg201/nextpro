import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import CommentSection from "@/components/web/comment-sections";
import PostPresence from "@/components/web/post-presence";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getToken } from "@/lib/auth-server";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

interface PostIdRouteProps {
  params: Promise<{
    id: Id<"posts">;
  }>;
}

export default async function PostIdRoute(props: PostIdRouteProps) {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in duration-500 relative flex flex-col gap-7 items-start">
      <Button asChild variant={"outline"}>
        <Link href={"/blog"}>
          <ArrowLeft /> Back to blog
        </Link>
      </Button>

      <Suspense fallback={<PostIdSkeleton />}>
        <LoadPost params={props.params} />
      </Suspense>
    </div>
  );
}

async function LoadPost({ params }: PostIdRouteProps) {
  // "use cache";
  // cacheLife("max");
  const token = await getToken()
  const { id } = await params;
  const [post, comments, userId] = await Promise.all([
    await fetchQuery(api.posts.getPostById, { postId: id }),
    await preloadQuery(api.comments.getCommentsByPostId, {
      postId: id,
    }),
    await fetchQuery(api.presence.getUserId, {}, {token})
  ]);


  if (!post?._id) {
    return (
      <h1 className="text-6xl font-extrabold tracking-tight">No post Found</h1>
    );
  }
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="relative w-full h-full rounded-xl overflow-hidden shadow-sm aspect-video">
        <Image
          src={
            post.imageUrl ??
            "https://images.unsplash.com/photo-1614003972805-5e7f7f41036d?q=80&w=3242&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
          }
          alt="Post Image"
          fill
          className="object-cover hover:scale-105 transition-transform duration-500 "
        />
      </div>
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
        {post.title}
      </h1>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">
        Posted on{" "}
        {new Date(Number(post._creationTime?.toString())).toLocaleDateString(
          "en-US",
        )}
      </span>
      <Separator orientation="vertical" />
      {userId && <PostPresence roomId={post._id} userId={userId} />}
      </div>
      <Separator />
      <p className="text-sm md:text-lg text-muted-foreground">{post.content}</p>

      <Separator />
      <CommentSection preloadedComments={comments} postId={post._id} />
    </div>
  );
}

function PostIdSkeleton() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <Skeleton className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm" />

      <Skeleton className="h-8 w-2/3 mb-4" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
    </div>
  );
}

export async function generateMetadata({params}: PostIdRouteProps): Promise<Metadata> {
  "use cache"
  cacheLife("max")
  const {id} = await params;

  const post = await fetchQuery(api.posts.getPostById, {postId: id})

  if(!post) {
    return {
      title: "Post not found"
    }
  }

  return {
    title: post.title,
    description: post.content
  }

}