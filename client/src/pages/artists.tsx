import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  UserCheck, Search, CheckCircle, XCircle, Twitter,
  Music2, Wallet, ExternalLink, Shield, Zap
} from "lucide-react";
import type { Artist } from "@shared/schema";

type WalletResult = {
  found: boolean;
  artist?: Artist;
  verified?: boolean;
  chain?: string;
  address?: string;
  mockData?: {
    nftCount: number;
    hasOnchainActivity: boolean;
    lastActivity: string;
  };
};

function ArtistCard({ artist, onVerify, loading }: {
  artist: Artist;
  onVerify: (id: string) => void;
  loading: boolean;
}) {
  const links = artist.streamingLinks as Record<string, string> | null;

  return (
    <Card className="border-border bg-card card-hover">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
            {artist.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-semibold text-sm text-foreground">{artist.name}</span>
              {artist.verified ? (
                <Badge className="text-[10px] px-1.5 py-0 bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                  <CheckCircle className="w-2.5 h-2.5 mr-1" />Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground border-border">
                  Unverified
                </Badge>
              )}
              <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${artist.chain === "svm" ? "bg-purple-500/15 text-purple-400" : "bg-blue-500/15 text-blue-400"}`}>
                {artist.chain === "svm" ? "Solana" : "EVM"}
              </Badge>
            </div>

            {artist.genre && (
              <p className="text-xs text-primary/80 mb-1">{artist.genre}</p>
            )}
            {artist.bio && (
              <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-2">{artist.bio}</p>
            )}

            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {artist.twitterHandle && (
                <div className="flex items-center gap-1">
                  <Twitter className="w-3 h-3 text-sky-400" />
                  <span className="text-xs text-sky-400">{artist.twitterHandle}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Music2 className="w-3 h-3 text-primary" />
                <span className="text-xs text-muted-foreground">{artist.nftCount} NFTs</span>
              </div>
            </div>

            {artist.walletAddress && (
              <div className="flex items-center gap-1.5 mb-3 p-2 rounded-md bg-secondary/60 border border-border">
                <Wallet className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="text-[11px] font-mono text-muted-foreground truncate">
                  {artist.walletAddress.slice(0, 8)}...{artist.walletAddress.slice(-6)}
                </span>
              </div>
            )}

            {links && Object.keys(links).length > 0 && (
              <div className="flex gap-2 mb-3">
                {Object.entries(links).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] px-2 py-1 rounded bg-secondary text-muted-foreground hover:text-foreground transition-colors capitalize flex items-center gap-1"
                  >
                    {platform}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ))}
              </div>
            )}

            {!artist.verified && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                onClick={() => onVerify(artist.id)}
                disabled={loading}
              >
                <Shield className="w-3 h-3 mr-1" />
                Verify Artist
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Artists() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [walletInput, setWalletInput] = useState("");
  const [walletResult, setWalletResult] = useState<WalletResult | null>(null);

  const { data: artists, isLoading } = useQuery<Artist[]>({ queryKey: ["/api/artists"] });

  const verifyMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("PATCH", `/api/artists/${id}`, { verified: true }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artists"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Artist verified!", description: "On-chain verification complete." });
    },
  });

  const walletMutation = useMutation({
    mutationFn: async (address: string) => {
      const res = await fetch(`/api/verify-wallet?address=${encodeURIComponent(address)}`);
      return res.json() as Promise<WalletResult>;
    },
    onSuccess: (data) => setWalletResult(data),
    onError: () => toast({ title: "Error", description: "Wallet lookup failed.", variant: "destructive" }),
  });

  const addArtistMutation = useMutation({
    mutationFn: (artist: { name: string; walletAddress: string; chain: string; verified: boolean; nftCount: number }) =>
      apiRequest("POST", "/api/artists", artist).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artists"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Artist added!", description: "Artist added to the community registry." });
      setWalletResult(null);
      setWalletInput("");
    },
  });

  const filtered = artists?.filter(a =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.twitterHandle?.toLowerCase().includes(search.toLowerCase()) ||
    a.genre?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const isEvm = walletInput.startsWith("0x");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <UserCheck className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold gradient-text" style={{ fontFamily: "var(--font-display)" }}>
            Artist Verification
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">Validate music artists via EVM (Ethereum/Polygon) and SVM (Solana) blockchain data</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Wallet lookup */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                Wallet Lookup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enter an EVM wallet address (0x...) or Solana wallet address to check on-chain music NFT activity.
              </p>
              <Input
                placeholder="0x... or Solana address"
                value={walletInput}
                onChange={(e) => {
                  setWalletInput(e.target.value);
                  setWalletResult(null);
                }}
                className="bg-secondary/50 border-border text-sm font-mono"
              />
              <div className="flex gap-2 text-[11px] text-muted-foreground">
                <span className={`px-2 py-0.5 rounded ${isEvm ? "bg-blue-500/15 text-blue-400" : "text-muted-foreground"}`}>
                  {isEvm ? "EVM Detected" : "EVM: 0x..."}
                </span>
                <span className={`px-2 py-0.5 rounded ${!isEvm && walletInput ? "bg-purple-500/15 text-purple-400" : "text-muted-foreground"}`}>
                  {!isEvm && walletInput ? "SVM Detected" : "SVM: Base58"}
                </span>
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/90 neon-glow-purple"
                onClick={() => walletMutation.mutate(walletInput)}
                disabled={!walletInput.trim() || walletMutation.isPending}
              >
                {walletMutation.isPending ? (
                  <Search className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Lookup Wallet
              </Button>

              {walletResult && (
                <div className={`rounded-lg p-3 border ${walletResult.found ? "bg-emerald-500/10 border-emerald-500/20" : "bg-secondary/50 border-border"}`}>
                  {walletResult.found && walletResult.artist ? (
                    <>
                      <div className="flex items-center gap-1.5 mb-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-medium text-emerald-400">Artist Found in Registry</span>
                      </div>
                      <p className="text-sm font-semibold">{walletResult.artist.name}</p>
                      <p className="text-xs text-muted-foreground">{walletResult.artist.genre}</p>
                      <p className="text-xs text-primary mt-1">{walletResult.artist.nftCount} NFTs on-chain</p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-medium text-amber-400">On-chain Data Found</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">Chain: <span className="text-foreground capitalize">{walletResult.chain}</span></p>
                      <p className="text-xs text-muted-foreground mb-1">NFTs: <span className="text-foreground">{walletResult.mockData?.nftCount}</span></p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Activity: <span className="text-foreground">{walletResult.mockData?.hasOnchainActivity ? "Active" : "Inactive"}</span>
                      </p>
                      {(walletResult.mockData?.nftCount ?? 0) > 0 && (
                        <Button
                          size="sm"
                          className="w-full text-xs bg-emerald-600 hover:bg-emerald-700"
                          onClick={() =>
                            addArtistMutation.mutate({
                              name: `Artist ${walletInput.slice(0, 6)}`,
                              walletAddress: walletInput,
                              chain: isEvm ? "evm" : "svm",
                              verified: true,
                              nftCount: walletResult.mockData?.nftCount ?? 0,
                            })
                          }
                          disabled={addArtistMutation.isPending}
                        >
                          <UserCheck className="w-3 h-3 mr-1" />
                          Add & Verify Artist
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Supported Chains</p>
              <div className="space-y-2">
                {[
                  { name: "Ethereum", tag: "EVM", color: "text-blue-400 bg-blue-500/10" },
                  { name: "Polygon", tag: "EVM", color: "text-purple-400 bg-purple-500/10" },
                  { name: "Base", tag: "EVM", color: "text-cyan-400 bg-cyan-500/10" },
                  { name: "Solana", tag: "SVM", color: "text-green-400 bg-green-500/10" },
                ].map(({ name, tag, color }) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="text-xs text-foreground">{name}</span>
                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${color}`}>{tag}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Artist list */}
        <div className="lg:col-span-2">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search artists..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-secondary/50 border-border"
              />
            </div>
            <Badge variant="secondary" className="px-3 flex items-center gap-1.5 text-xs">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              {artists?.filter(a => a.verified).length || 0} verified
            </Badge>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)
            ) : filtered.length > 0 ? (
              filtered.map(artist => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  onVerify={(id) => verifyMutation.mutate(id)}
                  loading={verifyMutation.isPending}
                />
              ))
            ) : (
              <Card className="border-border bg-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <UserCheck className="w-10 h-10 text-muted-foreground mb-3 opacity-40" />
                  <p className="text-muted-foreground text-sm">No artists found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
