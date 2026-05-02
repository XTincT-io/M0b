import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Music2, Users, Clock, CheckCircle, TrendingUp, Zap, Twitter, Activity } from "lucide-react";
import type { Post, CommunityMention } from "@shared/schema";

type Stats = {
  totalPosts: number;
  pendingPosts: number;
  verifiedArtists: number;
  totalNfts: number;
  communityMentions: number;
  pendingEngagements: number;
};

function StatCard({
  title, value, icon: Icon, color, sub, loading
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  sub?: string;
  loading?: boolean;
}) {
  return (
    <Card className="card-hover border-border bg-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
            )}
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PostCard({ post }: { post: Post }) {
  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    approved: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    posted: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const eng = post.engagementData as { likes?: number; retweets?: number; replies?: number } | null;

  return (
    <div className="flex gap-3 p-4 rounded-lg bg-secondary/40 hover:bg-secondary/60 transition-colors border border-border">
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Twitter className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-muted-foreground">@0xM0B</span>
          {post.aiGenerated && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-purple-500/10 text-purple-400 border-purple-500/20">
              <Zap className="w-2.5 h-2.5 mr-1" />AI
            </Badge>
          )}
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${statusColors[post.status] || ""}`}>
            {post.status}
          </Badge>
          <span className="text-xs text-muted-foreground ml-auto">
            {post.postedAt
              ? new Date(post.postedAt).toLocaleDateString()
              : new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed line-clamp-2">{post.content}</p>
        {eng && (
          <div className="flex gap-4 mt-2">
            <span className="text-xs text-muted-foreground">❤️ {eng.likes}</span>
            <span className="text-xs text-muted-foreground">🔁 {eng.retweets}</span>
            <span className="text-xs text-muted-foreground">💬 {eng.replies}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function MentionCard({ mention }: { mention: CommunityMention }) {
  const actionColors: Record<string, string> = {
    reply: "bg-blue-500/20 text-blue-400",
    retweet: "bg-emerald-500/20 text-emerald-400",
    like: "bg-pink-500/20 text-pink-400",
  };

  return (
    <div className="flex gap-3 p-4 rounded-lg bg-secondary/40 border border-border">
      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 flex-col text-xs font-bold text-primary mt-0.5">
        {mention.displayName?.slice(0, 2).toUpperCase() || "??"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-medium text-foreground">{mention.displayName}</span>
          <span className="text-xs text-muted-foreground">{mention.twitterHandle}</span>
          {mention.engagementAction && (
            <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${actionColors[mention.engagementAction] || ""}`}>
              {mention.engagementAction}
            </Badge>
          )}
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 ml-auto ${mention.actionStatus === "pending" ? "text-amber-400 border-amber-500/30" : "text-emerald-400 border-emerald-500/30"}`}
          >
            {mention.actionStatus}
          </Badge>
        </div>
        <p className="text-sm text-foreground/80 line-clamp-2">{mention.tweetContent}</p>
        <div className="flex gap-1 mt-1 flex-wrap">
          {mention.hashtags.map(h => (
            <span key={h} className="text-[11px] text-primary/80">{h}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({ queryKey: ["/api/stats"] });
  const { data: posts, isLoading: postsLoading } = useQuery<Post[]>({ queryKey: ["/api/posts"] });
  const { data: mentions, isLoading: mentionsLoading } = useQuery<CommunityMention[]>({ queryKey: ["/api/community"] });

  const recentPosts = posts?.slice(0, 3) || [];
  const recentMentions = mentions?.slice(0, 4) || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold gradient-text" style={{ fontFamily: "var(--font-display)" }}>
            Dashboard
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">Music NFT community overview for @0xM0B</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Total Posts"
          value={stats?.totalPosts ?? 0}
          icon={Twitter}
          color="bg-sky-500/15 text-sky-400"
          sub={`${stats?.pendingPosts ?? 0} awaiting approval`}
          loading={statsLoading}
        />
        <StatCard
          title="Verified Artists"
          value={stats?.verifiedArtists ?? 0}
          icon={CheckCircle}
          color="bg-emerald-500/15 text-emerald-400"
          sub="On-chain validated"
          loading={statsLoading}
        />
        <StatCard
          title="Music NFTs"
          value={stats?.totalNfts ?? 0}
          icon={Music2}
          color="bg-purple-500/15 text-purple-400"
          sub="Indexed & searchable"
          loading={statsLoading}
        />
        <StatCard
          title="Community Mentions"
          value={stats?.communityMentions ?? 0}
          icon={Users}
          color="bg-pink-500/15 text-pink-400"
          sub={`${stats?.pendingEngagements ?? 0} need action`}
          loading={statsLoading}
        />
        <StatCard
          title="Pending Queue"
          value={stats?.pendingPosts ?? 0}
          icon={Clock}
          color="bg-amber-500/15 text-amber-400"
          sub="Posts awaiting review"
          loading={statsLoading}
        />
        <StatCard
          title="Engagement Rate"
          value="4.8%"
          icon={TrendingUp}
          color="bg-cyan-500/15 text-cyan-400"
          sub="Above community avg"
          loading={statsLoading}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Twitter className="w-4 h-4 text-sky-400" />
                Recent Posts
              </CardTitle>
              <a href="/queue" className="text-xs text-primary hover:underline">View all →</a>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {postsLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
            ) : recentPosts.length > 0 ? (
              recentPosts.map(p => <PostCard key={p.id} post={p} />)
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">No posts yet</p>
            )}
          </CardContent>
        </Card>

        {/* Community Mentions */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-pink-400" />
                Community Mentions
              </CardTitle>
              <a href="/community" className="text-xs text-primary hover:underline">View all →</a>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {mentionsLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
            ) : recentMentions.length > 0 ? (
              recentMentions.map(m => <MentionCard key={m.id} mention={m} />)
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">No mentions yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
