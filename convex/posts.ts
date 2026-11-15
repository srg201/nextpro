import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";


export const createPost =mutation({
    args: {
        title: v.string(),
        content: v.string()
    },
    handler: async (ctx, { title, content }) => {
        const user =await authComponent.getAuthUser(ctx);

        if(!user) {
            throw new ConvexError("Not authenticated");
        }

        const post = await ctx.db.insert("posts", {
            title: title,
            content: content,
            authorId: user._id,
        });
        return post;
    }
})

export const getPosts = query({
    args: {},
    handler: async (ctx) => {
        const posts = await ctx.db.query("posts").order('desc').collect();
        return posts;
    }
})