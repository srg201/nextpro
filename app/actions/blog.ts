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
    return {
      success: false,
      error: parsed?.error?.issues[0]?.message ?? "Invalid data",
    };
  }

  if(!parsed.data.image) {
    return {
        success: false,
        error: "Please upload an image!"
    }
  }

  const token = await getToken();
  if (!token) {
    return {
      success: false,
      error: "You need to be logged in to create a post.",
    };
  }

  const imageUrl = await fetchMutation(
    api.posts.generateImageUploadUrl,
    {},
    { token },
  );

  const uploadResult = await fetch(imageUrl, {
    method: "POST",
    headers: {
      "Content-Type": parsed.data.image.type,
    },
    body: parsed.data.image,
  });

  if (!uploadResult.ok) {
    return {
      success: false,
      error: "Failed to upload image",
    };
  }

  const { storageId } = await uploadResult.json();

  try {
    await fetchMutation(api.posts.createPost, {
        content: parsed.data.content,
        title: parsed.data.title,
        imageStorageId: storageId
    }, { token });
  } catch (error) {
    console.error("createPost failed:", error);
    return {
      success: false,
      error: "Failed to create post. Please try again.",
    };
  }

  return { success: true };
};
