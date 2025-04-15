import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  games: defineTable({
    playerCount: v.number(),
  }),
  players: defineTable({
    name: v.string(),
    gameId: v.id("games"),
    score: v.number(), // إضافة حقل النتيجة
  }).index("by_game", ["gameId"]),
});
