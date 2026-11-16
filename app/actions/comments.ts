"use server";

import z from "zod";
import { commentSchema } from "../schemas/comment";
import { getToken } from "@/lib/auth-server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { updateTag } from "next/cache";

export const createCommentAction = async (
  data: z.infer<typeof commentSchema>,
) => {
  const parsed = commentSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed?.error?.issues[0]?.message ?? "Invalid data",
    };
  }

  const token = await getToken();
  if (!token) {
    return {
      success: false,
      error: "You need to be logged in to create a post.",
    };
  }

  await fetchMutation(
    api.comments.createComment,
    data,
    { token },
  );
  updateTag("comments")
  return { success: true };
};