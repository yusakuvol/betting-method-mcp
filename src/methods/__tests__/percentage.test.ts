import { beforeEach, describe, expect, it } from "vitest";
import { PercentageMethod } from "../percentage.js";

describe("PercentageMethod", () => {
  let percentage: PercentageMethod;

  beforeEach(() => {
    percentage = new PercentageMethod();
  });

  describe("initSession", () => {
    it("should initialize with provided parameters", () => {
      percentage.initSession(1000, 0.1, 10);
      const state = percentage.getState();

      expect(state.initialBankroll).toBe(1000);
      expect(state.currentBankroll).toBe(1000);
      expect(state.betPercentage).toBe(0.1);
      expect(state.minBet).toBe(10);
      expect(state.currentBet).toBe(100); // 1000 * 0.1
      expect(state.totalWins).toBe(0);
      expect(state.totalLosses).toBe(0);
      expect(state.totalProfit).toBe(0);
      expect(state.profitPercentage).toBe(0);
      expect(state.sessionActive).toBe(true);
    });

    it("should floor the bet amount calculation", () => {
      percentage.initSession(1555, 0.1, 10);
      const state = percentage.getState();

      expect(state.currentBet).toBe(155); // floor(1555 * 0.1) = 155
    });

    it("should use minBet when calculated bet is less than minBet", () => {
      percentage.initSession(50, 0.1, 10);
      const state = percentage.getState();

      expect(state.currentBet).toBe(10); // max(10, floor(50 * 0.1)) = max(10, 5) = 10
    });

    it("should throw error if initialBankroll is zero or negative", () => {
      expect(() => {
        percentage.initSession(0, 0.1, 10);
      }).toThrow("initialBankroll must be positive");

      expect(() => {
        percentage.initSession(-100, 0.1, 10);
      }).toThrow("initialBankroll must be positive");
    });

    it("should throw error if betPercentage is zero or negative", () => {
      expect(() => {
        percentage.initSession(1000, 0, 10);
      }).toThrow("betPercentage must be between 0 and 1");

      expect(() => {
        percentage.initSession(1000, -0.1, 10);
      }).toThrow("betPercentage must be between 0 and 1");
    });

    it("should throw error if betPercentage is greater than 1", () => {
      expect(() => {
        percentage.initSession(1000, 1.5, 10);
      }).toThrow("betPercentage must be between 0 and 1");
    });

    it("should throw error if minBet is zero or negative", () => {
      expect(() => {
        percentage.initSession(1000, 0.1, 0);
      }).toThrow("minBet must be positive");

      expect(() => {
        percentage.initSession(1000, 0.1, -5);
      }).toThrow("minBet must be positive");
    });

    it("should throw error if minBet is greater than initialBankroll", () => {
      expect(() => {
        percentage.initSession(100, 0.1, 150);
      }).toThrow("minBet must be less than or equal to initialBankroll");
    });
  });

  describe("recordResult - win", () => {
    beforeEach(() => {
      percentage.initSession(1000, 0.1, 10);
    });

    it("should increase bankroll and bet on win", () => {
      percentage.recordResult("win");
      const state = percentage.getState();

      expect(state.currentBankroll).toBe(1100); // 1000 + 100
      expect(state.currentBet).toBe(110); // floor(1100 * 0.1)
      expect(state.totalProfit).toBe(100);
      expect(state.totalWins).toBe(1);
      expect(state.totalLosses).toBe(0);
      expect(state.profitPercentage).toBe(10); // (1100 - 1000) / 1000 * 100
    });

    it("should continue increasing on consecutive wins", () => {
      percentage.recordResult("win"); // 1000 -> 1100, bet: 110
      percentage.recordResult("win"); // 1100 -> 1210, bet: 121
      percentage.recordResult("win"); // 1210 -> 1331, bet: 133
      const state = percentage.getState();

      expect(state.currentBankroll).toBe(1331);
      expect(state.currentBet).toBe(133); // floor(1331 * 0.1)
      expect(state.totalProfit).toBe(331);
      expect(state.totalWins).toBe(3);
      expect(state.profitPercentage).toBeCloseTo(33.1, 1);
    });
  });

  describe("recordResult - loss", () => {
    beforeEach(() => {
      percentage.initSession(1000, 0.1, 10);
    });

    it("should decrease bankroll and bet on loss", () => {
      percentage.recordResult("loss");
      const state = percentage.getState();

      expect(state.currentBankroll).toBe(900); // 1000 - 100
      expect(state.currentBet).toBe(90); // floor(900 * 0.1)
      expect(state.totalProfit).toBe(-100);
      expect(state.totalWins).toBe(0);
      expect(state.totalLosses).toBe(1);
      expect(state.profitPercentage).toBe(-10); // (900 - 1000) / 1000 * 100
    });

    it("should continue decreasing on consecutive losses", () => {
      percentage.recordResult("loss"); // 1000 -> 900, bet: 90
      percentage.recordResult("loss"); // 900 -> 810, bet: 81
      percentage.recordResult("loss"); // 810 -> 729, bet: 72
      const state = percentage.getState();

      expect(state.currentBankroll).toBe(729);
      expect(state.currentBet).toBe(72); // floor(729 * 0.1)
      expect(state.totalProfit).toBe(-271);
      expect(state.totalLosses).toBe(3);
      expect(state.profitPercentage).toBeCloseTo(-27.1, 1);
    });

    it("should use minBet when calculated bet falls below it", () => {
      percentage.initSession(100, 0.1, 10);

      percentage.recordResult("loss"); // 100 -> 90, bet: max(10, 9) = 10
      const state = percentage.getState();

      expect(state.currentBankroll).toBe(90);
      expect(state.currentBet).toBe(10); // minBet enforced
    });

    it("should end session when bankroll falls below minBet", () => {
      percentage.initSession(25, 0.5, 10);

      percentage.recordResult("loss"); // 25 -> 13, bet was floor(25 * 0.5) = 12
      const state = percentage.getState();

      expect(state.currentBankroll).toBe(13); // 25 - 12 = 13
      expect(state.currentBet).toBe(10); // max(10, floor(13 * 0.5)) = max(10, 6) = 10

      percentage.recordResult("loss"); // 13 -> 3, below minBet
      const finalState = percentage.getState();

      expect(finalState.currentBankroll).toBe(3);
      expect(finalState.sessionActive).toBe(false);
      expect(finalState.currentBet).toBe(0);
    });
  });

  describe("recordResult - mixed scenarios", () => {
    beforeEach(() => {
      percentage.initSession(1000, 0.1, 10);
    });

    it("should handle win-loss-win pattern", () => {
      percentage.recordResult("win"); // 1000 -> 1100, bet: 110
      percentage.recordResult("loss"); // 1100 -> 990, bet: 99
      percentage.recordResult("win"); // 990 -> 1089, bet: 108
      const state = percentage.getState();

      expect(state.currentBankroll).toBe(1089);
      expect(state.currentBet).toBe(108);
      expect(state.totalProfit).toBe(89); // 100 - 110 + 99
      expect(state.totalWins).toBe(2);
      expect(state.totalLosses).toBe(1);
    });

    it("should calculate profit percentage correctly in mixed scenario", () => {
      percentage.recordResult("win");
      percentage.recordResult("loss");
      percentage.recordResult("loss");
      const state = percentage.getState();

      // 1000 -> win(100) -> 1100 -> loss(110) -> 990 -> loss(99) -> 891
      expect(state.currentBankroll).toBe(891);
      expect(state.profitPercentage).toBeCloseTo(-10.9, 1);
    });
  });

  describe("getState", () => {
    it("should return a copy of state", () => {
      percentage.initSession(1000, 0.1, 10);
      const state1 = percentage.getState();
      const state2 = percentage.getState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Different objects
    });

    it("should not allow external modification of state", () => {
      percentage.initSession(1000, 0.1, 10);
      const state = percentage.getState();

      // Try to modify the returned state
      state.currentBankroll = 9999;
      state.currentBet = 9999;

      // Verify internal state unchanged
      const actualState = percentage.getState();
      expect(actualState.currentBankroll).toBe(1000);
      expect(actualState.currentBet).toBe(100);
    });
  });

  describe("reset", () => {
    it("should reset to initial session state", () => {
      percentage.initSession(1000, 0.1, 10);
      percentage.recordResult("win");
      percentage.recordResult("loss");

      percentage.reset();
      const state = percentage.getState();

      expect(state.initialBankroll).toBe(1000);
      expect(state.currentBankroll).toBe(1000);
      expect(state.betPercentage).toBe(0.1);
      expect(state.minBet).toBe(10);
      expect(state.currentBet).toBe(100);
      expect(state.totalWins).toBe(0);
      expect(state.totalLosses).toBe(0);
      expect(state.totalProfit).toBe(0);
      expect(state.profitPercentage).toBe(0);
      expect(state.sessionActive).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should throw error when recording result without active session", () => {
      expect(() => {
        percentage.recordResult("win");
      }).toThrow("No active session");
    });

    it("should throw error when recording after session is ended", () => {
      percentage.initSession(25, 0.5, 10);
      percentage.recordResult("loss"); // 25 -> 12
      percentage.recordResult("loss"); // 12 -> 2, session ends

      expect(() => {
        percentage.recordResult("win");
      }).toThrow("No active session");
    });
  });

  describe("edge cases", () => {
    it("should handle very small percentage", () => {
      percentage.initSession(1000, 0.01, 5);
      const state = percentage.getState();

      expect(state.currentBet).toBe(10); // floor(1000 * 0.01) = 10
    });

    it("should handle percentage exactly equal to 1 (100%)", () => {
      percentage.initSession(100, 1.0, 10);
      const state = percentage.getState();

      expect(state.currentBet).toBe(100); // floor(100 * 1.0) = 100
    });

    it("should handle bankroll falling below minBet after many losses", () => {
      percentage.initSession(100, 0.1, 10);

      // Make losses until bankroll falls below minBet
      while (percentage.getState().sessionActive) {
        percentage.recordResult("loss");
      }

      const state = percentage.getState();
      expect(state.currentBankroll).toBeLessThan(10);
      expect(state.sessionActive).toBe(false);
    });

    it("should handle many wins in a row", () => {
      percentage.initSession(1000, 0.1, 10);

      for (let i = 0; i < 10; i++) {
        percentage.recordResult("win");
      }

      const state = percentage.getState();
      expect(state.totalWins).toBe(10);
      expect(state.currentBankroll).toBeGreaterThan(1000);
      expect(state.totalProfit).toBeGreaterThan(0);
      expect(state.sessionActive).toBe(true);
    });
  });
});
