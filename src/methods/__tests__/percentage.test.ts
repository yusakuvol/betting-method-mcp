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
      expect(state.sessionActive).toBe(true);
      expect(state.profitPercentage).toBe(0);
    });

    it("should use minBet when calculated bet is lower", () => {
      percentage.initSession(100, 0.05, 10);
      const state = percentage.getState();

      expect(state.currentBet).toBe(10); // max(10, floor(100 * 0.05)) = max(10, 5) = 10
    });

    it("should floor the calculated bet amount", () => {
      percentage.initSession(1000, 0.15, 10);
      const state = percentage.getState();

      expect(state.currentBet).toBe(150); // floor(1000 * 0.15) = 150
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
        percentage.initSession(1000, 0.1, -10);
      }).toThrow("minBet must be positive");
    });

    it("should throw error if minBet is greater than initialBankroll", () => {
      expect(() => {
        percentage.initSession(100, 0.1, 200);
      }).toThrow("minBet must not be greater than initialBankroll");
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
    });

    it("should update profit percentage correctly on win", () => {
      percentage.recordResult("win");
      const state = percentage.getState();

      expect(state.profitPercentage).toBe(10); // (1100 - 1000) / 1000 * 100
    });

    it("should continue to increase bet on multiple wins", () => {
      percentage.recordResult("win"); // 1000 -> 1100, bet = 110
      percentage.recordResult("win"); // 1100 -> 1210, bet = 121
      const state = percentage.getState();

      expect(state.currentBankroll).toBe(1210);
      expect(state.currentBet).toBe(121); // floor(1210 * 0.1)
      expect(state.totalProfit).toBe(210);
      expect(state.totalWins).toBe(2);
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
    });

    it("should update profit percentage correctly on loss", () => {
      percentage.recordResult("loss");
      const state = percentage.getState();

      expect(state.profitPercentage).toBe(-10); // (900 - 1000) / 1000 * 100
    });

    it("should continue to decrease bet on multiple losses", () => {
      percentage.recordResult("loss"); // 1000 -> 900, bet = 90
      percentage.recordResult("loss"); // 900 -> 810, bet = 81
      const state = percentage.getState();

      expect(state.currentBankroll).toBe(810);
      expect(state.currentBet).toBe(81); // floor(810 * 0.1)
      expect(state.totalProfit).toBe(-190);
      expect(state.totalLosses).toBe(2);
    });

    it("should use minBet when calculated bet is lower", () => {
      percentage.initSession(100, 0.1, 10);
      percentage.recordResult("loss"); // 100 -> 90, bet = max(10, floor(90 * 0.1)) = 10
      const state = percentage.getState();

      expect(state.currentBankroll).toBe(90);
      expect(state.currentBet).toBe(10); // minBet takes effect
    });

    it("should end session when bankroll is below minBet", () => {
      percentage.initSession(50, 0.5, 10);
      percentage.recordResult("loss"); // 50 -> 25, bet = max(10, floor(25 * 0.5)) = 12
      percentage.recordResult("loss"); // 25 -> 13, bet = max(10, floor(13 * 0.5)) = 10
      percentage.recordResult("loss"); // 13 -> 3, bet = 0 (session ends, bankroll < minBet)
      const state = percentage.getState();

      expect(state.sessionActive).toBe(false);
      expect(state.currentBet).toBe(0);
      expect(state.currentBankroll).toBe(3);
    });
  });

  describe("recordResult - mixed scenarios", () => {
    beforeEach(() => {
      percentage.initSession(1000, 0.1, 10);
    });

    it("should handle alternating wins and losses", () => {
      percentage.recordResult("win"); // 1000 -> 1100, bet = 110
      percentage.recordResult("loss"); // 1100 -> 990, bet = 99
      percentage.recordResult("win"); // 990 -> 1089, bet = 108
      const state = percentage.getState();

      expect(state.currentBankroll).toBe(1089);
      expect(state.currentBet).toBe(108);
      expect(state.totalProfit).toBe(89);
      expect(state.totalWins).toBe(2);
      expect(state.totalLosses).toBe(1);
    });

    it("should calculate profit percentage correctly after mixed results", () => {
      percentage.recordResult("win"); // 1000 -> 1100
      percentage.recordResult("loss"); // 1100 -> 990
      const state = percentage.getState();

      expect(state.profitPercentage).toBe(-1); // (990 - 1000) / 1000 * 100
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

      state.currentBankroll = 999;
      state.currentBet = 999;

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
      expect(state.sessionActive).toBe(true);
      expect(state.profitPercentage).toBe(0);
    });

    it("should preserve session parameters after reset", () => {
      percentage.initSession(500, 0.2, 20);
      percentage.recordResult("loss");
      percentage.recordResult("loss");

      percentage.reset();
      const state = percentage.getState();

      expect(state.initialBankroll).toBe(500);
      expect(state.betPercentage).toBe(0.2);
      expect(state.minBet).toBe(20);
      expect(state.currentBet).toBe(100); // floor(500 * 0.2)
    });
  });

  describe("error handling", () => {
    it("should throw error when recording result without active session", () => {
      expect(() => {
        percentage.recordResult("win");
      }).toThrow("No active session. Please initialize a session first.");
    });

    it("should throw error when recording result after session ends", () => {
      percentage.initSession(50, 0.5, 10);
      percentage.recordResult("loss");
      percentage.recordResult("loss");
      percentage.recordResult("loss");

      expect(() => {
        percentage.recordResult("win");
      }).toThrow("No active session. Please initialize a session first.");
    });
  });

  describe("edge cases", () => {
    it("should handle very small percentage", () => {
      percentage.initSession(1000, 0.01, 5);
      const state = percentage.getState();

      expect(state.currentBet).toBe(10); // floor(1000 * 0.01) = 10
    });

    it("should handle percentage of 1 (100%)", () => {
      percentage.initSession(100, 1, 10);
      const state = percentage.getState();

      expect(state.currentBet).toBe(100); // floor(100 * 1) = 100
    });

    it("should handle large bankroll", () => {
      percentage.initSession(1000000, 0.1, 100);
      const state = percentage.getState();

      expect(state.currentBet).toBe(100000); // floor(1000000 * 0.1)
    });

    it("should handle recovery from losses", () => {
      percentage.initSession(1000, 0.1, 10);
      percentage.recordResult("loss"); // 1000 -> 900, bet = 90
      percentage.recordResult("loss"); // 900 -> 810, bet = 81
      percentage.recordResult("loss"); // 810 -> 729, bet = 72
      percentage.recordResult("win"); // 729 -> 801, bet = 80
      percentage.recordResult("win"); // 801 -> 881, bet = 88
      percentage.recordResult("win"); // 881 -> 969, bet = 96
      percentage.recordResult("win"); // 969 -> 1065, bet = 106
      const state = percentage.getState();

      expect(state.currentBankroll).toBe(1065);
      expect(state.currentBet).toBe(106);
      expect(state.totalProfit).toBe(65);
      expect(state.profitPercentage).toBeCloseTo(6.5, 1);
    });
  });
});
