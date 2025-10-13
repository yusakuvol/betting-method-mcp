import { beforeEach, describe, expect, it } from "vitest";
import { MartingaleMethod } from "../martingale.js";

describe("MartingaleMethod", () => {
  let martingale: MartingaleMethod;

  beforeEach(() => {
    martingale = new MartingaleMethod();
  });

  describe("initSession", () => {
    it("should initialize with provided parameters", () => {
      martingale.initSession(10, 1000, 7);
      const state = martingale.getState();

      expect(state.baseUnit).toBe(10);
      expect(state.currentBet).toBe(10);
      expect(state.maxBet).toBe(1000);
      expect(state.maxLossStreak).toBe(7);
      expect(state.currentStreak).toBe(0);
      expect(state.totalProfit).toBe(0);
      expect(state.sessionActive).toBe(true);
      expect(state.reachedLimit).toBe(false);
    });

    it("should use default maxBet if not provided", () => {
      martingale.initSession(10);
      const state = martingale.getState();

      expect(state.maxBet).toBe(10240); // 10 * 1024
      expect(state.maxLossStreak).toBe(10);
    });

    it("should throw error if baseUnit is zero or negative", () => {
      expect(() => {
        martingale.initSession(0);
      }).toThrow("baseUnit must be positive");

      expect(() => {
        martingale.initSession(-5);
      }).toThrow("baseUnit must be positive");
    });

    it("should throw error if maxBet is less than baseUnit", () => {
      expect(() => {
        martingale.initSession(10, 5);
      }).toThrow("maxBet must be greater than or equal to baseUnit");
    });
  });

  describe("recordResult - win", () => {
    beforeEach(() => {
      martingale.initSession(10, 1000, 7);
    });

    it("should reset bet to base unit on win", () => {
      martingale.recordResult("loss"); // bet becomes 20
      martingale.recordResult("win");
      const state = martingale.getState();

      expect(state.currentBet).toBe(10);
      expect(state.currentStreak).toBe(0);
    });

    it("should update profit correctly on win", () => {
      martingale.recordResult("win");
      const state = martingale.getState();

      expect(state.totalProfit).toBe(10);
    });

    it("should reset streak counter on win", () => {
      martingale.recordResult("loss");
      martingale.recordResult("loss");
      martingale.recordResult("win");
      const state = martingale.getState();

      expect(state.currentStreak).toBe(0);
    });
  });

  describe("recordResult - loss", () => {
    beforeEach(() => {
      martingale.initSession(10, 1000, 7);
    });

    it("should double the bet on loss", () => {
      martingale.recordResult("loss");
      const state = martingale.getState();

      expect(state.currentBet).toBe(20);
      expect(state.currentStreak).toBe(1);
    });

    it("should update profit correctly on loss", () => {
      martingale.recordResult("loss");
      const state = martingale.getState();

      expect(state.totalProfit).toBe(-10);
    });

    it("should continue doubling on consecutive losses", () => {
      martingale.recordResult("loss"); // bet: 10, next: 20, profit: -10
      martingale.recordResult("loss"); // bet: 20, next: 40, profit: -30
      martingale.recordResult("loss"); // bet: 40, next: 80, profit: -70
      const state = martingale.getState();

      expect(state.currentBet).toBe(80);
      expect(state.currentStreak).toBe(3);
      expect(state.totalProfit).toBe(-70);
    });
  });

  describe("recordResult - limit reached", () => {
    it("should end session when max bet is exceeded", () => {
      martingale.initSession(10, 100, 10);

      martingale.recordResult("loss"); // 10 -> 20
      martingale.recordResult("loss"); // 20 -> 40
      martingale.recordResult("loss"); // 40 -> 80
      martingale.recordResult("loss"); // 80 -> would be 160 (exceeds 100)

      const state = martingale.getState();

      expect(state.sessionActive).toBe(false);
      expect(state.reachedLimit).toBe(true);
      expect(state.currentBet).toBe(0);
    });

    it("should end session when max loss streak is reached", () => {
      martingale.initSession(10, 10000, 3);

      martingale.recordResult("loss"); // streak: 1
      martingale.recordResult("loss"); // streak: 2
      martingale.recordResult("loss"); // streak: 3 (reaches max)

      const state = martingale.getState();

      expect(state.sessionActive).toBe(false);
      expect(state.reachedLimit).toBe(true);
      expect(state.currentStreak).toBe(3);
    });
  });

  describe("recordResult - recovery scenario", () => {
    beforeEach(() => {
      martingale.initSession(10, 1000, 7);
    });

    it("should recover all losses plus initial bet on win after losses", () => {
      martingale.recordResult("loss"); // -10, next bet: 20
      martingale.recordResult("loss"); // -30, next bet: 40
      martingale.recordResult("loss"); // -70, next bet: 80
      martingale.recordResult("win"); // +80, total: +10

      const state = martingale.getState();

      expect(state.totalProfit).toBe(10); // Recovered + 1 base unit
      expect(state.currentBet).toBe(10); // Reset to base
      expect(state.currentStreak).toBe(0);
    });
  });

  describe("getState", () => {
    it("should return a copy of state", () => {
      martingale.initSession(10);
      const state1 = martingale.getState();
      const state2 = martingale.getState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Different objects
    });
  });

  describe("reset", () => {
    it("should reset session with same parameters", () => {
      martingale.initSession(10, 500, 5);
      martingale.recordResult("loss");
      martingale.recordResult("loss");

      martingale.reset();
      const state = martingale.getState();

      expect(state.baseUnit).toBe(10);
      expect(state.currentBet).toBe(10);
      expect(state.maxBet).toBe(500);
      expect(state.maxLossStreak).toBe(5);
      expect(state.currentStreak).toBe(0);
      expect(state.totalProfit).toBe(0);
      expect(state.sessionActive).toBe(true);
      expect(state.reachedLimit).toBe(false);
    });
  });

  describe("error handling", () => {
    it("should throw error when recording result without active session", () => {
      expect(() => {
        martingale.recordResult("win");
      }).toThrow("No active session");
    });

    it("should throw error when recording after limit is reached", () => {
      martingale.initSession(10, 50, 10);
      martingale.recordResult("loss"); // 10 -> 20
      martingale.recordResult("loss"); // 20 -> 40
      martingale.recordResult("loss"); // 40 -> would exceed, session ends

      expect(() => {
        martingale.recordResult("win");
      }).toThrow("No active session");
    });
  });

  describe("edge cases", () => {
    it("should handle exact maxBet match", () => {
      martingale.initSession(10, 80, 10);

      martingale.recordResult("loss"); // 10 -> 20
      martingale.recordResult("loss"); // 20 -> 40
      martingale.recordResult("loss"); // 40 -> 80 (exactly maxBet)

      const state = martingale.getState();

      expect(state.currentBet).toBe(80);
      expect(state.sessionActive).toBe(true); // Still active

      martingale.recordResult("loss"); // 80 -> 160 (exceeds)

      const finalState = martingale.getState();
      expect(finalState.sessionActive).toBe(false);
      expect(finalState.reachedLimit).toBe(true);
    });

    it("should handle very long winning streak", () => {
      martingale.initSession(10, 10000, 10);

      for (let i = 0; i < 100; i++) {
        martingale.recordResult("win");
      }

      const state = martingale.getState();

      expect(state.totalProfit).toBe(1000); // 100 wins * 10
      expect(state.currentBet).toBe(10); // Always resets to base
      expect(state.sessionActive).toBe(true);
    });
  });
});
