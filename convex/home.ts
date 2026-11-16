import { v, type Infer } from "convex/values";
import { query } from "./_generated/server";

const EXCERPT_LENGTH = 180;

const homePost = v.object({
  _id: v.id("posts"),
  _creationTime: v.number(),
  title: v.string(),
  excerpt: v.string(),
  imageUrl: v.union(v.string(), v.null()),
  commentCount: v.number(),
});

const homeData = v.object({
  latest: v.union(homePost, v.null()),
  totals: v.object({ posts: v.number(), comments: v.number() }),
});

export type HomePost = Infer<typeof homePost>;
export type HomeData = Infer<typeof homeData>;

/** First ~180 characters, cut at a word boundary, with an ellipsis if shortened. */
function toExcerpt(content: string): string {
  const text = content.replace(/\s+/g, " ").trim();
  if (text.length <= EXCERPT_LENGTH) return text;
  const cut = text.slice(0, EXCERPT_LENGTH);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:!?-]+$/, "")}…`;
}

/**
 * Everything the homepage shows: the newest post and the site totals.
 *
 * Convex has no count() yet, so totals require reading both tables. That's fine here:
 * the homepage caches this result ("use cache" + cacheTag) and only refetches it when a
 * post or comment is created (updateTag in the server actions), not on every visit.
 */
export const getHomeData = query({
  args: {},
  returns: homeData,
  handler: async (ctx) => {
    const [posts, comments] = await Promise.all([
      ctx.db.query("posts").order("desc").collect(),
      ctx.db.query("comments").collect(),
    ]);

    const newest = posts[0];
    const latest = newest
      ? {
          _id: newest._id,
          _creationTime: newest._creationTime,
          title: newest.title.trim(),
          excerpt: toExcerpt(newest.content),
          imageUrl: newest.imageStorageId ? await ctx.storage.getUrl(newest.imageStorageId) : null,
          // All comments are already loaded for the total; count in memory instead of a second query.
          commentCount: comments.filter((c) => c.postId === newest._id).length,
        }
      : null;

    return {
      latest,
      totals: { posts: posts.length, comments: comments.length },
    };
  },
});
