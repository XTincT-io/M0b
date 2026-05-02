import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle, XCircle, Send, Twitter, Zap, Trash2 } from "lucide-react";
import type { Post } from "@shared/schema";

function PostCard({ post, onApprove, onReject, onPost, onDelete, loading }: {
  post: Post;
  onApprove: () => void;
  onReject: () => void;
  onPost: () => void;
  onDelete: () => void;
  loading: boolean;
}) {
  const eng = post.engagementData as { likes?: number; retweets?: number; replies?: number } | null;

  const statusConfig: Record<string, { color: string; label: string }> = {
    pending: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", label: "Pending" },
    approved: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "Approved" },
    posted: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", label: "Posted" },
    rejected: { color: "bg-red-500/20 text-red-400 border-red-500/30", label: "Rejected" },
  };

  const sc = statusConfig[post.status] || statusConfig.pending;

  return (
    <Card className="border-border bg-card card-hover">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-sky-500/15 flex items-center justify-center flex-shrink-0">
            <Twitter className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs text-muted-foreground font-medium">@0xM0B</span>
              {post.aiGenerated && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-purple-500/10 text-purple-400 border-purple-500/20">
                  <Zap className="w-2.5 h-2.5 mr-1" />AI Generated
                </Badge>
              )}
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${sc.color}`}>
                {sc.label}
              </Badge>
              <span className="text-[11px] text-muted-foreground ml-auto">
                {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            <p className="text-sm text-foreground/90 leading-relaxed mb-3">{post.content}</p>

            <div className="flex gap-1 flex-wrap mb-3">
              {post.hashtags.map(h => (
                <span key={h} className="text-[11px] text-primary/70">{h}</span>
              ))}
            </div>

            {eng && (
              <div className="flex gap-4 mb-3 py-2 border-t border-border">
                <span className="text-xs text-muted-foreground">❤️ {eng.likes} likes</span>
                <span className="text-xs text-muted-foreground">🔁 {eng.retweets} retweets</span>
                <span className="text-xs text-muted-foreground">💬 {eng.replies} replies</span>
              </div>
            )}

            {post.postedAt && (
              <p className="text-[11px] text-emerald-400 mb-3">
                ✓ Posted {new Date(post.postedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            )}

            <div className="flex gap-2 flex-wrap">
              {post.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={onReject}
                    disabled={loading}
                  >
                    <XCircle className="w-3 h-3 mr-1" />Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                    onClick={onApprove}
                    disabled={loading}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />Approve
                  </Button>
                </>
              )}
              {post.status === "approved" && (
                <Button
                  size="sm"
                  className="text-xs bg-sky-600 hover:bg-sky-700"
                  onClick={onPost}
                  disabled={loading}
                >
                  <Send className="w-3 h-3 mr-1" />Post to X
                </Button>
              )}
              {(post.status === "rejected" || post.status === "posted") && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                  onClick={onDelete}
                  disabled={loading}
                >
                  <Trash2 className="w-3 h-3 mr-1" />Remove
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Queue() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: posts, isLoading } = useQuery<Post[]>({ queryKey: ["/api/posts"] });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Post> }) =>
      apiRequest("PATCH", `/api/posts/${id}`, updates).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => toast({ title: "Error", description: "Action failed.", variant: "destructive" }),
  });

  const postMutation = useMutation({
    mutationFn: (postId: string) =>
      apiRequest("POST", "/api/post-to-twitter", { postId }).then(r => r.json()),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Posted to X!", description: `Tweet published successfully.` });
    },
    onError: () => toast({ title: "Error", description: "Failed to post to X.", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/posts/${id}`).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Removed", description: "Post removed from queue." });
    },
  });

  const byStatus = (status: string) => posts?.filter(p => p.status === status) || [];
  const loading = updateMutation.isPending || postMutation.isPending || deleteMutation.isPending;

  const tabConfig = [
    { value: "pending", label: "Pending", icon: Clock, color: "text-amber-400" },
    { value: "approved", label: "Approved", icon: CheckCircle, color: "text-blue-400" },
    { value: "posted", label: "Posted", icon: Send, color: "text-emerald-400" },
    { value: "rejected", label: "Rejected", icon: XCircle, color: "text-red-400" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold gradient-text" style={{ fontFamily: "var(--font-display)" }}>
            Content Queue
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">Review and manage posts before they go live on @0xM0B</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="bg-secondary/50 mb-6">
          {tabConfig.map(({ value, label, icon: Icon, color }) => {
            const count = byStatus(value).length;
            return (
              <TabsTrigger key={value} value={value} className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
                <Icon className={`w-3.5 h-3.5 mr-1.5 ${color}`} />
                {label}
                {count > 0 && (
                  <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0 bg-primary/20 text-primary">{count}</Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tabConfig.map(({ value }) => (
          <TabsContent key={value} value={value} className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)
            ) : byStatus(value).length > 0 ? (
              byStatus(value).map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  loading={loading}
                  onApprove={() => updateMutation.mutate({ id: post.id, updates: { status: "approved" } })}
                  onReject={() => updateMutation.mutate({ id: post.id, updates: { status: "rejected" } })}
                  onPost={() => postMutation.mutate(post.id)}
                  onDelete={() => deleteMutation.mutate(post.id)}
                />
              ))
            ) : (
              <Card className="border-border bg-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="w-10 h-10 text-muted-foreground mb-3 opacity-40" />
                  <p className="text-muted-foreground text-sm">No {value} posts</p>
                  {value === "pending" && (
                    <p className="text-xs text-muted-foreground mt-1">Create posts in the Composer</p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
