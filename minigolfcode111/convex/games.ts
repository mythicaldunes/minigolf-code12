import { v } from "convex/values"; 
import { mutation, query } from "./_generated/server";

// إنشاء لعبة جديدة بعدد لاعبين محدد
export const createGame = mutation({
  args: { playerCount: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("games", { playerCount: args.playerCount });
  },
});

// إضافة لاعب جديد إلى اللعبة
export const addPlayer = mutation({
  args: { 
    name: v.string(), 
    gameId: v.id("games"), 
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("players", {
      name: args.name,
      gameId: args.gameId,
      score: 0, // نتيجة مبدئية
    });
  },
});

// تحديث نتيجة لاعب
export const submitGameScore = mutation({
  args: { 
    playerId: v.id("players"),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.playerId, { score: args.score });
  },
});

// جلب اللاعبين حسب اللعبة
export const getPlayersByGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();
  },
});
