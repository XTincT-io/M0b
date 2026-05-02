# AIgentic — Music NFT Community Dashboard

## Overview
AIgentic is a music NFT community management dashboard for the **@0xM0B** Twitter/X account. It provides AI-assisted content creation, blockchain artist verification, NFT discovery, community hashtag monitoring, and a manual approval workflow for posts.

## Architecture

### Stack
- **Frontend**: React + TypeScript + Tailwind CSS + Shadcn UI + Wouter routing + TanStack Query
- **Backend**: Express.js (Node.js)
- **Storage**: In-memory (MemStorage) — seeded with sample data on startup
- **Build**: Vite (frontend) + esbuild (backend)

### Key Files
```
shared/schema.ts         — Drizzle/Zod data models for all entities
server/storage.ts        — MemStorage class with CRUD + seed data
server/routes.ts         — All API routes (/api/*)
server/index.ts          — Express server entry point
client/src/App.tsx       — Router wiring all pages
client/src/index.css     — Dark music/crypto theme (purple neon aesthetic)
client/src/components/layout.tsx   — Sidebar navigation
client/src/pages/
  dashboard.tsx          — Stats overview + recent posts/mentions
  composer.tsx           — Post composer with AI content generation
  queue.tsx              — Content approval queue (pending/approved/posted/rejected)
  artists.tsx            — Artist verification via EVM/SVM wallet lookup
  nfts.tsx               — Music NFT discovery with filters
  community.tsx          — Community hashtag scanner & engagement manager
```

### Data Models (shared/schema.ts)
- **users** — Basic user accounts
- **posts** — Twitter/X posts with status (pending/approved/posted/rejected), AI flag, hashtags
- **artists** — Music artists with wallet address, chain (evm/svm), verification status, streaming links
- **nfts** — Music NFTs with chain, genre, marketplace, metadata, streaming links
- **communityMentions** — Hashtag mentions with AI reply drafts and engagement actions
- **contentSuggestions** — AI-generated content suggestions

## API Routes
- `GET /api/stats` — Dashboard statistics
- `GET/POST /api/posts` — Post CRUD
- `PATCH /api/posts/:id` — Update post status
- `DELETE /api/posts/:id` — Remove post
- `GET/POST /api/artists` — Artist registry
- `PATCH /api/artists/:id` — Update/verify artist
- `GET /api/verify-wallet?address=` — Blockchain wallet lookup (EVM/SVM)
- `GET/POST /api/nfts` — NFT discovery with filters (chain, genre, search)
- `GET/POST/PATCH /api/community` — Community mention management
- `POST /api/ai/generate` — AI content generation (type: spotlight/engagement/nft/announcement)
- `POST /api/post-to-twitter` — Mock post to Twitter/X
- `POST /api/scan-hashtag` — Scan for new community hashtag mentions

## Design System
- **Theme**: Dark mode only with music/crypto neon aesthetic
- **Primary color**: Purple (hsl 262°)
- **Accent colors**: Cyan, pink, gold neon tones
- **Fonts**: Inter (body) + Space Grotesk (headings/display)
- **Custom utilities**: .neon-glow-purple, .neon-glow-cyan, .gradient-text, .card-hover, .pulse-dot

## Features
1. **Dashboard** — Live stats (posts, verified artists, NFTs, community), recent posts + mentions feed
2. **Post Composer** — AI content suggestions by type (spotlight/engagement/nft/announcement), quick hashtag insertion, 280-char limit, save to queue or approve
3. **Content Queue** — Tabbed view (pending/approved/posted/rejected), approve/reject/post-to-X/delete actions
4. **Artist Verification** — EVM (0x...) and SVM (Solana Base58) wallet lookup, on-chain NFT activity display, artist registry with verified badges, streaming platform links
5. **NFT Discovery** — Search and filter music NFTs by chain/genre/keyword, marketplace badges, metadata display
6. **Community Monitor** — Hashtag scanner, AI-drafted replies, approve/skip engagement actions

## Running
- Dev: `npm run dev` (workflow "Start application" on port 5000)
- Build: `npm run build`
- Start: `npm run start`
