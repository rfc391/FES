import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Share2, MessageCircle, UserPlus, Shield, Globe, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const postSchema = z.object({
  content: z.string().min(1, "Post content is required"),
  tags: z.array(z.string()).optional(),
});

type Post = {
  id: number;
  content: string;
  userId: number;
  username: string;
  createdAt: string;
  likes: number;
  comments: number;
  tags: string[];
  attachments?: {
    type: string;
    url: string;
  }[];
};

export default function ThreatSocialPage() {
  const { toast } = useToast();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  
  const form = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
      tags: [],
    },
  });

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['/api/social/posts'],
    queryFn: async () => {
      const res = await fetch('/api/social/posts');
      if (!res.ok) throw new Error('Failed to fetch posts');
      return res.json() as Promise<Post[]>;
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: z.infer<typeof postSchema>) => {
      const res = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to create post');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Post created successfully",
      });
      form.reset();
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await fetch(`/api/social/posts/${postId}/like`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to like post');
      return res.json();
    },
    onSuccess: () => refetch(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Sidebar - Create Post */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createPostMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Share your security insights..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createPostMutation.isPending}>
                  {createPostMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Main Content - Posts Feed */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Intelligence Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {posts?.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {post.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{post.username}</h3>
                        <time className="text-sm text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </time>
                      </div>
                      <p className="mt-2 text-muted-foreground">{post.content}</p>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => likePostMutation.mutate(post.id)}
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          {post.likes}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPost(post)}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          {post.comments}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
