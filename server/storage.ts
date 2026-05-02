import { randomUUID } from "crypto";
import type {
  User, InsertUser,
  Post, InsertPost,
  Artist, InsertArtist,
  Nft, InsertNft,
  CommunityMention, InsertCommunityMention,
  ContentSuggestion, InsertContentSuggestion,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getPosts(status?: string): Promise<Post[]>;
  getPost(id: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: string): Promise<boolean>;

  getArtists(): Promise<Artist[]>;
  getArtist(id: string): Promise<Artist | undefined>;
  getArtistByWallet(walletAddress: string): Promise<Artist | undefined>;
  createArtist(artist: InsertArtist): Promise<Artist>;
  updateArtist(id: string, updates: Partial<Artist>): Promise<Artist | undefined>;

  getNfts(filters?: { chain?: string; genre?: string; search?: string }): Promise<Nft[]>;
  getNft(id: string): Promise<Nft | undefined>;
  createNft(nft: InsertNft): Promise<Nft>;

  getCommunityMentions(status?: string): Promise<CommunityMention[]>;
  getCommunityMention(id: string): Promise<CommunityMention | undefined>;
  createCommunityMention(mention: InsertCommunityMention): Promise<CommunityMention>;
  updateCommunityMention(id: string, updates: Partial<CommunityMention>): Promise<CommunityMention | undefined>;

  getContentSuggestions(): Promise<ContentSuggestion[]>;
  createContentSuggestion(suggestion: InsertContentSuggestion): Promise<ContentSuggestion>;
  updateContentSuggestion(id: string, updates: Partial<ContentSuggestion>): Promise<ContentSuggestion | undefined>;

  getDashboardStats(): Promise<{
    totalPosts: number;
    pendingPosts: number;
    verifiedArtists: number;
    totalNfts: number;
    communityMentions: number;
    pendingEngagements: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private posts: Map<string, Post> = new Map();
  private artists: Map<string, Artist> = new Map();
  private nfts: Map<string, Nft> = new Map();
  private communityMentions: Map<string, CommunityMention> = new Map();
  private contentSuggestions: Map<string, ContentSuggestion> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    const now = new Date();

    const artists: Artist[] = [
      {
        id: randomUUID(), name: "Ravi Khalil", twitterHandle: "@ravikhalil_nft",
        walletAddress: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12", chain: "evm",
        verified: true, nftCount: 12, genre: "Lo-fi Hip Hop",
        bio: "Beatmaker crafting soulful lo-fi journeys on the blockchain.",
        streamingLinks: { spotify: "https://spotify.com", soundcloud: "https://soundcloud.com" },
        createdAt: now,
      },
      {
        id: randomUUID(), name: "Luna Waves", twitterHandle: "@lunawaves_sol",
        walletAddress: "9xQjZK2mN4pY8rTwVuAbCdEfGhIjKlMnOpQrStUvWx", chain: "svm",
        verified: true, nftCount: 8, genre: "Electronic / Ambient",
        bio: "Solana-native artist blending ambient soundscapes with generative visuals.",
        streamingLinks: { spotify: "https://spotify.com", apple: "https://music.apple.com" },
        createdAt: now,
      },
      {
        id: randomUUID(), name: "DeepBass Collective", twitterHandle: "@deepbass_nft",
        walletAddress: "0xDeAdBeEf1234567890AbCdEf1234567890AbCdEf", chain: "evm",
        verified: false, nftCount: 3, genre: "Bass / Techno",
        bio: "Underground collective pushing boundaries of bass music as NFTs.",
        streamingLinks: { soundcloud: "https://soundcloud.com" },
        createdAt: now,
      },
      {
        id: randomUUID(), name: "Zephyr Sounds", twitterHandle: "@zephyrsounds",
        walletAddress: "3kJhPqRsTuVwXyZaAbBcCdDeFfGgHhIiJjKkLlMmNn", chain: "svm",
        verified: true, nftCount: 21, genre: "Jazz / Neo-Soul",
        bio: "Jazz-rooted neo-soul producer releasing limited edition NFT albums.",
        streamingLinks: { spotify: "https://spotify.com" },
        createdAt: now,
      },
    ];
    artists.forEach(a => this.artists.set(a.id, a));

    const nfts: Nft[] = [
      {
        id: randomUUID(), name: "Midnight Frequencies #001", artistId: artists[0].id,
        artistName: "Ravi Khalil", contractAddress: "0xABCDEF1234567890", tokenId: "1",
        chain: "ethereum", genre: "Lo-fi Hip Hop",
        description: "A lo-fi journey through midnight city lights. 3 minutes of pure vibes.",
        imageUrl: "https://picsum.photos/seed/nft1/400/400",
        audioUrl: null, price: "0.08", currency: "ETH", marketplace: "OpenSea",
        streamingLinks: { spotify: "https://spotify.com" },
        metadata: { bpm: 85, key: "Cm", duration: "3:12" }, createdAt: now,
      },
      {
        id: randomUUID(), name: "Solaris Dreams EP", artistId: artists[1].id,
        artistName: "Luna Waves", contractAddress: "9xSOLcontract567", tokenId: "42",
        chain: "solana", genre: "Electronic / Ambient",
        description: "A 5-track ambient EP minted on Solana. Generative visuals included.",
        imageUrl: "https://picsum.photos/seed/nft2/400/400",
        audioUrl: null, price: "2.5", currency: "SOL", marketplace: "Magic Eden",
        streamingLinks: { apple: "https://music.apple.com" },
        metadata: { tracks: 5, duration: "22:45" }, createdAt: now,
      },
      {
        id: randomUUID(), name: "Bass Drop Genesis", artistId: artists[2].id,
        artistName: "DeepBass Collective", contractAddress: "0xBASS12345678901", tokenId: "7",
        chain: "polygon", genre: "Bass / Techno",
        description: "Raw underground bass music. First release from the DeepBass Collective.",
        imageUrl: "https://picsum.photos/seed/nft3/400/400",
        audioUrl: null, price: "15", currency: "MATIC", marketplace: "Rarible",
        streamingLinks: null,
        metadata: { bpm: 140, format: "WAV 24bit" }, createdAt: now,
      },
      {
        id: randomUUID(), name: "Jazz on Chain Vol. 2", artistId: artists[3].id,
        artistName: "Zephyr Sounds", contractAddress: "3kJAZZcontract890", tokenId: "202",
        chain: "solana", genre: "Jazz / Neo-Soul",
        description: "Volume 2 of the Jazz on Chain series. 10 tracks, fully on-chain.",
        imageUrl: "https://picsum.photos/seed/nft4/400/400",
        audioUrl: null, price: "3.8", currency: "SOL", marketplace: "Magic Eden",
        streamingLinks: { spotify: "https://spotify.com" },
        metadata: { tracks: 10, label: "Zephyr Records" }, createdAt: now,
      },
      {
        id: randomUUID(), name: "Neon Pulse #88", artistId: null,
        artistName: "CryptoBeats", contractAddress: "0xNEON8888888888", tokenId: "88",
        chain: "ethereum", genre: "Synthwave",
        description: "Synthwave track minted as 1/1 on Ethereum mainnet.",
        imageUrl: "https://picsum.photos/seed/nft5/400/400",
        audioUrl: null, price: "0.15", currency: "ETH", marketplace: "Foundation",
        streamingLinks: null,
        metadata: { bpm: 118, mood: "euphoric" }, createdAt: now,
      },
    ];
    nfts.forEach(n => this.nfts.set(n.id, n));

    const posts: Post[] = [
      {
        id: randomUUID(),
        content: "🎵 Spotlight on @ravikhalil_nft — his lo-fi NFT collection is a vibe. 12 tracks minted on ETH. Support real music artists on the blockchain! #MusicNFT #LoFi #Web3Music",
        platform: "twitter", status: "pending", aiGenerated: true,
        hashtags: ["#MusicNFT", "#LoFi", "#Web3Music"], mediaUrl: null,
        scheduledAt: null, postedAt: null, createdAt: now,
        engagementData: null,
      },
      {
        id: randomUUID(),
        content: "🌊 Solana is home to some incredible music NFTs. @lunawaves_sol just dropped a full ambient EP on Magic Eden — 5 tracks, generative visuals included. This is the future of music distribution. #SolanaNFT #MusicNFT #Ambient",
        platform: "twitter", status: "approved", aiGenerated: true,
        hashtags: ["#SolanaNFT", "#MusicNFT", "#Ambient"], mediaUrl: null,
        scheduledAt: null, postedAt: new Date(Date.now() - 86400000), createdAt: new Date(Date.now() - 90000000),
        engagementData: { likes: 47, retweets: 12, replies: 8 },
      },
      {
        id: randomUUID(),
        content: "🔊 If you're using #MusicNFT in your bio, we see you. The @0xM0B community is growing — artists, collectors, and supporters all in one place. Drop your NFT link below! 👇 #Web3Music #NFTCommunity",
        platform: "twitter", status: "posted", aiGenerated: false,
        hashtags: ["#MusicNFT", "#Web3Music", "#NFTCommunity"], mediaUrl: null,
        scheduledAt: null, postedAt: new Date(Date.now() - 172800000), createdAt: new Date(Date.now() - 180000000),
        engagementData: { likes: 134, retweets: 56, replies: 23 },
      },
    ];
    posts.forEach(p => this.posts.set(p.id, p));

    const mentions: CommunityMention[] = [
      {
        id: randomUUID(), twitterHandle: "@beatcraft_eth", displayName: "BeatCraft",
        tweetId: "1234567890", tweetContent: "Just minted my first track as an NFT! 🎵 #MusicNFT #Web3Music cc @0xM0B",
        hashtags: ["#MusicNFT", "#Web3Music"], engagementAction: "reply",
        actionStatus: "pending",
        aiReplyDraft: "🔥 Welcome to the music NFT revolution, @beatcraft_eth! Your first mint is a huge milestone. The @0xM0B community is here for it. Drop the link so we can support! #MusicNFT",
        createdAt: new Date(Date.now() - 3600000),
      },
      {
        id: randomUUID(), twitterHandle: "@solsounds_nft", displayName: "Sol Sounds",
        tweetId: "1234567891", tweetContent: "New drop on Magic Eden! 3-track EP, all music NFTs 🎶 #MusicNFT #SolanaNFT",
        hashtags: ["#MusicNFT", "#SolanaNFT"], engagementAction: "retweet",
        actionStatus: "pending",
        aiReplyDraft: "This is exactly what Web3 music looks like 🎵 @solsounds_nft dropping heat on Magic Eden. Support real artists! #MusicNFT #SolanaNFT",
        createdAt: new Date(Date.now() - 7200000),
      },
      {
        id: randomUUID(), twitterHandle: "@nftmelody", displayName: "NFT Melody",
        tweetId: "1234567892", tweetContent: "Music NFTs are the future of artist royalties. No middlemen. #MusicNFT #Web3",
        hashtags: ["#MusicNFT", "#Web3"], engagementAction: "like",
        actionStatus: "completed",
        aiReplyDraft: null,
        createdAt: new Date(Date.now() - 14400000),
      },
      {
        id: randomUUID(), twitterHandle: "@cryptobeats_co", displayName: "CryptoBeats",
        tweetId: "1234567893", tweetContent: "Anyone else think #MusicNFT is massively underrated right now? Big opportunities ahead.",
        hashtags: ["#MusicNFT"], engagementAction: "reply",
        actionStatus: "pending",
        aiReplyDraft: "100% agree! Music NFTs are still early — the artists building now are setting the foundation for the entire industry. @0xM0B is tracking the best ones. 🎵 #MusicNFT #Web3Music",
        createdAt: new Date(Date.now() - 21600000),
      },
    ];
    mentions.forEach(m => this.communityMentions.set(m.id, m));
  }

  async getUser(id: string) { return this.users.get(id); }
  async getUserByUsername(username: string) {
    return Array.from(this.users.values()).find(u => u.username === username);
  }
  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { ...insertUser, id: randomUUID() };
    this.users.set(user.id, user);
    return user;
  }

  async getPosts(status?: string): Promise<Post[]> {
    const all = Array.from(this.posts.values());
    return status ? all.filter(p => p.status === status) : all;
  }
  async getPost(id: string) { return this.posts.get(id); }
  async createPost(post: InsertPost): Promise<Post> {
    const newPost: Post = {
      id: randomUUID(), createdAt: new Date(),
      content: post.content,
      platform: post.platform ?? "twitter",
      status: post.status ?? "pending",
      aiGenerated: post.aiGenerated ?? false,
      hashtags: post.hashtags ?? [],
      mediaUrl: post.mediaUrl ?? null,
      scheduledAt: post.scheduledAt ?? null,
      postedAt: post.postedAt ?? null,
      engagementData: post.engagementData ?? null,
    };
    this.posts.set(newPost.id, newPost);
    return newPost;
  }
  async updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    const updated = { ...post, ...updates };
    this.posts.set(id, updated);
    return updated;
  }
  async deletePost(id: string): Promise<boolean> {
    return this.posts.delete(id);
  }

  async getArtists(): Promise<Artist[]> {
    return Array.from(this.artists.values());
  }
  async getArtist(id: string) { return this.artists.get(id); }
  async getArtistByWallet(walletAddress: string) {
    return Array.from(this.artists.values()).find(a => a.walletAddress?.toLowerCase() === walletAddress.toLowerCase());
  }
  async createArtist(artist: InsertArtist): Promise<Artist> {
    const newArtist: Artist = {
      id: randomUUID(), createdAt: new Date(),
      name: artist.name,
      twitterHandle: artist.twitterHandle ?? null,
      walletAddress: artist.walletAddress ?? null,
      chain: artist.chain ?? "evm",
      verified: artist.verified ?? false,
      nftCount: artist.nftCount ?? 0,
      genre: artist.genre ?? null,
      bio: artist.bio ?? null,
      streamingLinks: artist.streamingLinks ?? null,
    };
    this.artists.set(newArtist.id, newArtist);
    return newArtist;
  }
  async updateArtist(id: string, updates: Partial<Artist>): Promise<Artist | undefined> {
    const artist = this.artists.get(id);
    if (!artist) return undefined;
    const updated = { ...artist, ...updates };
    this.artists.set(id, updated);
    return updated;
  }

  async getNfts(filters?: { chain?: string; genre?: string; search?: string }): Promise<Nft[]> {
    let all = Array.from(this.nfts.values());
    if (filters?.chain) all = all.filter(n => n.chain === filters.chain);
    if (filters?.genre) all = all.filter(n => n.genre === filters.genre);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      all = all.filter(n => n.name.toLowerCase().includes(q) || n.artistName.toLowerCase().includes(q) || n.description?.toLowerCase().includes(q));
    }
    return all;
  }
  async getNft(id: string) { return this.nfts.get(id); }
  async createNft(nft: InsertNft): Promise<Nft> {
    const newNft: Nft = {
      id: randomUUID(), createdAt: new Date(),
      name: nft.name,
      artistId: nft.artistId ?? null,
      artistName: nft.artistName,
      contractAddress: nft.contractAddress ?? null,
      tokenId: nft.tokenId ?? null,
      chain: nft.chain ?? "ethereum",
      genre: nft.genre ?? null,
      description: nft.description ?? null,
      imageUrl: nft.imageUrl ?? null,
      audioUrl: nft.audioUrl ?? null,
      price: nft.price ?? null,
      currency: nft.currency ?? "ETH",
      marketplace: nft.marketplace ?? null,
      streamingLinks: nft.streamingLinks ?? null,
      metadata: nft.metadata ?? null,
    };
    this.nfts.set(newNft.id, newNft);
    return newNft;
  }

  async getCommunityMentions(status?: string): Promise<CommunityMention[]> {
    const all = Array.from(this.communityMentions.values());
    return status ? all.filter(m => m.actionStatus === status) : all;
  }
  async getCommunityMention(id: string) { return this.communityMentions.get(id); }
  async createCommunityMention(mention: InsertCommunityMention): Promise<CommunityMention> {
    const newMention: CommunityMention = {
      id: randomUUID(), createdAt: new Date(),
      twitterHandle: mention.twitterHandle,
      displayName: mention.displayName ?? null,
      tweetId: mention.tweetId ?? null,
      tweetContent: mention.tweetContent ?? null,
      hashtags: mention.hashtags ?? [],
      engagementAction: mention.engagementAction ?? null,
      actionStatus: mention.actionStatus ?? "pending",
      aiReplyDraft: mention.aiReplyDraft ?? null,
    };
    this.communityMentions.set(newMention.id, newMention);
    return newMention;
  }
  async updateCommunityMention(id: string, updates: Partial<CommunityMention>): Promise<CommunityMention | undefined> {
    const mention = this.communityMentions.get(id);
    if (!mention) return undefined;
    const updated = { ...mention, ...updates };
    this.communityMentions.set(id, updated);
    return updated;
  }

  async getContentSuggestions(): Promise<ContentSuggestion[]> {
    return Array.from(this.contentSuggestions.values());
  }
  async createContentSuggestion(suggestion: InsertContentSuggestion): Promise<ContentSuggestion> {
    const newSugg: ContentSuggestion = {
      id: randomUUID(), createdAt: new Date(),
      type: suggestion.type,
      content: suggestion.content,
      hashtags: suggestion.hashtags ?? [],
      approved: suggestion.approved ?? null,
    };
    this.contentSuggestions.set(newSugg.id, newSugg);
    return newSugg;
  }
  async updateContentSuggestion(id: string, updates: Partial<ContentSuggestion>): Promise<ContentSuggestion | undefined> {
    const sugg = this.contentSuggestions.get(id);
    if (!sugg) return undefined;
    const updated = { ...sugg, ...updates };
    this.contentSuggestions.set(id, updated);
    return updated;
  }

  async getDashboardStats() {
    const posts = Array.from(this.posts.values());
    const artists = Array.from(this.artists.values());
    const nfts = Array.from(this.nfts.values());
    const mentions = Array.from(this.communityMentions.values());
    return {
      totalPosts: posts.length,
      pendingPosts: posts.filter(p => p.status === "pending").length,
      verifiedArtists: artists.filter(a => a.verified).length,
      totalNfts: nfts.length,
      communityMentions: mentions.length,
      pendingEngagements: mentions.filter(m => m.actionStatus === "pending").length,
    };
  }
}

export const storage = new MemStorage();
