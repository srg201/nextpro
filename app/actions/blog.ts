"use server";

import z from "zod";
import { postSchema } from "../schemas/blog";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getToken } from "@/lib/auth-server";

type ActionResult = { success: true } | { success: false; error: string };

export const createPostAction = async (
    data: z.infer<typeof postSchema>,
): Promise<ActionResult> => {
    const parsed = postSchema.safeParse(data);
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
    }

    const token = await getToken();
    if (!token) {
        return { success: false, error: "You need to be logged in to create a post." };
    }

    try {
        await fetchMutation(api.posts.createPost, parsed.data, { token });
    } catch (error) {
        console.error("createPost failed:", error);
        return { success: false, error: "Failed to create post. Please try again." };
    }

    return { success: true };
};
