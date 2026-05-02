import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  platform: text("platform").notNull().default("twitter"),
  status: text("status").notNull().default("pending"),
  aiGenerated: boolean("ai_generated").notNull().default(false),
  hashtags: text("hashtags").array().notNull().default(sql`'{}'::text[]`),
  mediaUrl: text("media_url"),
  scheduledAt: timestamp("scheduled_at"),
  postedAt: timestamp("posted_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  engagementData: jsonb("engagement_data"),
});

export const insertPostSchema = createInsertSchema(posts).omit({ id: true, createdAt: true });
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export const artists = pgTable("artists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  twitterHandle: text("twitter_handle"),
  walletAddress: text("wallet_address"),
  chain: text("chain").notNull().default("evm"),
  verified: boolean("verified").notNull().default(false),
  nftCount: integer("nft_count").notNull().default(0),
  genre: text("genre"),
  bio: text("bio"),
  streamingLinks: jsonb("streaming_links"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertArtistSchema = createInsertSchema(artists).omit({ id: true, createdAt: true });
export type InsertArtist = z.infer<typeof insertArtistSchema>;
export type Artist = typeof artists.$inferSelect;

export const nfts = pgTable("nfts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  artistId: varchar("artist_id"),
  artistName: text("artist_name").notNull(),
  contractAddress: text("contract_address"),
  tokenId: text("token_id"),
  chain: text("chain").notNull().default("ethereum"),
  genre: text("genre"),
  description: text("description"),
  imageUrl: text("image_url"),
  audioUrl: text("audio_url"),
  price: text("price"),
  currency: text("currency").notNull().default("ETH"),
  marketplace: text("marketplace"),
  streamingLinks: jsonb("streaming_links"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertNftSchema = createInsertSchema(nfts).omit({ id: true, createdAt: true });
export type InsertNft = z.infer<typeof insertNftSchema>;
export type Nft = typeof nfts.$inferSelect;

export const communityMentions = pgTable("community_mentions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  twitterHandle: text("twitter_handle").notNull(),
  displayName: text("display_name"),
  tweetId: text("tweet_id"),
  tweetContent: text("tweet_content"),
  hashtags: text("hashtags").array().notNull().default(sql`'{}'::text[]`),
  engagementAction: text("engagement_action"),
  actionStatus: text("action_status").notNull().default("pending"),
  aiReplyDraft: text("ai_reply_draft"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertCommunityMentionSchema = createInsertSchema(communityMentions).omit({ id: true, createdAt: true });
export type InsertCommunityMention = z.infer<typeof insertCommunityMentionSchema>;
export type CommunityMention = typeof communityMentions.$inferSelect;

export const contentSuggestions = pgTable("content_suggestions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  content: text("content").notNull(),
  hashtags: text("hashtags").array().notNull().default(sql`'{}'::text[]`),
  approved: boolean("approved"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertContentSuggestionSchema = createInsertSchema(contentSuggestions).omit({ id: true, createdAt: true });
export type InsertContentSuggestion = z.infer<typeof insertContentSuggestionSchema>;
export type ContentSuggestion = typeof contentSuggestions.$inferSelect;
