import { beforeEach, describe, expect, it } from "vitest";
import { ParoliMethod } from "../paroli.js";

describe("ParoliMethod", () => {
  let paroli: ParoliMethod;

  beforeEach(() => {
    paroli = new ParoliMethod();
  });

  describe("initSession", () => {
    it("should initialize with provided parameters", () => {
      paroli.initSession(10, 4);
      const state = paroli.getState();

      expect(state.baseUnit).toBe(10);
      expect(state.currentBet).toBe(10);
      expect(state.targetWinStreak).toBe(4);
      expect(state.winStreak).toBe(0);
      expect(state.totalProfit).toBe(0);
      expect(state.sessionActive).toBe(true);
      expect(state.cyclesCompleted).toBe(0);
    });

    it("should use default targetWinStreak if not provided", () => {
      paroli.initSession(10);
      const state = paroli.getState();

      expect(state.targetWinStreak).toBe(3);
    });

    it("should throw error if baseUnit is zero or negative", () => {
      expect(() => {
        paroli.initSession(0);
      }).toThrow("baseUnit must be positive");

      expect(() => {
        paroli.initSession(-5);
      }).toThrow("baseUnit must be positive");
    });

    it("should throw error if targetWinStreak is zero or negative", () => {
      expect(() => {
        paroli.initSession(10, 0);
      }).toThrow("targetWinStreak must be positive");

      expect(() => {
        paroli.initSession(10, -3);
      }).toThrow("targetWinStreak must be positive");
    });
  });

  describe("recordResult - win", () => {
    beforeEach(() => {
      paroli.initSession(10, 3);
    });

    it("should double bet on first win", () => {
      paroli.recordResult("win");
      const state = paroli.getState();

      expect(state.currentBet).toBe(20);
      expect(state.winStreak).toBe(1);
      expect(state.totalProfit).toBe(10);
      expect(state.sessionActive).toBe(true);
    });

    it("should double bet on second consecutive win", () => {
      paroli.recordResult("win");
      paroli.recordResult("win");
      const state = paroli.getState();

      expect(state.currentBet).toBe(40);
      expect(state.winStreak).toBe(2);
      expect(state.totalProfit).toBe(30); // 10 + 20
    });

    it("should reset to base unit after reaching target win streak", () => {
      paroli.recordResult("win"); // Bet 10, win streak 1, profit 10
      paroli.recordResult("win"); // Bet 20, win streak 2, profit 30
      paroli.recordResult("win"); // Bet 40, win streak 3, profit 70
      const state = paroli.getState();

      expect(state.currentBet).toBe(10);
      expect(state.winStreak).toBe(0);
      expect(state.totalProfit).toBe(70); // 10 + 20 + 40
      expect(state.cyclesCompleted).toBe(1);
      expect(state.sessionActive).toBe(true);
    });

    it("should handle multiple completed cycles", () => {
      // First cycle
      paroli.recordResult("win"); // 10
      paroli.recordResult("win"); // 20
      paroli.recordResult("win"); // 40, cycle complete

      // Second cycle
      paroli.recordResult("win"); // 10
      paroli.recordResult("win"); // 20
      paroli.recordResult("win"); // 40, cycle complete

      const state = paroli.getState();

      expect(state.currentBet).toBe(10);
      expect(state.winStreak).toBe(0);
      expect(state.totalProfit).toBe(140); // (10+20+40) * 2
      expect(state.cyclesCompleted).toBe(2);
    });
  });

  describe("recordResult - loss", () => {
    beforeEach(() => {
      paroli.initSession(10, 3);
    });

    it("should reset bet to base unit on first loss", () => {
      paroli.recordResult("loss");
      const state = paroli.getState();

      expect(state.currentBet).toBe(10);
      expect(state.winStreak).toBe(0);
      expect(state.totalProfit).toBe(-10);
      expect(state.sessionActive).toBe(true);
    });

    it("should reset bet to base unit after a win then loss", () => {
      paroli.recordResult("win");
      paroli.recordResult("loss");
      const state = paroli.getState();

      expect(state.currentBet).toBe(10);
      expect(state.winStreak).toBe(0);
      expect(state.totalProfit).toBe(-10); // 10 - 20
    });

    it("should reset win streak on loss during progression", () => {
      paroli.recordResult("win"); // Bet 10, win
      paroli.recordResult("win"); // Bet 20, win
      paroli.recordResult("loss"); // Bet 40, loss
      const state = paroli.getState();

      expect(state.currentBet).toBe(10);
      expect(state.winStreak).toBe(0);
      expect(state.totalProfit).toBe(-10); // 10 + 20 - 40
      expect(state.cyclesCompleted).toBe(0);
    });
  });

  describe("recordResult - mixed scenarios", () => {
    beforeEach(() => {
      paroli.initSession(10, 3);
    });

    it("should handle win-loss-win pattern", () => {
      paroli.recordResult("win"); // Bet 10, win, next bet 20
      paroli.recordResult("loss"); // Bet 20, loss, next bet 10
      paroli.recordResult("win"); // Bet 10, win, next bet 20
      const state = paroli.getState();

      expect(state.currentBet).toBe(20);
      expect(state.winStreak).toBe(1);
      expect(state.totalProfit).toBe(0); // 10 - 20 + 10
    });

    it("should handle loss-win-win pattern", () => {
      paroli.recordResult("loss"); // Bet 10, loss
      paroli.recordResult("win"); // Bet 10, win
      paroli.recordResult("win"); // Bet 20, win
      const state = paroli.getState();

      expect(state.currentBet).toBe(40);
      expect(state.winStreak).toBe(2);
      expect(state.totalProfit).toBe(20); // -10 + 10 + 20
    });

    it("should handle complex sequence with cycle completion", () => {
      paroli.recordResult("win"); // 10, streak 1
      paroli.recordResult("win"); // 20, streak 2
      paroli.recordResult("loss"); // 40, streak 0
      paroli.recordResult("win"); // 10, streak 1
      paroli.recordResult("win"); // 20, streak 2
      paroli.recordResult("win"); // 40, cycle complete, streak 0
      const state = paroli.getState();

      expect(state.currentBet).toBe(10);
      expect(state.winStreak).toBe(0);
      expect(state.totalProfit).toBe(60); // 10+20-40+10+20+40
      expect(state.cyclesCompleted).toBe(1);
    });
  });

  describe("recordResult - session validation", () => {
    it("should throw error if session not initialized", () => {
      expect(() => {
        paroli.recordResult("win");
      }).toThrow("No active session. Please initialize a session first.");
    });
  });

  describe("getState", () => {
    it("should return a copy of state", () => {
      paroli.initSession(10);
      const state1 = paroli.getState();
      const state2 = paroli.getState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Different objects
    });
  });

  describe("reset", () => {
    it("should reset session with same parameters", () => {
      paroli.initSession(10, 4);
      paroli.recordResult("win");
      paroli.recordResult("win");

      paroli.reset();
      const state = paroli.getState();

      expect(state.baseUnit).toBe(10);
      expect(state.currentBet).toBe(10);
      expect(state.targetWinStreak).toBe(4);
      expect(state.winStreak).toBe(0);
      expect(state.totalProfit).toBe(0);
      expect(state.sessionActive).toBe(true);
      expect(state.cyclesCompleted).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("should handle targetWinStreak of 1", () => {
      paroli.initSession(10, 1);
      paroli.recordResult("win");
      const state = paroli.getState();

      expect(state.currentBet).toBe(10);
      expect(state.winStreak).toBe(0);
      expect(state.cyclesCompleted).toBe(1);
      expect(state.totalProfit).toBe(10);
    });

    it("should handle large targetWinStreak", () => {
      paroli.initSession(10, 5);
      paroli.recordResult("win"); // 10
      paroli.recordResult("win"); // 20
      paroli.recordResult("win"); // 40
      paroli.recordResult("win"); // 80
      const state = paroli.getState();

      expect(state.currentBet).toBe(160);
      expect(state.winStreak).toBe(4);
      expect(state.cyclesCompleted).toBe(0);

      paroli.recordResult("win"); // 160, complete cycle
      const state2 = paroli.getState();

      expect(state2.currentBet).toBe(10);
      expect(state2.winStreak).toBe(0);
      expect(state2.cyclesCompleted).toBe(1);
      expect(state2.totalProfit).toBe(310); // 10+20+40+80+160
    });
  });
});
