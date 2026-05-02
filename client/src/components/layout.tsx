import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard, PenSquare, UserCheck, Music2, Clock, Users,
  Zap, Twitter, Menu, X
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/composer", label: "Post Composer", icon: PenSquare },
  { path: "/queue", label: "Content Queue", icon: Clock, badgeKey: "pendingPosts" },
  { path: "/artists", label: "Artist Verify", icon: UserCheck },
  { path: "/nfts", label: "NFT Discovery", icon: Music2 },
  { path: "/community", label: "Community", icon: Users, badgeKey: "pendingEngagements" },
];

type Stats = {
  totalPosts: number;
  pendingPosts: number;
  verifiedArtists: number;
  totalNfts: number;
  communityMentions: number;
  pendingEngagements: number;
};

function Sidebar({ onClose }: { onClose?: () => void }) {
  const [location] = useLocation();
  const { data: stats } = useQuery<Stats>({ queryKey: ["/api/stats"] });

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center neon-glow-purple">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span className="text-lg font-bold gradient-text" style={{ fontFamily: "var(--font-display)" }}>
                AIgentic
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <Twitter className="w-3 h-3 text-sky-400" />
              <span className="text-xs text-muted-foreground">@0xM0B</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot ml-1" />
              <span className="text-xs text-emerald-400">Live</span>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ path, label, icon: Icon, badgeKey }) => {
          const isActive = location === path;
          const badgeCount = badgeKey && stats ? stats[badgeKey as keyof Stats] : 0;
          return (
            <Link key={path} href={path} onClick={onClose}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 group",
                isActive
                  ? "bg-primary/15 text-primary neon-glow-purple border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}>
                <Icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-primary")} />
                <span className="text-sm font-medium flex-1">{label}</span>
                {badgeCount > 0 && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs px-1.5 py-0",
                      isActive ? "bg-primary/20 text-primary border-primary/30" : "bg-amber-500/20 text-amber-400"
                    )}
                  >
                    {badgeCount}
                  </Badge>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-border">
        <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
          <p className="text-xs text-primary font-medium mb-1">Music NFT Community</p>
          <p className="text-xs text-muted-foreground">Powered by AI · EVM + SVM</p>
        </div>
      </div>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-col border-r border-border bg-sidebar flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 flex flex-col border-r border-border bg-sidebar z-10">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-sidebar">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-bold gradient-text" style={{ fontFamily: "var(--font-display)" }}>AIgentic</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
