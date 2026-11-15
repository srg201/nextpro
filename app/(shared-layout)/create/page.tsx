"use client";
import { createPostAction } from "@/app/actions/blog";
import { postSchema } from "@/app/schemas/blog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/web/image-upload-field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const Page = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      image: null,
    },
  });

  const onSubmit = (data: z.infer<typeof postSchema>) => {
    startTransition(async () => {
      const result = await createPostAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Post created successfully!");
      form.reset();
      return router.push("/blog");
    });
  };

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tigh sm:text-5xl">
          Create Post
        </h1>
        <p className="text-xl text-muted-foreground mt-4">
          Share your thoughts with the world.
        </p>
      </div>
      <Card className="w-full max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Create Blog Article</CardTitle>
          <CardDescription>Create a new blog article.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <FieldGroup className="flex flex-col gap-1">
                  <FieldLabel
                    htmlFor="title"
                    className="block text-sm font-medium text-muted-foreground"
                  >
                    Title
                  </FieldLabel>
                  <Input
                    id="title"
                    {...field}
                    className="block w-full border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter the title of your post"
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldGroup>
              )}
            />
            <Controller
              name="content"
              control={form.control}
              render={({ field, fieldState }) => (
                <FieldGroup className="flex flex-col gap-1">
                  <FieldLabel
                    htmlFor="content"
                    className="block text-sm font-medium text-muted-foreground"
                  >
                    Content
                  </FieldLabel>
                  <Textarea
                    id="content"
                    {...field}
                    className="mt-1 block w-full border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Write your post content here"
                    rows={10}
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldGroup>
              )}
            />
            <Controller
              name="image"
              control={form.control}
              render={({ field, fieldState }) => (
                <FieldGroup className="flex flex-col gap-1" >
                  <FieldLabel
                    htmlFor="image"
                    className="block text-sm font-medium text-muted-foreground"
                  >
                    Pick an image
                  </FieldLabel>
                  <ImageUploadField
                    id="image"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={isPending}
                    invalid={!!fieldState.error}
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldGroup>
              )}
            />
            <Button
              type="submit"
              className="w-full hover:cursor-pointer"
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create Post"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
