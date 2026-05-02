import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Music2, Search, ExternalLink, CheckCircle, Filter } from "lucide-react";
import type { Nft } from "@shared/schema";

const CHAIN_OPTIONS = [
  { value: "all", label: "All Chains" },
  { value: "ethereum", label: "Ethereum" },
  { value: "solana", label: "Solana" },
  { value: "polygon", label: "Polygon" },
  { value: "base", label: "Base" },
];

const GENRE_OPTIONS = [
  { value: "all", label: "All Genres" },
  { value: "Lo-fi Hip Hop", label: "Lo-fi Hip Hop" },
  { value: "Electronic / Ambient", label: "Electronic / Ambient" },
  { value: "Bass / Techno", label: "Bass / Techno" },
  { value: "Jazz / Neo-Soul", label: "Jazz / Neo-Soul" },
  { value: "Synthwave", label: "Synthwave" },
];

const CHAIN_COLORS: Record<string, string> = {
  ethereum: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  solana: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  polygon: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  base: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
};

const MARKETPLACE_COLORS: Record<string, string> = {
  OpenSea: "bg-blue-500/10 text-blue-300",
  "Magic Eden": "bg-purple-500/10 text-purple-300",
  Foundation: "bg-emerald-500/10 text-emerald-300",
  Rarible: "bg-yellow-500/10 text-yellow-300",
};

function NftCard({ nft }: { nft: Nft }) {
  const meta = nft.metadata as Record<string, unknown> | null;
  const links = nft.streamingLinks as Record<string, string> | null;
  const chainColor = CHAIN_COLORS[nft.chain] || "bg-secondary text-muted-foreground";
  const marketColor = nft.marketplace ? MARKETPLACE_COLORS[nft.marketplace] || "bg-secondary text-muted-foreground" : "";

  return (
    <Card className="border-border bg-card card-hover overflow-hidden">
      <div className="relative">
        <img
          src={nft.imageUrl || `https://picsum.photos/seed/${nft.id}/400/200`}
          alt={nft.name}
          className="w-full h-40 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${chainColor}`}>
            {nft.chain}
          </Badge>
          {nft.marketplace && (
            <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${marketColor}`}>
              {nft.marketplace}
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-sm text-foreground leading-tight mb-0.5" style={{ fontFamily: "var(--font-display)" }}>
            {nft.name}
          </h3>
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-primary/80">{nft.artistName}</p>
            {nft.artistId && <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />}
          </div>
        </div>

        {nft.genre && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mb-2 bg-primary/10 text-primary/80">
            {nft.genre}
          </Badge>
        )}

        {nft.description && (
          <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
            {nft.description}
          </p>
        )}

        {meta && Object.keys(meta).length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {Object.entries(meta).slice(0, 3).map(([k, v]) => (
              <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                {k}: {String(v)}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            {nft.price ? (
              <span className="text-sm font-bold text-foreground">{nft.price} <span className="text-xs text-muted-foreground">{nft.currency}</span></span>
            ) : (
              <span className="text-xs text-muted-foreground">Price N/A</span>
            )}
          </div>
          <div className="flex gap-1.5">
            {links && Object.entries(links).slice(0, 2).map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] px-2 py-1 rounded bg-secondary text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 capitalize"
              >
                {platform}
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            ))}
          </div>
        </div>

        {nft.contractAddress && (
          <div className="mt-2 pt-2 border-t border-border">
            <p className="text-[10px] font-mono text-muted-foreground truncate">
              {nft.contractAddress.slice(0, 12)}...{nft.contractAddress.slice(-6)}
              {nft.tokenId && ` #${nft.tokenId}`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Nfts() {
  const [search, setSearch] = useState("");
  const [chain, setChain] = useState("all");
  const [genre, setGenre] = useState("all");

  const queryParams = new URLSearchParams();
  if (search) queryParams.set("search", search);
  if (chain !== "all") queryParams.set("chain", chain);
  if (genre !== "all") queryParams.set("genre", genre);

  const { data: nfts, isLoading } = useQuery<Nft[]>({
    queryKey: ["/api/nfts", chain, genre, search],
    queryFn: () => fetch(`/api/nfts?${queryParams.toString()}`).then(r => r.json()),
  });

  const clearFilters = () => {
    setSearch("");
    setChain("all");
    setGenre("all");
  };

  const hasFilters = search || chain !== "all" || genre !== "all";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Music2 className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold gradient-text" style={{ fontFamily: "var(--font-display)" }}>
            NFT Discovery
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">Search and explore music NFTs across EVM and SVM blockchains</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search NFTs, artists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary/50 border-border"
          />
        </div>
        <Select value={chain} onValueChange={setChain}>
          <SelectTrigger className="w-40 bg-secondary/50 border-border text-sm">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CHAIN_OPTIONS.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={genre} onValueChange={setGenre}>
          <SelectTrigger className="w-44 bg-secondary/50 border-border text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GENRE_OPTIONS.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground">
            Clear filters
          </Button>
        )}
        <Badge variant="secondary" className="px-3 text-xs ml-auto">
          {nfts?.length || 0} results
        </Badge>
      </div>

      {/* NFT Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)
        ) : nfts && nfts.length > 0 ? (
          nfts.map(nft => <NftCard key={nft.id} nft={nft} />)
        ) : (
          <div className="col-span-3 flex flex-col items-center justify-center py-16">
            <Music2 className="w-12 h-12 text-muted-foreground mb-4 opacity-40" />
            <p className="text-muted-foreground text-sm">No NFTs found</p>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-2 text-xs text-primary">
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Info panel */}
      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        {[
          { label: "Marketplaces Indexed", value: "OpenSea, Magic Eden, Foundation, Rarible", icon: "🏪" },
          { label: "Streaming Integrations", value: "Spotify, Apple Music, SoundCloud", icon: "🎵" },
          { label: "Metadata Source", value: "Pulsr.io compatible metadata indexing", icon: "🔍" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="rounded-xl bg-card border border-border p-4">
            <span className="text-2xl mb-2 block">{icon}</span>
            <p className="text-xs font-medium text-foreground mb-1">{label}</p>
            <p className="text-xs text-muted-foreground">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
