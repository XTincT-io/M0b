import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Zap, Send, RefreshCw, Twitter, PenSquare, Sparkles, Hash } from "lucide-react";

const COMMUNITY_HASHTAGS = ["#MusicNFT", "#Web3Music", "#NFTCommunity", "#SolanaNFT", "#EthereumNFT", "#MusicOnChain", "#0xM0B"];

type AiSuggestion = {
  content: string;
  hashtags: string[];
  type: string;
};

export default function Composer() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("engagement");
  const [context, setContext] = useState("");
  const [suggestion, setSuggestion] = useState<AiSuggestion | null>(null);
  const [charCount, setCharCount] = useState(0);

  const handleContentChange = (val: string) => {
    setContent(val);
    setCharCount(val.length);
  };

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/generate", { type: postType, context });
      return res.json() as Promise<AiSuggestion>;
    },
    onSuccess: (data) => {
      setSuggestion(data);
    },
    onError: () => {
      toast({ title: "Generation failed", description: "Could not generate content. Try again.", variant: "destructive" });
    },
  });

  const applySuggestion = () => {
    if (suggestion) {
      setContent(suggestion.content);
      setCharCount(suggestion.content.length);
    }
  };

  const submitMutation = useMutation({
    mutationFn: async (status: "pending" | "approved") => {
      const hashtags = content.match(/#\w+/g) || [];
      const res = await apiRequest("POST", "/api/posts", {
        content,
        platform: "twitter",
        status,
        aiGenerated: suggestion !== null && content === suggestion.content,
        hashtags,
      });
      return res.json();
    },
    onSuccess: (_data, status) => {
      toast({
        title: status === "approved" ? "Post approved!" : "Post saved to queue",
        description: status === "approved" ? "Post added to approved queue." : "Post saved as pending review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setContent("");
      setSuggestion(null);
      setCharCount(0);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save post.", variant: "destructive" });
    },
  });

  const appendHashtag = (tag: string) => {
    const newContent = content ? `${content} ${tag}` : tag;
    setContent(newContent);
    setCharCount(newContent.length);
  };

  const isOverLimit = charCount > 280;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <PenSquare className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold gradient-text" style={{ fontFamily: "var(--font-display)" }}>
            Post Composer
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">Create AI-assisted content for the @0xM0B community</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Main composer */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Twitter className="w-4 h-4 text-sky-400" />
                Compose Tweet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Twitter className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-2">@0xM0B</p>
                  <Textarea
                    placeholder="What's happening in the music NFT world? Compose your post here or use AI to generate content..."
                    value={content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="min-h-32 resize-none bg-secondary/50 border-border focus:border-primary/50 text-sm leading-relaxed"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-1 flex-wrap">
                      {content.match(/#\w+/g)?.slice(0, 4).map(h => (
                        <Badge key={h} variant="outline" className="text-[10px] px-1.5 text-primary border-primary/30">{h}</Badge>
                      ))}
                    </div>
                    <span className={`text-xs ${isOverLimit ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                      {charCount}/280
                    </span>
                  </div>
                </div>
              </div>

              {/* Hashtag quick-add */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Quick add hashtags</Label>
                <div className="flex gap-1.5 flex-wrap">
                  {COMMUNITY_HASHTAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => appendHashtag(tag)}
                      className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
                    >
                      <Hash className="w-2.5 h-2.5 inline mr-0.5" />{tag.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-border hover:border-primary/40"
                  onClick={() => submitMutation.mutate("pending")}
                  disabled={!content.trim() || isOverLimit || submitMutation.isPending}
                >
                  <Clock2 className="w-4 h-4 mr-2" />
                  Save to Queue
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 neon-glow-purple"
                  onClick={() => submitMutation.mutate("approved")}
                  disabled={!content.trim() || isOverLimit || submitMutation.isPending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Approve Post
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI sidebar */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                AI Content Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Content Type</Label>
                <Select value={postType} onValueChange={setPostType}>
                  <SelectTrigger className="bg-secondary/50 border-border text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engagement">Community Engagement</SelectItem>
                    <SelectItem value="spotlight">Artist Spotlight</SelectItem>
                    <SelectItem value="nft">NFT Showcase</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Context (optional)</Label>
                <Input
                  placeholder="e.g. artist name, NFT drop, topic..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="bg-secondary/50 border-border text-sm"
                />
              </div>

              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 neon-glow-purple"
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Generate Content
              </Button>

              {suggestion && (
                <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span className="text-xs text-purple-400 font-medium">AI Suggestion</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 ml-auto border-purple-500/30 text-purple-400">
                      {suggestion.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed mb-3">{suggestion.content}</p>
                  <div className="flex gap-1 flex-wrap mb-3">
                    {suggestion.hashtags.map(h => (
                      <span key={h} className="text-[11px] text-purple-400">{h}</span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/10"
                      onClick={() => generateMutation.mutate()}
                      disabled={generateMutation.isPending}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Regenerate
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 text-xs bg-purple-600 hover:bg-purple-700"
                      onClick={applySuggestion}
                    >
                      Use This
                    </Button>
                  </div>
                </div>
              )}

              <div className="rounded-lg bg-secondary/50 border border-border p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Community Hashtags</p>
                <div className="space-y-1">
                  {COMMUNITY_HASHTAGS.map(tag => (
                    <div key={tag} className="flex items-center justify-between">
                      <span className="text-xs text-primary">{tag}</span>
                      <span className="text-[11px] text-muted-foreground">+{Math.floor(Math.random() * 500 + 100)} posts/day</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Clock2({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
