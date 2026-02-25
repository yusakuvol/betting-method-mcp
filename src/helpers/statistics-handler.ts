import type { SessionStatistics } from "../types.js";
import { generateSummary } from "../utils/statistics.js";
import { createToolResponse } from "./mcp-response.js";

/**
 * Handle statistics tool call for any method that supports getStatistics()
 */
export function handleStatistics(stats: SessionStatistics | undefined) {
  if (!stats) {
    return createToolResponse({
      message: "No statistics available. Please initialize a session first.",
    });
  }

  return createToolResponse({
    basic: {
      totalGames: stats.totalGames,
      winRate: stats.winRate,
      netProfit: stats.netProfit,
      roi: stats.roi,
    },
    streaks: {
      current: stats.currentStreak,
      maxWin: stats.maxWinStreak,
      maxLoss: stats.maxLossStreak,
    },
    financial: {
      totalWagered: stats.totalWagered,
      totalReturned: stats.totalReturned,
      netProfit: stats.netProfit,
      roi: stats.roi,
    },
    betAmounts: {
      average: stats.averageBet,
      min: stats.minBet === Infinity ? 0 : stats.minBet,
      max: stats.maxBet,
    },
    risk:
      stats.volatility !== undefined || stats.sharpeRatio !== undefined
        ? {
            volatility: stats.volatility,
            sharpeRatio: stats.sharpeRatio,
          }
        : undefined,
    summary: generateSummary(stats),
  });
}
