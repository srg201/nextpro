"use client";
import { Controller, useForm } from "react-hook-form";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { MessagesSquare } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentSchema } from "@/app/schemas/comment";
import z from "zod";
import { Id } from "@/convex/_generated/dataModel";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Suspense, useTransition } from "react";
import { createCommentAction } from "@/app/actions/comments";
import { toast } from "sonner";

interface ICommentInterface {
  _id: Id<"comments">;
  _creationTime: number;
  body: string;
  postId: Id<"posts">;
  authorId: string;
  authorName: string;
}

const CommentSection = ({
  postId,
  comments,
}: {
  postId: Id<"posts">;
  comments: ICommentInterface[];
}) => {
  const [isPending, startTransition] = useTransition();
  const form = useForm({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: "", postId },
  });

  const onSubmit = async (data: z.infer<typeof commentSchema>) => {
    try {
      startTransition(async () => {
        const result = await createCommentAction(data);
        if(!result.success) {
            toast.error(result.error)
            return;
        }
        toast.success("Successfully added a comment");
      });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
        form.reset();
    }
  };

  return (
    <Card>
      <CardHeader className="flex gap-2 items-center border-b">
        <MessagesSquare className="size-5" />
        <h2 className="text-xl font-bold">{comments.length === 1 ? "1 Comment" : `${comments.length} Comments`}</h2>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex gap-2 items-end"
        >
          <FieldGroup>
            <Controller
              name="body"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="body">Comment</FieldLabel>
                  <Input
                    {...field}
                    id="body"
                    placeholder="John Doe"
                    aria-invalid={fieldState.invalid}
                    disabled={form.formState.isSubmitting}
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <Button type="submit" className="hover:cursor-pointer">
            {isPending ? "Adding..." : "Add"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="p-0">
        <Suspense fallback={<div>Loading...</div>}>
          <div className="flex flex-col gap-4 w-full ">
            {comments.map((comment) => (
            <div className="w-full border-b p-4" key={comment._id}>
                <div className="flex gap-2">
                    <h3 className="text-muted-foreground">{comment.authorName}</h3>
                    <span className="text-sm text-muted-foreground">{new Date(Number(comment._creationTime)).toLocaleDateString("en-US")}</span>
                </div>
                <p>{comment.body}</p>
            </div>
          ))}
          </div>
        </Suspense>
      </CardFooter>
    </Card>
  );
};

export default CommentSection;
