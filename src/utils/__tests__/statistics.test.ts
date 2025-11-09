import { describe, expect, it } from "vitest";
import {
  calculateWinRate,
  calculateROI,
  calculateDrawdown,
  calculateVolatility,
  calculateSharpeRatio,
  updateStreak,
  initializeStatistics,
  updateStatistics,
  updateBankrollStatistics,
  calculateRiskMetrics,
  generateSummary,
} from "../statistics.js";
import type { BetResult } from "../../types.js";

describe("statistics utilities", () => {
  describe("calculateWinRate", () => {
    it("should calculate win rate correctly", () => {
      expect(calculateWinRate(5, 5)).toBe(0.5);
      expect(calculateWinRate(7, 3)).toBe(0.7);
      expect(calculateWinRate(0, 10)).toBe(0);
      expect(calculateWinRate(10, 0)).toBe(1);
    });

    it("should return 0 when total is 0", () => {
      expect(calculateWinRate(0, 0)).toBe(0);
    });
  });

  describe("calculateROI", () => {
    it("should calculate ROI correctly", () => {
      expect(calculateROI(100, 1000)).toBe(10);
      expect(calculateROI(-50, 1000)).toBe(-5);
      expect(calculateROI(0, 1000)).toBe(0);
    });

    it("should return 0 when totalWagered is 0", () => {
      expect(calculateROI(100, 0)).toBe(0);
    });
  });

  describe("calculateDrawdown", () => {
    it("should calculate drawdown correctly", () => {
      const history = [1000, 1100, 900, 1200, 800];
      const drawdown = calculateDrawdown(history);
      expect(drawdown).toBeCloseTo(33.33, 1); // (1200 - 800) / 1200 * 100
    });

    it("should return 0 for empty history", () => {
      expect(calculateDrawdown([])).toBe(0);
    });

    it("should return 0 for single value", () => {
      expect(calculateDrawdown([1000])).toBe(0);
    });

    it("should handle increasing values", () => {
      const history = [1000, 1100, 1200, 1300];
      expect(calculateDrawdown(history)).toBe(0);
    });
  });

  describe("calculateVolatility", () => {
    it("should calculate volatility correctly", () => {
      const values = [10, 20, 30, 40, 50];
      const volatility = calculateVolatility(values);
      expect(volatility).toBeCloseTo(14.14, 1);
    });

    it("should return 0 for less than 2 values", () => {
      expect(calculateVolatility([])).toBe(0);
      expect(calculateVolatility([10])).toBe(0);
    });

    it("should return 0 for identical values", () => {
      expect(calculateVolatility([10, 10, 10])).toBe(0);
    });
  });

  describe("calculateSharpeRatio", () => {
    it("should calculate Sharpe ratio correctly", () => {
      const returns = [10, -5, 15, -10, 20];
      const sharpe = calculateSharpeRatio(returns);
      expect(sharpe).toBeGreaterThan(0);
    });

    it("should return 0 for less than 2 returns", () => {
      expect(calculateSharpeRatio([])).toBe(0);
      expect(calculateSharpeRatio([10])).toBe(0);
    });

    it("should return 0 when volatility is 0", () => {
      expect(calculateSharpeRatio([10, 10, 10])).toBe(0);
    });

    it("should use risk-free rate", () => {
      const returns = [10, -5, 15];
      const sharpe = calculateSharpeRatio(returns, 2);
      expect(sharpe).toBeGreaterThan(0);
    });
  });

  describe("updateStreak", () => {
    it("should increment streak on win after win", () => {
      expect(updateStreak(3, "win")).toBe(4);
      expect(updateStreak(0, "win")).toBe(1);
    });

    it("should reset to 1 on win after loss", () => {
      expect(updateStreak(-2, "win")).toBe(1);
      expect(updateStreak(-5, "win")).toBe(1);
    });

    it("should decrement streak on loss after loss", () => {
      expect(updateStreak(-3, "loss")).toBe(-4);
      expect(updateStreak(0, "loss")).toBe(-1);
    });

    it("should reset to -1 on loss after win", () => {
      expect(updateStreak(2, "loss")).toBe(-1);
      expect(updateStreak(5, "loss")).toBe(-1);
    });
  });

  describe("initializeStatistics", () => {
    it("should initialize with default values", () => {
      const stats = initializeStatistics();
      expect(stats.totalGames).toBe(0);
      expect(stats.totalWins).toBe(0);
      expect(stats.totalLosses).toBe(0);
      expect(stats.winRate).toBe(0);
      expect(stats.currentStreak).toBe(0);
      expect(stats.maxWinStreak).toBe(0);
      expect(stats.maxLossStreak).toBe(0);
      expect(stats.totalWagered).toBe(0);
      expect(stats.totalReturned).toBe(0);
      expect(stats.netProfit).toBe(0);
      expect(stats.roi).toBe(0);
      expect(stats.averageBet).toBe(0);
      expect(stats.minBet).toBe(Infinity);
      expect(stats.maxBet).toBe(0);
      expect(stats.betHistory).toEqual([]);
      expect(stats.outcomeHistory).toEqual([]);
    });

    it("should disable history when enableHistory is false", () => {
      const stats = initializeStatistics(false);
      expect(stats.betHistory).toBeUndefined();
      expect(stats.outcomeHistory).toBeUndefined();
    });
  });

  describe("updateStatistics", () => {
    it("should update statistics on win", () => {
      const stats = initializeStatistics();
      const updated = updateStatistics(stats, 100, "win", 200);

      expect(updated.totalGames).toBe(1);
      expect(updated.totalWins).toBe(1);
      expect(updated.totalLosses).toBe(0);
      expect(updated.winRate).toBe(1);
      expect(updated.currentStreak).toBe(1);
      expect(updated.maxWinStreak).toBe(1);
      expect(updated.totalWagered).toBe(100);
      expect(updated.totalReturned).toBe(200);
      expect(updated.netProfit).toBe(100);
      expect(updated.roi).toBe(100);
      expect(updated.averageBet).toBe(100);
      expect(updated.minBet).toBe(100);
      expect(updated.maxBet).toBe(100);
    });

    it("should update statistics on loss", () => {
      const stats = initializeStatistics();
      const updated = updateStatistics(stats, 100, "loss");

      expect(updated.totalGames).toBe(1);
      expect(updated.totalWins).toBe(0);
      expect(updated.totalLosses).toBe(1);
      expect(updated.winRate).toBe(0);
      expect(updated.currentStreak).toBe(-1);
      expect(updated.maxLossStreak).toBe(1);
      expect(updated.totalWagered).toBe(100);
      expect(updated.totalReturned).toBe(0);
      expect(updated.netProfit).toBe(-100);
      expect(updated.roi).toBe(-100);
    });

    it("should track max win streak", () => {
      let stats = initializeStatistics();
      stats = updateStatistics(stats, 100, "win");
      stats = updateStatistics(stats, 100, "win");
      stats = updateStatistics(stats, 100, "win");

      expect(stats.maxWinStreak).toBe(3);
      expect(stats.currentStreak).toBe(3);
    });

    it("should track max loss streak", () => {
      let stats = initializeStatistics();
      stats = updateStatistics(stats, 100, "loss");
      stats = updateStatistics(stats, 100, "loss");
      stats = updateStatistics(stats, 100, "loss");

      expect(stats.maxLossStreak).toBe(3);
      expect(stats.currentStreak).toBe(-3);
    });

    it("should update bet history when enabled", () => {
      const stats = initializeStatistics(true);
      let updated = updateStatistics(stats, 100, "win");
      updated = updateStatistics(updated, 200, "loss");

      expect(updated.betHistory).toEqual([100, 200]);
      expect(updated.outcomeHistory).toEqual(["win", "loss"]);
    });

    it("should not update history when disabled", () => {
      const stats = initializeStatistics(false);
      const updated = updateStatistics(stats, 100, "win");

      expect(updated.betHistory).toBeUndefined();
      expect(updated.outcomeHistory).toBeUndefined();
    });

    it("should use default payout for win", () => {
      const stats = initializeStatistics();
      const updated = updateStatistics(stats, 100, "win");

      expect(updated.totalReturned).toBe(200); // Default 2x payout
    });

    it("should use custom payout when provided", () => {
      const stats = initializeStatistics();
      const updated = updateStatistics(stats, 100, "win", 300);

      expect(updated.totalReturned).toBe(300);
      expect(updated.netProfit).toBe(200);
    });
  });

  describe("updateBankrollStatistics", () => {
    it("should update bankroll history", () => {
      const stats = initializeStatistics();
      let updated = updateBankrollStatistics(stats, 1000);
      updated = updateBankrollStatistics(updated, 1100);
      updated = updateBankrollStatistics(updated, 900);

      expect(updated.bankrollHistory).toEqual([1000, 1100, 900]);
    });

    it("should track peak and lowest bankroll", () => {
      const stats = initializeStatistics();
      let updated = updateBankrollStatistics(stats, 1000, 1000);
      updated = updateBankrollStatistics(updated, 1200, 1000);
      updated = updateBankrollStatistics(updated, 800, 1000);

      expect(updated.peakBankroll).toBe(1200);
      expect(updated.lowestBankroll).toBe(800);
    });

    it("should calculate drawdown", () => {
      const stats = initializeStatistics();
      let updated = updateBankrollStatistics(stats, 1000, 1000);
      updated = updateBankrollStatistics(updated, 1200, 1000);
      updated = updateBankrollStatistics(updated, 800, 1000);

      expect(updated.drawdown).toBeGreaterThan(0);
    });

    it("should initialize peak and lowest from initial bankroll", () => {
      const stats = initializeStatistics();
      const updated = updateBankrollStatistics(stats, 1000, 1000);

      expect(updated.peakBankroll).toBe(1000);
      expect(updated.lowestBankroll).toBe(1000);
    });
  });

  describe("calculateRiskMetrics", () => {
    it("should calculate volatility from bet history", () => {
      const stats = initializeStatistics(true);
      let updated = updateStatistics(stats, 100, "win");
      updated = updateStatistics(updated, 200, "loss");
      updated = updateStatistics(updated, 150, "win");

      const withRisk = calculateRiskMetrics(updated);
      expect(withRisk.volatility).toBeGreaterThan(0);
    });

    it("should calculate Sharpe ratio from returns", () => {
      const stats = initializeStatistics(true);
      let updated = updateStatistics(stats, 100, "win");
      updated = updateStatistics(updated, 200, "loss");
      updated = updateStatistics(updated, 150, "win");

      const withRisk = calculateRiskMetrics(updated);
      expect(withRisk.sharpeRatio).toBeDefined();
    });

    it("should not calculate metrics without history", () => {
      const stats = initializeStatistics(false);
      const withRisk = calculateRiskMetrics(stats);

      expect(withRisk.volatility).toBeUndefined();
      expect(withRisk.sharpeRatio).toBeUndefined();
    });

    it("should not calculate volatility with less than 2 bets", () => {
      const stats = initializeStatistics(true);
      const updated = updateStatistics(stats, 100, "win");

      const withRisk = calculateRiskMetrics(updated);
      expect(withRisk.volatility).toBeUndefined();
    });
  });

  describe("generateSummary", () => {
    it("should generate summary with basic stats", () => {
      const stats = initializeStatistics();
      let updated = updateStatistics(stats, 100, "win");
      updated = updateStatistics(updated, 100, "loss");

      const summary = generateSummary(updated);
      expect(summary).toContain("2ゲーム");
      expect(summary).toContain("勝率");
    });

    it("should include profit information", () => {
      const stats = initializeStatistics();
      const updated = updateStatistics(stats, 100, "win", 200);

      const summary = generateSummary(updated);
      expect(summary).toContain("純利益");
      expect(summary).toContain("ROI");
    });

    it("should include streak information", () => {
      const stats = initializeStatistics();
      let updated = updateStatistics(stats, 100, "win");
      updated = updateStatistics(updated, 100, "win");
      updated = updateStatistics(updated, 100, "win");

      const summary = generateSummary(updated);
      expect(summary).toContain("最大連勝");
    });

    it("should include drawdown when available", () => {
      const stats = initializeStatistics();
      let updated = updateBankrollStatistics(stats, 1000, 1000);
      updated = updateBankrollStatistics(updated, 1200, 1000);
      updated = updateBankrollStatistics(updated, 800, 1000);

      const summary = generateSummary(updated);
      expect(summary).toContain("最大ドローダウン");
    });

    it("should handle empty statistics", () => {
      const stats = initializeStatistics();
      const summary = generateSummary(stats);

      expect(summary).toContain("0ゲーム");
    });
  });
});
