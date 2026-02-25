import { describe, expect, it } from "vitest";
import type { SessionStatistics } from "../../types.js";
import { handleStatistics } from "../statistics-handler.js";

describe("statistics-handler", () => {
  describe("handleStatistics", () => {
    it("should return no-stats message when stats is undefined", () => {
      const result = handleStatistics(undefined);
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.message).toBe("No statistics available. Please initialize a session first.");
    });

    it("should return formatted statistics when stats are provided", () => {
      const stats: SessionStatistics = {
        totalGames: 10,
        totalWins: 6,
        totalLosses: 4,
        winRate: 0.6,
        currentStreak: 2,
        maxWinStreak: 3,
        maxLossStreak: 2,
        totalWagered: 100,
        totalReturned: 120,
        netProfit: 20,
        roi: 0.2,
        averageBet: 10,
        minBet: 5,
        maxBet: 20,
        betHistory: [10, 10, 10],
        outcomeHistory: ["win", "loss", "win"],
      };

      const result = handleStatistics(stats);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.basic.totalGames).toBe(10);
      expect(parsed.basic.winRate).toBe(0.6);
      expect(parsed.basic.netProfit).toBe(20);
      expect(parsed.basic.roi).toBe(0.2);

      expect(parsed.streaks.current).toBe(2);
      expect(parsed.streaks.maxWin).toBe(3);
      expect(parsed.streaks.maxLoss).toBe(2);

      expect(parsed.financial.totalWagered).toBe(100);
      expect(parsed.financial.totalReturned).toBe(120);

      expect(parsed.betAmounts.average).toBe(10);
      expect(parsed.betAmounts.min).toBe(5);
      expect(parsed.betAmounts.max).toBe(20);

      expect(parsed.summary).toBeDefined();
    });

    it("should replace Infinity minBet with 0", () => {
      const stats: SessionStatistics = {
        totalGames: 0,
        totalWins: 0,
        totalLosses: 0,
        winRate: 0,
        currentStreak: 0,
        maxWinStreak: 0,
        maxLossStreak: 0,
        totalWagered: 0,
        totalReturned: 0,
        netProfit: 0,
        roi: 0,
        averageBet: 0,
        minBet: Infinity,
        maxBet: 0,
      };

      const result = handleStatistics(stats);
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.betAmounts.min).toBe(0);
    });

    it("should include risk metrics when volatility is defined", () => {
      const stats: SessionStatistics = {
        totalGames: 5,
        totalWins: 3,
        totalLosses: 2,
        winRate: 0.6,
        currentStreak: 1,
        maxWinStreak: 2,
        maxLossStreak: 1,
        totalWagered: 50,
        totalReturned: 60,
        netProfit: 10,
        roi: 0.2,
        averageBet: 10,
        minBet: 10,
        maxBet: 10,
        volatility: 0.5,
        sharpeRatio: 1.2,
      };

      const result = handleStatistics(stats);
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.risk).toBeDefined();
      expect(parsed.risk.volatility).toBe(0.5);
      expect(parsed.risk.sharpeRatio).toBe(1.2);
    });

    it("should exclude risk when neither volatility nor sharpeRatio is defined", () => {
      const stats: SessionStatistics = {
        totalGames: 1,
        totalWins: 1,
        totalLosses: 0,
        winRate: 1,
        currentStreak: 1,
        maxWinStreak: 1,
        maxLossStreak: 0,
        totalWagered: 10,
        totalReturned: 20,
        netProfit: 10,
        roi: 1,
        averageBet: 10,
        minBet: 10,
        maxBet: 10,
      };

      const result = handleStatistics(stats);
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.risk).toBeUndefined();
    });
  });
});
