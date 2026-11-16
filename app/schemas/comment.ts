import { Id } from "@/convex/_generated/dataModel";
import z from "zod";

export const commentSchema = z.object({
    body: z.string().min(3, "Please enter minimum 3 letters").max(100, "Maximum length is 100 symbols"),
    postId: z.custom<Id<"posts">>()
})