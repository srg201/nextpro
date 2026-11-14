import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { authComponent } from "./auth";


export const createPost =mutation({
    args: {
        title: v.string(),
        content: v.string()
    },
    handler: async (ctx, { title, content }) => {
        const user =await authComponent.getAuthUser(ctx);
        const post = await ctx.db.insert("posts", {
            title: title,
            content: content,
            authorId: user._id,
        });
        return post;
    }
})