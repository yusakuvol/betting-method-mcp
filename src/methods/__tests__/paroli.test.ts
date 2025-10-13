import { beforeEach, describe, expect, it } from "vitest";
import { ParoliMethod } from "../paroli.js";

describe("ParoliMethod", () => {
  let paroli: ParoliMethod;

  beforeEach(() => {
    paroli = new ParoliMethod();
  });

  describe("initSession", () => {
    it("should initialize with provided parameters", () => {
      paroli.initSession(10, 5);
      const state = paroli.getState();

      expect(state.baseUnit).toBe(10);
      expect(state.currentBet).toBe(10);
      expect(state.targetWinStreak).toBe(5);
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

    it("should double the bet on win", () => {
      paroli.recordResult("win");
      const state = paroli.getState();

      expect(state.currentBet).toBe(20);
      expect(state.winStreak).toBe(1);
    });

    it("should update profit correctly on win", () => {
      paroli.recordResult("win");
      const state = paroli.getState();

      expect(state.totalProfit).toBe(10);
    });

    it("should continue doubling on consecutive wins", () => {
      paroli.recordResult("win"); // bet: 10, next: 20, profit: +10
      paroli.recordResult("win"); // bet: 20, next: 40, profit: +30
      const state = paroli.getState();

      expect(state.currentBet).toBe(40);
      expect(state.winStreak).toBe(2);
      expect(state.totalProfit).toBe(30);
    });

    it("should reset bet when target win streak is reached", () => {
      paroli.recordResult("win"); // bet: 10, next: 20, streak: 1
      paroli.recordResult("win"); // bet: 20, next: 40, streak: 2
      paroli.recordResult("win"); // bet: 40, next: reset to 10, streak: 3 -> 0
      const state = paroli.getState();

      expect(state.currentBet).toBe(10); // Reset to base unit
      expect(state.winStreak).toBe(0); // Reset streak
      expect(state.cyclesCompleted).toBe(1);
      expect(state.totalProfit).toBe(70); // 10 + 20 + 40
    });
  });

  describe("recordResult - loss", () => {
    beforeEach(() => {
      paroli.initSession(10, 3);
    });

    it("should reset bet to base unit on loss", () => {
      paroli.recordResult("win"); // bet becomes 20
      paroli.recordResult("loss");
      const state = paroli.getState();

      expect(state.currentBet).toBe(10);
      expect(state.winStreak).toBe(0);
    });

    it("should update profit correctly on loss", () => {
      paroli.recordResult("loss");
      const state = paroli.getState();

      expect(state.totalProfit).toBe(-10);
    });

    it("should reset streak counter on loss", () => {
      paroli.recordResult("win");
      paroli.recordResult("win");
      paroli.recordResult("loss");
      const state = paroli.getState();

      expect(state.winStreak).toBe(0);
      expect(state.currentBet).toBe(10);
    });
  });

  describe("recordResult - mixed results", () => {
    beforeEach(() => {
      paroli.initSession(10, 3);
    });

    it("should handle win-loss-win pattern", () => {
      paroli.recordResult("win"); // +10, bet: 20, streak: 1
      paroli.recordResult("loss"); // -20, bet: 10, streak: 0
      paroli.recordResult("win"); // +10, bet: 20, streak: 1
      const state = paroli.getState();

      expect(state.currentBet).toBe(20);
      expect(state.winStreak).toBe(1);
      expect(state.totalProfit).toBe(0); // 10 - 20 + 10 = 0
    });

    it("should handle multiple complete cycles", () => {
      // First cycle
      paroli.recordResult("win"); // +10, bet: 20
      paroli.recordResult("win"); // +20, bet: 40
      paroli.recordResult("win"); // +40, bet: 10 (reset), cycle: 1

      // Second cycle
      paroli.recordResult("win"); // +10, bet: 20
      paroli.recordResult("win"); // +20, bet: 40
      paroli.recordResult("win"); // +40, bet: 10 (reset), cycle: 2

      const state = paroli.getState();

      expect(state.currentBet).toBe(10);
      expect(state.winStreak).toBe(0);
      expect(state.cyclesCompleted).toBe(2);
      expect(state.totalProfit).toBe(140); // (10+20+40) * 2
    });

    it("should handle loss breaking a winning streak", () => {
      paroli.recordResult("win"); // +10, bet: 20, streak: 1
      paroli.recordResult("win"); // +20, bet: 40, streak: 2
      paroli.recordResult("loss"); // -40, bet: 10, streak: 0
      const state = paroli.getState();

      expect(state.currentBet).toBe(10);
      expect(state.winStreak).toBe(0);
      expect(state.cyclesCompleted).toBe(0);
      expect(state.totalProfit).toBe(-10); // 10 + 20 - 40
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
      paroli.initSession(10, 5);
      paroli.recordResult("win");
      paroli.recordResult("win");

      paroli.reset();
      const state = paroli.getState();

      expect(state.baseUnit).toBe(10);
      expect(state.currentBet).toBe(10);
      expect(state.targetWinStreak).toBe(5);
      expect(state.winStreak).toBe(0);
      expect(state.totalProfit).toBe(0);
      expect(state.sessionActive).toBe(true);
      expect(state.cyclesCompleted).toBe(0);
    });
  });

  describe("error handling", () => {
    it("should throw error when recording result without active session", () => {
      expect(() => {
        paroli.recordResult("win");
      }).toThrow("No active session");
    });
  });

  describe("edge cases", () => {
    it("should handle very long winning streak with resets", () => {
      paroli.initSession(10, 3);

      // Simulate 3 complete cycles (9 wins)
      for (let cycle = 0; cycle < 3; cycle++) {
        for (let win = 0; win < 3; win++) {
          paroli.recordResult("win");
        }
      }

      const state = paroli.getState();

      expect(state.cyclesCompleted).toBe(3);
      expect(state.currentBet).toBe(10);
      expect(state.winStreak).toBe(0);
      expect(state.totalProfit).toBe(210); // (10+20+40) * 3
    });

    it("should handle alternating wins and losses", () => {
      paroli.initSession(10, 3);

      for (let i = 0; i < 10; i++) {
        paroli.recordResult("win"); // +10
        paroli.recordResult("loss"); // -20
      }

      const state = paroli.getState();

      expect(state.currentBet).toBe(10);
      expect(state.winStreak).toBe(0);
      expect(state.totalProfit).toBe(-100); // (10 - 20) * 10
    });

    it("should handle single win streak equal to target", () => {
      paroli.initSession(5, 1);

      paroli.recordResult("win"); // Should complete cycle immediately

      const state = paroli.getState();

      expect(state.currentBet).toBe(5);
      expect(state.winStreak).toBe(0);
      expect(state.cyclesCompleted).toBe(1);
      expect(state.totalProfit).toBe(5);
    });

    it("should handle very long consecutive losses", () => {
      paroli.initSession(10, 3);

      for (let i = 0; i < 100; i++) {
        paroli.recordResult("loss");
      }

      const state = paroli.getState();

      expect(state.totalProfit).toBe(-1000); // 100 losses * 10
      expect(state.currentBet).toBe(10); // Always stays at base
      expect(state.sessionActive).toBe(true); // Session remains active
      expect(state.cyclesCompleted).toBe(0);
    });
  });
});
