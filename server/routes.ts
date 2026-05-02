import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostSchema, insertArtistSchema, insertNftSchema, insertCommunityMentionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats
  app.get("/api/stats", async (_req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // Posts
  app.get("/api/posts", async (req, res) => {
    const status = req.query.status as string | undefined;
    const posts = await storage.getPosts(status);
    res.json(posts);
  });

  app.get("/api/posts/:id", async (req, res) => {
    const post = await storage.getPost(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  });

  app.post("/api/posts", async (req, res) => {
    const result = insertPostSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: result.error.message });
    const post = await storage.createPost(result.data);
    res.status(201).json(post);
  });

  app.patch("/api/posts/:id", async (req, res) => {
    const post = await storage.updatePost(req.params.id, req.body);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  });

  app.delete("/api/posts/:id", async (req, res) => {
    const deleted = await storage.deletePost(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Post not found" });
    res.json({ success: true });
  });

  // Artists
  app.get("/api/artists", async (_req, res) => {
    const artists = await storage.getArtists();
    res.json(artists);
  });

  app.get("/api/artists/:id", async (req, res) => {
    const artist = await storage.getArtist(req.params.id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });
    res.json(artist);
  });

  app.post("/api/artists", async (req, res) => {
    const result = insertArtistSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: result.error.message });
    const artist = await storage.createArtist(result.data);
    res.status(201).json(artist);
  });

  app.patch("/api/artists/:id", async (req, res) => {
    const artist = await storage.updateArtist(req.params.id, req.body);
    if (!artist) return res.status(404).json({ message: "Artist not found" });
    res.json(artist);
  });

  // Wallet lookup (mock blockchain verification)
  app.get("/api/verify-wallet", async (req, res) => {
    const address = req.query.address as string;
    if (!address) return res.status(400).json({ message: "Wallet address required" });

    const artist = await storage.getArtistByWallet(address);
    if (artist) {
      return res.json({ found: true, artist, verified: artist.verified });
    }

    // Mock blockchain data for unknown wallets
    const isEvm = address.startsWith("0x");
    const chain = isEvm ? "ethereum" : "solana";
    const mockNftCount = Math.floor(Math.random() * 20);

    res.json({
      found: false,
      chain,
      address,
      mockData: {
        nftCount: mockNftCount,
        hasOnchainActivity: mockNftCount > 0,
        lastActivity: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
      }
    });
  });

  // NFTs
  app.get("/api/nfts", async (req, res) => {
    const filters = {
      chain: req.query.chain as string | undefined,
      genre: req.query.genre as string | undefined,
      search: req.query.search as string | undefined,
    };
    const nfts = await storage.getNfts(filters);
    res.json(nfts);
  });

  app.get("/api/nfts/:id", async (req, res) => {
    const nft = await storage.getNft(req.params.id);
    if (!nft) return res.status(404).json({ message: "NFT not found" });
    res.json(nft);
  });

  app.post("/api/nfts", async (req, res) => {
    const result = insertNftSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: result.error.message });
    const nft = await storage.createNft(result.data);
    res.status(201).json(nft);
  });

  // Community mentions
  app.get("/api/community", async (req, res) => {
    const status = req.query.status as string | undefined;
    const mentions = await storage.getCommunityMentions(status);
    res.json(mentions);
  });

  app.get("/api/community/:id", async (req, res) => {
    const mention = await storage.getCommunityMention(req.params.id);
    if (!mention) return res.status(404).json({ message: "Mention not found" });
    res.json(mention);
  });

  app.post("/api/community", async (req, res) => {
    const result = insertCommunityMentionSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: result.error.message });
    const mention = await storage.createCommunityMention(result.data);
    res.status(201).json(mention);
  });

  app.patch("/api/community/:id", async (req, res) => {
    const mention = await storage.updateCommunityMention(req.params.id, req.body);
    if (!mention) return res.status(404).json({ message: "Mention not found" });
    res.json(mention);
  });

  // AI content generation (mock)
  app.post("/api/ai/generate", async (req, res) => {
    const { type, context } = req.body as { type: string; context?: string };

    const suggestions: Record<string, string[]> = {
      spotlight: [
        `🎵 Artist spotlight: ${context || "a talented music NFT creator"} is dropping heat on the blockchain. Real music, real ownership, real community. #MusicNFT #Web3Music @0xM0B`,
        `🔥 Did you know? Some of the best music being made right now is being minted as NFTs. ${context || "Support independent artists"} directly — no labels, no middlemen. #MusicNFT`,
        `🎶 The future of music is on-chain. ${context || "Independent artists"} are minting their work and connecting directly with fans. Join the movement. #Web3Music #MusicNFT @0xM0B`,
      ],
      engagement: [
        `💬 Drop your #MusicNFT below and let the @0xM0B community discover your work! Every play, every mint, every listen counts. 🎵 #Web3Music`,
        `🎧 What's the best music NFT you've collected this month? Share it below! The @0xM0B community wants to know. 👇 #MusicNFT #Web3`,
        `🌐 The @0xM0B community is growing fast. If you're a music artist minting NFTs, introduce yourself! We're here to amplify your work. #MusicNFT #Web3Music`,
      ],
      announcement: [
        `📣 Big things are happening in the music NFT space. Stay connected with @0xM0B for the latest drops, artist spotlights, and community news. 🎵 #MusicNFT #Web3Music`,
        `🚀 Music NFTs are just getting started. The artists building now will define the next era of music distribution. @0xM0B is tracking the best ones. #MusicNFT`,
        `🎼 From lo-fi to jazz, from EDM to hip-hop — music NFTs span every genre. @0xM0B celebrates all of it. What's your genre? #MusicNFT #Web3Music`,
      ],
      nft: [
        `🎵 New music NFT alert! ${context || "Check this out"} — minted on-chain, built to last. Support the artist directly. #MusicNFT #Web3Music @0xM0B`,
        `🔊 When you collect a music NFT, you're not just buying art — you're investing in an artist's career. ${context || "This is the future"} of music. #MusicNFT`,
        `🌊 The blockchain doesn't sleep and neither does the music. ${context || "New drops"} hitting the market. Who's collecting? #MusicNFT #Web3`,
      ],
    };

    const typeKey = type in suggestions ? type : "engagement";
    const options = suggestions[typeKey];
    const chosen = options[Math.floor(Math.random() * options.length)];
    const hashtags = (chosen.match(/#\w+/g) || []);

    res.json({
      content: chosen,
      hashtags,
      type: typeKey,
    });
  });

  // Mock Twitter/X posting
  app.post("/api/post-to-twitter", async (req, res) => {
    const { postId } = req.body as { postId: string };
    if (!postId) return res.status(400).json({ message: "Post ID required" });

    const post = await storage.getPost(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Simulate posting delay and update status
    const updatedPost = await storage.updatePost(postId, {
      status: "posted",
      postedAt: new Date(),
      engagementData: { likes: 0, retweets: 0, replies: 0 },
    });

    res.json({ success: true, post: updatedPost, tweetUrl: `https://twitter.com/0xM0B/status/mock_${Date.now()}` });
  });

  // Scan hashtag (mock discovery)
  app.post("/api/scan-hashtag", async (req, res) => {
    const { hashtag } = req.body as { hashtag: string };
    if (!hashtag) return res.status(400).json({ message: "Hashtag required" });

    const mockResults = [
      { handle: "@newartist_nft", name: "New Artist", content: `Minted my first track as an NFT! ${hashtag} 🎵`, action: "reply" },
      { handle: "@collector_web3", name: "Web3 Collector", content: `Just collected a music NFT. ${hashtag} is the future!`, action: "like" },
      { handle: "@producer_chain", name: "OnChain Producer", content: `New EP dropping as music NFTs next week. ${hashtag} #Web3Music`, action: "retweet" },
    ];

    // Add to community mentions
    for (const result of mockResults) {
      const existing = await storage.getCommunityMentions();
      const alreadyExists = existing.find(m => m.twitterHandle === result.handle);
      if (!alreadyExists) {
        await storage.createCommunityMention({
          twitterHandle: result.handle,
          displayName: result.name,
          tweetId: `mock_${Date.now()}_${Math.random()}`,
          tweetContent: result.content,
          hashtags: [hashtag],
          engagementAction: result.action,
          actionStatus: "pending",
          aiReplyDraft: `Great to see you using ${hashtag}! The @0xM0B community is here to amplify your music NFT journey. 🎵 #Web3Music`,
        });
      }
    }

    const updated = await storage.getCommunityMentions();
    res.json({ scanned: mockResults.length, total: updated.length });
  });

  const httpServer = createServer(app);
  return httpServer;
}
