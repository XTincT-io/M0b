import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Search, MessageSquare, Repeat2, Heart,
  CheckCircle, Zap, Twitter, Scan, Hash
} from "lucide-react";
import type { CommunityMention } from "@shared/schema";

const ACTION_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  reply: { icon: MessageSquare, color: "text-blue-400 bg-blue-500/15 border-blue-500/20", label: "Reply" },
  retweet: { icon: Repeat2, color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/20", label: "Retweet" },
  like: { icon: Heart, color: "text-pink-400 bg-pink-500/15 border-pink-500/20", label: "Like" },
};

function MentionCard({ mention, onAction, loading }: {
  mention: CommunityMention;
  onAction: (id: string, action: string, replyText?: string) => void;
  loading: boolean;
}) {
  const [editingReply, setEditingReply] = useState(false);
  const [replyText, setReplyText] = useState(mention.aiReplyDraft || "");
  const actionConfig = ACTION_CONFIG[mention.engagementAction || "reply"];
  const ActionIcon = actionConfig?.icon || MessageSquare;

  const isCompleted = mention.actionStatus === "completed";

  return (
    <Card className={`border-border bg-card card-hover ${isCompleted ? "opacity-70" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
            {mention.displayName?.slice(0, 2).toUpperCase() || "??"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-sm font-semibold text-foreground">{mention.displayName}</span>
              <a
                href={`https://twitter.com/${mention.twitterHandle.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-sky-400 hover:underline flex items-center gap-0.5"
              >
                <Twitter className="w-2.5 h-2.5" />
                {mention.twitterHandle}
              </a>
              {actionConfig && (
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${actionConfig.color}`}>
                  <ActionIcon className="w-2.5 h-2.5 mr-1" />
                  {actionConfig.label}
                </Badge>
              )}
              {isCompleted ? (
                <Badge className="text-[10px] px-1.5 py-0 bg-emerald-500/15 text-emerald-400 border-emerald-500/20 ml-auto">
                  <CheckCircle className="w-2.5 h-2.5 mr-1" />Done
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-400 border-amber-500/30 ml-auto">
                  Pending
                </Badge>
              )}
            </div>

            <p className="text-sm text-foreground/80 leading-relaxed mb-2">
              {mention.tweetContent}
            </p>

            <div className="flex gap-1 mb-3 flex-wrap">
              {mention.hashtags.map(h => (
                <span key={h} className="text-[11px] text-primary/70">{h}</span>
              ))}
            </div>

            <p className="text-[11px] text-muted-foreground mb-3">
              {new Date(mention.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>

            {!isCompleted && (
              <>
                {mention.aiReplyDraft && mention.engagementAction === "reply" && (
                  <div className="mb-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Zap className="w-3 h-3 text-purple-400" />
                      <span className="text-[11px] text-purple-400 font-medium">AI Draft Reply</span>
                    </div>
                    {editingReply ? (
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="text-xs bg-secondary/50 border-border min-h-16 mb-2"
                      />
                    ) : (
                      <p className="text-xs text-foreground/80 leading-relaxed mb-2">{replyText}</p>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[10px] h-6 px-2 text-purple-400 hover:text-purple-300"
                      onClick={() => setEditingReply(!editingReply)}
                    >
                      {editingReply ? "Done editing" : "Edit reply"}
                    </Button>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-border text-muted-foreground hover:text-foreground"
                    onClick={() => onAction(mention.id, "skip")}
                    disabled={loading}
                  >
                    Skip
                  </Button>
                  <Button
                    size="sm"
                    className={`text-xs flex-1 ${
                      mention.engagementAction === "reply" ? "bg-blue-600 hover:bg-blue-700" :
                      mention.engagementAction === "retweet" ? "bg-emerald-600 hover:bg-emerald-700" :
                      "bg-pink-600 hover:bg-pink-700"
                    }`}
                    onClick={() => onAction(mention.id, mention.engagementAction || "reply", replyText)}
                    disabled={loading}
                  >
                    <ActionIcon className="w-3 h-3 mr-1" />
                    {actionConfig?.label || "Engage"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Community() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hashtag, setHashtag] = useState("");
  const [scanResult, setScanResult] = useState<{ scanned: number; total: number } | null>(null);

  const { data: mentions, isLoading } = useQuery<CommunityMention[]>({
    queryKey: ["/api/community"],
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string; replyText?: string }) =>
      apiRequest("PATCH", `/api/community/${id}`, {
        actionStatus: action === "skip" ? "skipped" : "completed",
        engagementAction: action === "skip" ? undefined : action,
      }).then(r => r.json()),
    onSuccess: (_data, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/community"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      if (action !== "skip") {
        toast({ title: "Engagement sent!", description: "Community member engaged successfully." });
      }
    },
  });

  const scanMutation = useMutation({
    mutationFn: (tag: string) =>
      apiRequest("POST", "/api/scan-hashtag", { hashtag: tag }).then(r => r.json()),
    onSuccess: (data) => {
      setScanResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/community"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Hashtag scanned!", description: `Found ${data.scanned} new community members.` });
    },
    onError: () => toast({ title: "Error", description: "Scan failed.", variant: "destructive" }),
  });

  const pending = mentions?.filter(m => m.actionStatus === "pending") || [];
  const completed = mentions?.filter(m => m.actionStatus === "completed") || [];
  const all = mentions || [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold gradient-text" style={{ fontFamily: "var(--font-display)" }}>
            Community Monitor
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">Track hashtag mentions and engage with the #MusicNFT community</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Scan className="w-4 h-4 text-primary" />
                Hashtag Scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Scan Twitter/X for users engaging with community hashtags.
              </p>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="MusicNFT"
                  value={hashtag}
                  onChange={(e) => setHashtag(e.target.value.replace(/^#/, ""))}
                  className="pl-8 bg-secondary/50 border-border text-sm"
                />
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/90 neon-glow-purple"
                onClick={() => scanMutation.mutate(`#${hashtag || "MusicNFT"}`)}
                disabled={scanMutation.isPending}
              >
                {scanMutation.isPending ? (
                  <Search className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Scan className="w-4 h-4 mr-2" />
                )}
                Scan Hashtag
              </Button>

              {scanResult && (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                  <p className="text-xs text-emerald-400 font-medium mb-1">Scan Complete</p>
                  <p className="text-xs text-muted-foreground">Found: <span className="text-foreground">{scanResult.scanned} new</span></p>
                  <p className="text-xs text-muted-foreground">Total: <span className="text-foreground">{scanResult.total} mentions</span></p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Tracked Hashtags</p>
              <div className="space-y-2">
                {["#MusicNFT", "#Web3Music", "#SolanaNFT", "#EthereumNFT", "#0xM0B", "#NFTCommunity"].map(tag => (
                  <div key={tag} className="flex items-center justify-between">
                    <span className="text-xs text-primary">{tag}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Summary</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total mentions</span>
                  <span className="text-xs font-medium text-foreground">{all.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Pending</span>
                  <span className="text-xs font-medium text-amber-400">{pending.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Completed</span>
                  <span className="text-xs font-medium text-emerald-400">{completed.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mentions list */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="pending">
            <TabsList className="bg-secondary/50 mb-4">
              <TabsTrigger value="pending" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary text-sm">
                Pending
                {pending.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0 bg-amber-500/20 text-amber-400">{pending.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary text-sm">
                Completed
                {completed.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0 bg-emerald-500/20 text-emerald-400">{completed.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary text-sm">
                All ({all.length})
              </TabsTrigger>
            </TabsList>

            {[
              { value: "pending", items: pending },
              { value: "completed", items: completed },
              { value: "all", items: all },
            ].map(({ value, items }) => (
              <TabsContent key={value} value={value} className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)
                ) : items.length > 0 ? (
                  items.map(mention => (
                    <MentionCard
                      key={mention.id}
                      mention={mention}
                      loading={actionMutation.isPending}
                      onAction={(id, action, replyText) => actionMutation.mutate({ id, action, replyText })}
                    />
                  ))
                ) : (
                  <Card className="border-border bg-card">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Users className="w-10 h-10 text-muted-foreground mb-3 opacity-40" />
                      <p className="text-muted-foreground text-sm">No {value} mentions</p>
                      {value === "pending" && (
                        <p className="text-xs text-muted-foreground mt-1">Scan a hashtag to discover community members</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
