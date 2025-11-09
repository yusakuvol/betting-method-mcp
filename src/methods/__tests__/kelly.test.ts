import { beforeEach, describe, expect, it } from "vitest";
import { KellyCriterionMethod } from "../kelly.js";

describe("KellyCriterionMethod", () => {
  let kelly: KellyCriterionMethod;

  beforeEach(() => {
    kelly = new KellyCriterionMethod();
  });

  describe("initSession", () => {
    it("should initialize with provided parameters", () => {
      kelly.initSession(1000, 0.55, 2.0, 0.5, 1);
      const state = kelly.getState();

      expect(state.initialBankroll).toBe(1000);
      expect(state.currentBankroll).toBe(1000);
      expect(state.winProbability).toBe(0.55);
      expect(state.payoutOdds).toBe(2.0);
      expect(state.fractionalKelly).toBe(0.5);
      expect(state.minBet).toBe(1);
      expect(state.totalWins).toBe(0);
      expect(state.totalLosses).toBe(0);
      expect(state.actualWinRate).toBe(0);
      expect(state.totalProfit).toBe(0);
      expect(state.sessionActive).toBe(true);
      expect(state.bankrollHistory).toEqual([1000]);
    });

    it("should calculate correct Kelly percentage", () => {
      // Kelly = (bp - q) / b = (2.0 * 0.55 - 0.45) / 2.0 = 0.325
      kelly.initSession(1000, 0.55, 2.0, 0.5, 1);
      const state = kelly.getState();

      expect(state.kellyPercentage).toBeCloseTo(0.325, 3);
      // Recommended bet = 1000 * 0.325 * 0.5 = 162.5
      expect(state.currentBet).toBeCloseTo(162.5, 1);
    });

    it("should use default fractionalKelly of 0.5", () => {
      kelly.initSession(1000, 0.55, 2.0, undefined, 1);
      const state = kelly.getState();

      expect(state.fractionalKelly).toBe(0.5);
    });

    it("should use default minBet of 1", () => {
      kelly.initSession(1000, 0.55, 2.0, 0.5);
      const state = kelly.getState();

      expect(state.minBet).toBe(1);
    });

    it("should apply maxBet constraint", () => {
      kelly.initSession(1000, 0.55, 2.0, 0.5, 1, 100);
      const state = kelly.getState();

      // Kelly bet would be ~162.5, but maxBet is 100
      expect(state.currentBet).toBeLessThanOrEqual(100);
    });

    it("should throw error if initialBankroll is zero or negative", () => {
      expect(() => {
        kelly.initSession(0, 0.55, 2.0, 0.5, 1);
      }).toThrow("initialBankroll must be positive");

      expect(() => {
        kelly.initSession(-100, 0.55, 2.0, 0.5, 1);
      }).toThrow("initialBankroll must be positive");
    });

    it("should throw error if winProbability is invalid", () => {
      expect(() => {
        kelly.initSession(1000, 0, 2.0, 0.5, 1);
      }).toThrow("winProbability must be between 0 and 1 (exclusive)");

      expect(() => {
        kelly.initSession(1000, 1, 2.0, 0.5, 1);
      }).toThrow("winProbability must be between 0 and 1 (exclusive)");

      expect(() => {
        kelly.initSession(1000, -0.1, 2.0, 0.5, 1);
      }).toThrow("winProbability must be between 0 and 1 (exclusive)");
    });

    it("should throw error if payoutOdds is <= 1", () => {
      expect(() => {
        kelly.initSession(1000, 0.55, 1.0, 0.5, 1);
      }).toThrow("payoutOdds must be greater than 1");

      expect(() => {
        kelly.initSession(1000, 0.55, 0.5, 0.5, 1);
      }).toThrow("payoutOdds must be greater than 1");
    });

    it("should throw error if fractionalKelly is invalid", () => {
      expect(() => {
        kelly.initSession(1000, 0.55, 2.0, 0, 1);
      }).toThrow("fractionalKelly must be between 0 and 1 (inclusive)");

      expect(() => {
        kelly.initSession(1000, 0.55, 2.0, 1.5, 1);
      }).toThrow("fractionalKelly must be between 0 and 1 (inclusive)");
    });

    it("should throw error if minBet is zero or negative", () => {
      expect(() => {
        kelly.initSession(1000, 0.55, 2.0, 0.5, 0);
      }).toThrow("minBet must be positive");

      expect(() => {
        kelly.initSession(1000, 0.55, 2.0, 0.5, -1);
      }).toThrow("minBet must be positive");
    });

    it("should throw error if maxBet is less than minBet", () => {
      expect(() => {
        kelly.initSession(1000, 0.55, 2.0, 0.5, 10, 5);
      }).toThrow("maxBet must be greater than or equal to minBet");
    });
  });

  describe("Kelly calculation", () => {
    it("should return 0 Kelly for negative expected value", () => {
      // Win probability 0.3, payout 2.0: (2.0 * 0.3 - 0.7) / 2.0 = -0.05 (negative)
      kelly.initSession(1000, 0.3, 2.0, 0.5, 1);
      const state = kelly.getState();

      expect(state.kellyPercentage).toBe(0);
      expect(state.currentBet).toBe(0);
    });

    it("should calculate correct Kelly for different scenarios", () => {
      // High win rate, high odds
      kelly.initSession(1000, 0.7, 3.0, 1.0, 1);
      let state = kelly.getState();
      // Kelly = (3.0 * 0.7 - 0.3) / 3.0 = 0.6
      expect(state.kellyPercentage).toBeCloseTo(0.6, 1);

      // Low win rate, high odds
      kelly.initSession(1000, 0.3, 5.0, 1.0, 1);
      state = kelly.getState();
      // Kelly = (5.0 * 0.3 - 0.7) / 5.0 = 0.16
      expect(state.kellyPercentage).toBeCloseTo(0.16, 2);
    });
  });

  describe("recordResult - win", () => {
    beforeEach(() => {
      kelly.initSession(1000, 0.55, 2.0, 0.5, 1);
    });

    it("should increase bankroll on win", () => {
      kelly.recordResult("win");
      const state = kelly.getState();

      // Bankroll increases by (bet * payoutOdds - bet) = bet * (payoutOdds - 1)
      expect(state.currentBankroll).toBeGreaterThan(1000);
      expect(state.totalWins).toBe(1);
      expect(state.totalLosses).toBe(0);
      expect(state.totalProfit).toBeGreaterThan(0);
    });

    it("should update actual win rate", () => {
      kelly.recordResult("win");
      kelly.recordResult("win");
      kelly.recordResult("loss");
      const state = kelly.getState();

      expect(state.actualWinRate).toBeCloseTo(2 / 3, 2);
    });

    it("should recalculate bet after win", () => {
      kelly.recordResult("win");
      const state = kelly.getState();

      // Bet should be recalculated based on new bankroll
      expect(state.currentBet).toBeGreaterThan(0);
    });

    it("should use actual payout if provided", () => {
      const initialBet = kelly.getState().currentBet;
      const customPayout = initialBet * 2.5; // Different from default
      kelly.recordResult("win", customPayout);
      const state = kelly.getState();

      // Bankroll should reflect custom payout
      const expectedBankroll = 1000 + customPayout - initialBet;
      expect(state.currentBankroll).toBeCloseTo(expectedBankroll, 1);
    });
  });

  describe("recordResult - loss", () => {
    beforeEach(() => {
      kelly.initSession(1000, 0.55, 2.0, 0.5, 1);
    });

    it("should decrease bankroll on loss", () => {
      const initialBet = kelly.getState().currentBet;
      kelly.recordResult("loss");
      const state = kelly.getState();

      expect(state.currentBankroll).toBe(1000 - initialBet);
      expect(state.totalWins).toBe(0);
      expect(state.totalLosses).toBe(1);
      expect(state.totalProfit).toBe(-initialBet);
    });

    it("should update actual win rate", () => {
      kelly.recordResult("loss");
      kelly.recordResult("loss");
      kelly.recordResult("win");
      const state = kelly.getState();

      expect(state.actualWinRate).toBeCloseTo(1 / 3, 2);
    });

    it("should recalculate bet after loss", () => {
      const initialBet = kelly.getState().currentBet;
      kelly.recordResult("loss");
      const state = kelly.getState();

      // Bet should decrease as bankroll decreases
      expect(state.currentBet).toBeLessThan(initialBet);
      expect(state.currentBet).toBeGreaterThanOrEqual(state.minBet);
    });
  });

  describe("dynamic Kelly (actual win rate)", () => {
    it("should use actual win rate after 30 games", () => {
      kelly.initSession(1000, 0.55, 2.0, 0.5, 1);

      // Record 30 games with 60% actual win rate (different from estimated 55%)
      for (let i = 0; i < 30; i++) {
        kelly.recordResult(i % 10 < 6 ? "win" : "loss");
      }

      const state = kelly.getState();
      expect(state.actualWinRate).toBeCloseTo(0.6, 1);

      // Kelly should be recalculated using actual win rate
      // New Kelly = (2.0 * 0.6 - 0.4) / 2.0 = 0.4
      expect(state.kellyPercentage).toBeCloseTo(0.4, 1);
    });

    it("should use estimated win rate before 30 games", () => {
      kelly.initSession(1000, 0.55, 2.0, 0.5, 1);

      // Record 29 games
      for (let i = 0; i < 29; i++) {
        kelly.recordResult("win");
      }

      const state = kelly.getState();
      // Should still use initial winProbability (0.55) for Kelly calculation
      expect(state.kellyPercentage).toBeCloseTo(0.325, 2);
    });
  });

  describe("recordResult - edge cases", () => {
    it("should end session when bankroll is below minBet", () => {
      kelly.initSession(100, 0.55, 2.0, 0.5, 50);
      // First loss: bankroll becomes ~50 (depending on bet), still >= minBet
      kelly.recordResult("loss");
      // Second loss: bankroll should be below minBet
      kelly.recordResult("loss");
      const state = kelly.getState();

      expect(state.sessionActive).toBe(false);
      expect(state.currentBet).toBe(0);
    });

    it("should throw error when recording without active session", () => {
      expect(() => {
        kelly.recordResult("win");
      }).toThrow("No active session. Please initialize a session first.");
    });

    it("should throw error when bet is 0 (negative Kelly)", () => {
      kelly.initSession(1000, 0.3, 2.0, 0.5, 1); // Negative expected value
      const state = kelly.getState();
      expect(state.currentBet).toBe(0);

      expect(() => {
        kelly.recordResult("win");
      }).toThrow("Cannot record result: recommended bet is 0 or negative");
    });

    it("should throw error when bet exceeds bankroll", () => {
      kelly.initSession(100, 0.55, 2.0, 1.0, 1); // Full Kelly, might exceed
      const state = kelly.getState();

      if (state.currentBet > state.currentBankroll) {
        expect(() => {
          kelly.recordResult("win");
        }).toThrow("Cannot record result: bet exceeds current bankroll");
      }
    });
  });

  describe("getState", () => {
    it("should return a copy of state", () => {
      kelly.initSession(1000, 0.55, 2.0, 0.5, 1);
      const state1 = kelly.getState();
      const state2 = kelly.getState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Different objects
    });

    it("should not allow external modification of state", () => {
      kelly.initSession(1000, 0.55, 2.0, 0.5, 1);
      const state = kelly.getState();

      state.currentBankroll = 999;
      state.currentBet = 999;

      const actualState = kelly.getState();
      expect(actualState.currentBankroll).toBe(1000);
      expect(actualState.currentBet).not.toBe(999);
    });

    it("should return deep copy of bankrollHistory", () => {
      kelly.initSession(1000, 0.55, 2.0, 0.5, 1);
      kelly.recordResult("win");
      const state1 = kelly.getState();
      const state2 = kelly.getState();

      expect(state1.bankrollHistory).toEqual(state2.bankrollHistory);
      expect(state1.bankrollHistory).not.toBe(state2.bankrollHistory);
    });
  });

  describe("reset", () => {
    it("should reset to initial session state", () => {
      kelly.initSession(1000, 0.55, 2.0, 0.5, 1);
      kelly.recordResult("win");
      kelly.recordResult("loss");

      kelly.reset();
      const state = kelly.getState();

      expect(state.initialBankroll).toBe(1000);
      expect(state.currentBankroll).toBe(1000);
      expect(state.winProbability).toBe(0.55);
      expect(state.payoutOdds).toBe(2.0);
      expect(state.fractionalKelly).toBe(0.5);
      expect(state.minBet).toBe(1);
      expect(state.totalWins).toBe(0);
      expect(state.totalLosses).toBe(0);
      expect(state.actualWinRate).toBe(0);
      expect(state.totalProfit).toBe(0);
      expect(state.sessionActive).toBe(true);
      expect(state.bankrollHistory).toEqual([1000]);
    });

    it("should preserve session parameters after reset", () => {
      kelly.initSession(500, 0.6, 3.0, 0.25, 10, 200);
      kelly.recordResult("loss");
      kelly.recordResult("loss");

      kelly.reset();
      const state = kelly.getState();

      expect(state.initialBankroll).toBe(500);
      expect(state.winProbability).toBe(0.6);
      expect(state.payoutOdds).toBe(3.0);
      expect(state.fractionalKelly).toBe(0.25);
      expect(state.minBet).toBe(10);
      expect(state.maxBet).toBe(200);
    });

    it("should throw error when resetting without initialization", () => {
      const newKelly = new KellyCriterionMethod();
      expect(() => {
        newKelly.reset();
      }).toThrow("Cannot reset: no session has been initialized");
    });
  });

  describe("fractional Kelly variations", () => {
    it("should apply Full Kelly (1.0)", () => {
      kelly.initSession(1000, 0.55, 2.0, 1.0, 1);
      const state = kelly.getState();

      // Full Kelly = 1000 * 0.325 * 1.0 = 325
      expect(state.currentBet).toBeCloseTo(325, 0);
    });

    it("should apply Half Kelly (0.5)", () => {
      kelly.initSession(1000, 0.55, 2.0, 0.5, 1);
      const state = kelly.getState();

      // Half Kelly = 1000 * 0.325 * 0.5 = 162.5
      expect(state.currentBet).toBeCloseTo(162.5, 0);
    });

    it("should apply Quarter Kelly (0.25)", () => {
      kelly.initSession(1000, 0.55, 2.0, 0.25, 1);
      const state = kelly.getState();

      // Quarter Kelly = 1000 * 0.325 * 0.25 = 81.25
      expect(state.currentBet).toBeCloseTo(81.25, 0);
    });
  });

  describe("mixed scenarios", () => {
    it("should handle alternating wins and losses", () => {
      kelly.initSession(1000, 0.55, 2.0, 0.5, 1);
      kelly.recordResult("win");
      kelly.recordResult("loss");
      kelly.recordResult("win");
      const state = kelly.getState();

      expect(state.totalWins).toBe(2);
      expect(state.totalLosses).toBe(1);
      expect(state.actualWinRate).toBeCloseTo(2 / 3, 2);
      expect(state.currentBankroll).toBeGreaterThan(0);
    });

    it("should handle long winning streak", () => {
      kelly.initSession(1000, 0.55, 2.0, 0.5, 1);
      for (let i = 0; i < 10; i++) {
        kelly.recordResult("win");
      }
      const state = kelly.getState();

      expect(state.totalWins).toBe(10);
      expect(state.totalLosses).toBe(0);
      expect(state.currentBankroll).toBeGreaterThan(1000);
    });

    it("should handle long losing streak", () => {
      kelly.initSession(1000, 0.55, 2.0, 0.5, 1);
      for (let i = 0; i < 5; i++) {
        kelly.recordResult("loss");
      }
      const state = kelly.getState();

      expect(state.totalWins).toBe(0);
      expect(state.totalLosses).toBe(5);
      expect(state.currentBankroll).toBeLessThan(1000);
    });
  });

  describe("edge cases", () => {
    it("should handle very high win probability", () => {
      kelly.initSession(1000, 0.99, 2.0, 0.5, 1);
      const state = kelly.getState();

      // Kelly = (2.0 * 0.99 - 0.01) / 2.0 = 0.985
      expect(state.kellyPercentage).toBeCloseTo(0.985, 2);
    });

    it("should handle very low win probability", () => {
      kelly.initSession(1000, 0.01, 10.0, 0.5, 1);
      const state = kelly.getState();

      // Kelly = (10.0 * 0.01 - 0.99) / 10.0 = -0.089 (negative, so 0)
      expect(state.kellyPercentage).toBe(0);
      expect(state.currentBet).toBe(0);
    });

    it("should handle high payout odds", () => {
      kelly.initSession(1000, 0.3, 10.0, 0.5, 1);
      const state = kelly.getState();

      // Kelly = (10.0 * 0.3 - 0.7) / 10.0 = 0.23
      expect(state.kellyPercentage).toBeCloseTo(0.23, 2);
    });

    it("should round bet to 2 decimal places", () => {
      kelly.initSession(1000, 0.55, 2.0, 0.333, 1);
      const state = kelly.getState();

      // Check that bet is rounded
      const betString = state.currentBet.toString();
      const decimalPlaces = betString.split(".")[1]?.length || 0;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });
  });
});
