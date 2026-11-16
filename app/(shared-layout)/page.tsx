import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import { fetchQuery } from "convex/nextjs";
import {
  ArrowRight,
  MessagesSquare,
  PenLine,
  Search,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { HomeData, HomePost } from "@/convex/home";
import { Button } from "@/components/ui/button";
import { WriteCtaActions } from "@/components/web/home/write-cta-actions";

export const metadata: Metadata = {
  title: "NextPro — Next.js tutorials by developers",
  description:
    "Read and write Next.js tutorials. Developers publish posts, readers discuss them in the comments, and you can see who's reading right now.",
};

export default function Home() {
  return (
    <div className="home">
      <Suspense fallback={<div className="min-h-[70vh]" aria-hidden="true" />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

async function HomeContent() {
  "use cache";
  cacheLife("max");
  cacheTag("posts");
  cacheTag("comments");

  const data = await fetchQuery(api.home.getHomeData);
  // Safe inside "use cache": refreshed whenever the cache entry is (on every new post/comment).
  const year = new Date().getFullYear();

  return (
    <>
      <Masthead data={data} />
      {data.latest ? <LatestPost post={data.latest} /> : <EmptyLatest />}
      <Features />
      <WriteBand />
      <Colophon year={year} />
    </>
  );
}

const longDate = (ms: number) =>
  new Date(ms).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

const isoDate = (ms: number) => new Date(ms).toISOString();

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

const commentsLabel = (n: number) => `${n} ${plural(n, "comment", "comments")}`;

/** Shared size for the large call-to-action buttons. */
const ctaButton = "h-11 px-6 text-base";

/* ------------------------------------------------------------------ */
/* Screen 1 — Masthead                                                 */
/* ------------------------------------------------------------------ */

function Masthead({ data }: { data: HomeData }) {
  const { posts, comments } = data.totals;
  const newest = data.latest;

  return (
    <section aria-labelledby="home-title" className="pt-6 lg:pt-10">
      <div className="flex items-baseline gap-4 border-b pb-3 text-sm text-home-muted sm:justify-between">
        <span className="hidden sm:inline">Next.js tutorials by developers</span>
        {newest && (
          <time dateTime={isoDate(newest._creationTime)} className="home-folio">
            Updated {longDate(newest._creationTime)}
          </time>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 py-10 lg:py-16 lg:pr-10">
          <h1
            id="home-title"
            className="home-display font-bold text-[clamp(2.75rem,12vw,4.5rem)] lg:text-[clamp(4.25rem,6vw,6.25rem)] break-words"
          >
            Next.js, written up by the people who use it.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-home-muted">
            Developers publish tutorials here, readers discuss them in the comments, and you can
            see who else is reading a post right now.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className={ctaButton}>
              <Link href="/blog">Read the blog</Link>
            </Button>
            <Button asChild variant="outline" className={ctaButton}>
              <Link href="/create">Write a post</Link>
            </Button>
          </div>
        </div>

        <dl className="grid grid-cols-2 border-t lg:col-span-4 lg:grid-cols-1 lg:border-t-0 lg:border-l">
          <div className="flex flex-col justify-end gap-2 border-r py-8 pr-4 lg:border-r-0 lg:border-b lg:px-8 lg:py-12">
            <dt className="text-sm text-home-muted order-2">
              {plural(posts, "post published", "posts published")}
            </dt>
            <dd className="home-display home-folio font-bold text-6xl sm:text-7xl lg:text-8xl text-home-accent-text order-1">
              {posts}
            </dd>
          </div>
          <div className="flex flex-col justify-end gap-2 py-8 pl-4 lg:px-8 lg:py-12">
            <dt className="text-sm text-home-muted order-2">
              {plural(comments, "comment", "comments")}
            </dt>
            <dd className="home-display home-folio font-bold text-6xl sm:text-7xl lg:text-8xl order-1">
              {comments}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

function SectionHeading({ id, children, aside }: { id: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t pt-3 pb-6">
      <h2 id={id} className="text-sm font-bold">
        {children}
      </h2>
      {aside}
    </div>
  );
}

const allPostsLink = (
  <Link
    href="/blog"
    className="inline-flex items-center gap-2 text-sm font-bold text-home-accent-text hover:underline underline-offset-4"
  >
    All posts
    <ArrowRight className="size-4" aria-hidden="true" />
  </Link>
);

/* ------------------------------------------------------------------ */
/* Screen 2 — Latest post                                              */
/* ------------------------------------------------------------------ */

function LatestPost({ post }: { post: HomePost }) {
  return (
    <section aria-labelledby="home-latest" className="pt-10 lg:pt-16">
      <SectionHeading id="home-latest" aside={allPostsLink}>
        Latest
      </SectionHeading>
      <Link
        href={`/blog/${post._id}`}
        className="group grid grid-cols-1 gap-6 outline-none lg:grid-cols-12 lg:gap-10 focus-visible:ring-2 focus-visible:ring-home-accent focus-visible:ring-offset-4 focus-visible:ring-offset-home-surface"
      >
        {post.imageUrl && (
          <div className="lg:col-span-7 overflow-hidden bg-home-surface-2">
            <Image
              src={post.imageUrl}
              alt={post.title}
              width={1120}
              height={700}
              // 7 of 12 columns, capped by the max-w-7xl container
              sizes="(min-width: 1280px) 710px, (min-width: 1024px) 56vw, 100vw"
              className="aspect-[16/10] w-full object-cover home-fade group-hover:scale-[1.015]"
            />
          </div>
        )}
        <div className={post.imageUrl ? "lg:col-span-5 flex flex-col" : "lg:col-span-12 flex flex-col"}>
          <time dateTime={isoDate(post._creationTime)} className="text-sm text-home-muted home-folio">
            {longDate(post._creationTime)}
          </time>
          <h3 className="home-display mt-3 font-bold text-4xl sm:text-5xl break-words group-hover:text-home-accent-text home-fade">
            {post.title}
          </h3>
          {post.excerpt && <p className="mt-5 text-base sm:text-lg text-home-muted break-words">{post.excerpt}</p>}
          <div className="mt-6 flex items-center justify-between gap-4 border-t pt-4 text-sm lg:mt-auto">
            <span className="text-home-muted home-folio">{commentsLabel(post.commentCount)}</span>
            <span className="inline-flex items-center gap-2 font-bold text-home-accent-text">
              Read post
              <ArrowRight className="size-4 home-fade group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}

function EmptyLatest() {
  return (
    <section aria-labelledby="home-latest" className="pt-10 lg:pt-16">
      <SectionHeading id="home-latest">Latest</SectionHeading>
      <div className="flex flex-col items-start gap-5 py-10">
        <p className="text-2xl font-bold">No posts yet.</p>
        <Button asChild className={ctaButton}>
          <Link href="/create">Write the first post</Link>
        </Button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Screen 3 — What you can do here                                     */
/* ------------------------------------------------------------------ */

const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: PenLine, title: "Write", body: "Publish a tutorial with a title, a body and a cover image." },
  {
    icon: MessagesSquare,
    title: "Discuss",
    body: "Comment on any post. New comments appear without reloading the page.",
  },
  {
    icon: Users,
    title: "See who's reading",
    body: "Signed-in readers see who else is viewing the same post right now.",
  },
  { icon: Search, title: "Search", body: "Find any post by its title or content from the search bar in the header." },
  {
    icon: ShieldCheck,
    title: "Secure accounts",
    body: "Accounts require a verified email, and sign-in supports two-factor authentication.",
  },
];

function Features() {
  return (
    <section aria-labelledby="home-features" className="pt-16 lg:pt-24">
      <SectionHeading id="home-features">What you can do here</SectionHeading>
      <ol className="grid grid-cols-1 border-l border-t sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }, i) => (
          <li key={title} className="flex flex-col gap-4 border-b border-r p-6 lg:p-8">
            <div className="flex items-center justify-between">
              <span className="home-folio text-sm text-home-muted">{String(i + 1).padStart(2, "0")}</span>
              <Icon className="size-5 text-home-accent-text" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
            <p className="text-home-muted">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Screen 4 — Write for NextPro                                        */
/* ------------------------------------------------------------------ */

function WriteBand() {
  return (
    <section
      aria-labelledby="home-write"
      // Full-bleed: break out of the centered <main> container. The inner wrapper
      // repeats <main>'s max-w-7xl + padding so the content lines up with the rest of the page.
      className="mt-16 lg:mt-24 ml-[calc(50%-50vw)] w-screen bg-home-accent text-white"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-14 md:px-6 lg:grid-cols-12 lg:items-end lg:px-8 lg:py-20">
        <div className="lg:col-span-8">
          <h2 id="home-write" className="home-display font-bold text-5xl sm:text-6xl lg:text-7xl">
            Write for NextPro.
          </h2>
          <p className="mt-5 max-w-xl text-lg text-white/85">
            Explain something you figured out in Next.js. Add a cover image, publish it, and answer
            readers in the comments.
          </p>
        </div>
        <div className="lg:col-span-4 lg:justify-self-end">
          <WriteCtaActions />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Screen 5 — Colophon                                                 */
/* ------------------------------------------------------------------ */

function Colophon({ year }: { year: number }) {
  return (
    <footer className="grid grid-cols-1 gap-6 border-t py-10 text-sm text-home-muted sm:grid-cols-12">
      <div className="sm:col-span-6">
        <p className="font-bold text-home-ink">NextPro</p>
        <p className="mt-1">Built with Next.js 16, Convex and Better Auth.</p>
      </div>
      <nav aria-label="Footer" className="sm:col-span-3">
        <ul className="flex flex-col gap-1">
          <li>
            <Link href="/blog" className="hover:text-home-accent-text">Blog</Link>
          </li>
          <li>
            <Link href="/create" className="hover:text-home-accent-text">Create</Link>
          </li>
          <li>
            <Link href="/auth/login" className="hover:text-home-accent-text">Log in</Link>
          </li>
        </ul>
      </nav>
      <p className="sm:col-span-3 sm:text-right home-folio">© {year} NextPro</p>
    </footer>
  );
}
