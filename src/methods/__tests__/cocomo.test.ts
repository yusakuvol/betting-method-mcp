import { beforeEach, describe, expect, it } from "vitest";
import { CocomoMethod } from "../cocomo.js";

describe("CocomoMethod", () => {
  let cocomo: CocomoMethod;

  beforeEach(() => {
    cocomo = new CocomoMethod();
  });

  describe("initSession", () => {
    it("should initialize with provided parameters", () => {
      cocomo.initSession(10, 1000);
      const state = cocomo.getState();

      expect(state.baseUnit).toBe(10);
      expect(state.currentBet).toBe(10);
      expect(state.previousBet).toBe(0);
      expect(state.maxBet).toBe(1000);
      expect(state.currentStreak).toBe(0);
      expect(state.totalProfit).toBe(0);
      expect(state.sessionActive).toBe(true);
      expect(state.reachedLimit).toBe(false);
      expect(state.payoutMultiplier).toBe(3);
    });

    it("should use default maxBet if not provided", () => {
      cocomo.initSession(10);
      const state = cocomo.getState();

      expect(state.maxBet).toBe(10000); // 10 * 1000
    });

    it("should throw error if baseUnit is zero or negative", () => {
      expect(() => {
        cocomo.initSession(0);
      }).toThrow("baseUnit must be positive");

      expect(() => {
        cocomo.initSession(-5);
      }).toThrow("baseUnit must be positive");
    });

    it("should throw error if maxBet is less than baseUnit", () => {
      expect(() => {
        cocomo.initSession(10, 5);
      }).toThrow("maxBet must be greater than or equal to baseUnit");
    });
  });

  describe("recordResult - win", () => {
    beforeEach(() => {
      cocomo.initSession(10, 1000);
    });

    it("should reset bet to base unit on win", () => {
      cocomo.recordResult("loss"); // bet becomes 10 (streak 1)
      cocomo.recordResult("loss"); // bet becomes 20 (10+10, streak 2)
      cocomo.recordResult("win");
      const state = cocomo.getState();

      expect(state.currentBet).toBe(10);
      expect(state.previousBet).toBe(0);
      expect(state.currentStreak).toBe(0);
    });

    it("should update profit correctly on win with 3x payout", () => {
      cocomo.recordResult("win");
      const state = cocomo.getState();

      // Win at bet 10, payout 30, profit = 30 - 10 = 20 (net profit is 2x bet)
      expect(state.totalProfit).toBe(20);
    });

    it("should reset streak counter on win", () => {
      cocomo.recordResult("loss");
      cocomo.recordResult("loss");
      cocomo.recordResult("loss");
      cocomo.recordResult("win");
      const state = cocomo.getState();

      expect(state.currentStreak).toBe(0);
    });
  });

  describe("recordResult - loss", () => {
    beforeEach(() => {
      cocomo.initSession(10, 1000);
    });

    it("should keep base unit for second bet after first loss", () => {
      cocomo.recordResult("loss"); // First loss
      const state = cocomo.getState();

      expect(state.currentBet).toBe(10); // Still base unit
      expect(state.previousBet).toBe(10);
      expect(state.currentStreak).toBe(1);
      expect(state.totalProfit).toBe(-10);
    });

    it("should follow Fibonacci-like progression from third bet", () => {
      cocomo.recordResult("loss"); // bet: 10, next: 10, profit: -10
      cocomo.recordResult("loss"); // bet: 10, next: 20 (10+10), profit: -20
      const state = cocomo.getState();

      expect(state.currentBet).toBe(20);
      expect(state.previousBet).toBe(10);
      expect(state.currentStreak).toBe(2);
      expect(state.totalProfit).toBe(-20);
    });

    it("should continue Fibonacci-like progression on consecutive losses", () => {
      cocomo.recordResult("loss"); // bet: 10, next: 10, profit: -10, prev: 10
      cocomo.recordResult("loss"); // bet: 10, next: 20, profit: -20, prev: 10
      cocomo.recordResult("loss"); // bet: 20, next: 30, profit: -40, prev: 20
      cocomo.recordResult("loss"); // bet: 30, next: 50, profit: -70, prev: 30
      cocomo.recordResult("loss"); // bet: 50, next: 80, profit: -120, prev: 50
      const state = cocomo.getState();

      expect(state.currentBet).toBe(80);
      expect(state.previousBet).toBe(50);
      expect(state.currentStreak).toBe(5);
      expect(state.totalProfit).toBe(-120);
    });

    it("should match the example progression from issue", () => {
      // Example from issue:
      // 1: 10 (loss, -10)
      // 2: 10 (loss, -20)
      // 3: 20 (loss, -40)
      // 4: 30 (loss, -70)
      // 5: 50 (loss, -120)
      // 6: 80 (win, +240, net +120)

      cocomo.recordResult("loss");
      let state = cocomo.getState();
      expect(state.currentBet).toBe(10);
      expect(state.totalProfit).toBe(-10);

      cocomo.recordResult("loss");
      state = cocomo.getState();
      expect(state.currentBet).toBe(20);
      expect(state.totalProfit).toBe(-20);

      cocomo.recordResult("loss");
      state = cocomo.getState();
      expect(state.currentBet).toBe(30);
      expect(state.totalProfit).toBe(-40);

      cocomo.recordResult("loss");
      state = cocomo.getState();
      expect(state.currentBet).toBe(50);
      expect(state.totalProfit).toBe(-70);

      cocomo.recordResult("loss");
      state = cocomo.getState();
      expect(state.currentBet).toBe(80);
      expect(state.totalProfit).toBe(-120);

      cocomo.recordResult("win");
      state = cocomo.getState();
      expect(state.currentBet).toBe(10); // Reset
      expect(state.totalProfit).toBe(40); // -120 + 160 = 40 (80 * 2 net profit)
    });
  });

  describe("recordResult - limit reached", () => {
    it("should end session when max bet is exceeded", () => {
      cocomo.initSession(10, 100);

      cocomo.recordResult("loss"); // 10 -> 10
      cocomo.recordResult("loss"); // 10 -> 20
      cocomo.recordResult("loss"); // 20 -> 30
      cocomo.recordResult("loss"); // 30 -> 50
      cocomo.recordResult("loss"); // 50 -> 80
      cocomo.recordResult("loss"); // 80 -> 130 (exceeds 100)

      const state = cocomo.getState();

      expect(state.sessionActive).toBe(false);
      expect(state.reachedLimit).toBe(true);
      expect(state.currentBet).toBe(0);
    });

    it("should handle exact maxBet match", () => {
      cocomo.initSession(10, 80);

      cocomo.recordResult("loss"); // 10 -> 10
      cocomo.recordResult("loss"); // 10 -> 20
      cocomo.recordResult("loss"); // 20 -> 30
      cocomo.recordResult("loss"); // 30 -> 50
      cocomo.recordResult("loss"); // 50 -> 80 (exactly maxBet)

      const state = cocomo.getState();

      expect(state.currentBet).toBe(80);
      expect(state.sessionActive).toBe(true); // Still active

      cocomo.recordResult("loss"); // 80 -> 130 (exceeds)

      const finalState = cocomo.getState();
      expect(finalState.sessionActive).toBe(false);
      expect(finalState.reachedLimit).toBe(true);
    });
  });

  describe("recordResult - recovery scenario", () => {
    beforeEach(() => {
      cocomo.initSession(10, 1000);
    });

    it("should recover all losses plus profit on win after losses", () => {
      cocomo.recordResult("loss"); // -10, next: 10
      cocomo.recordResult("loss"); // -20, next: 20
      cocomo.recordResult("loss"); // -40, next: 30
      cocomo.recordResult("win"); // +60 (30*2), total: +20

      const state = cocomo.getState();

      expect(state.totalProfit).toBe(20); // -40 + 60 = 20
      expect(state.currentBet).toBe(10); // Reset to base
      expect(state.currentStreak).toBe(0);
    });

    it("should handle multiple win/loss cycles", () => {
      // Cycle 1: loss, loss, win
      cocomo.recordResult("loss"); // -10
      cocomo.recordResult("loss"); // -20, next bet: 20
      cocomo.recordResult("win"); // +40 (20*2), total: +20

      let state = cocomo.getState();
      expect(state.totalProfit).toBe(20);

      // Cycle 2: loss, loss, loss, win
      cocomo.recordResult("loss"); // -10, total: +10
      cocomo.recordResult("loss"); // -10, total: 0, next bet: 20
      cocomo.recordResult("loss"); // -20, total: -20, next bet: 30
      cocomo.recordResult("win"); // +60 (30*2), total: +40

      state = cocomo.getState();
      expect(state.totalProfit).toBe(40);
      expect(state.currentBet).toBe(10);
      expect(state.sessionActive).toBe(true);
    });
  });

  describe("getState", () => {
    it("should return a copy of state", () => {
      cocomo.initSession(10);
      const state1 = cocomo.getState();
      const state2 = cocomo.getState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Different objects
    });
  });

  describe("reset", () => {
    it("should reset session with same parameters", () => {
      cocomo.initSession(10, 500);
      cocomo.recordResult("loss");
      cocomo.recordResult("loss");
      cocomo.recordResult("loss");

      cocomo.reset();
      const state = cocomo.getState();

      expect(state.baseUnit).toBe(10);
      expect(state.currentBet).toBe(10);
      expect(state.previousBet).toBe(0);
      expect(state.maxBet).toBe(500);
      expect(state.currentStreak).toBe(0);
      expect(state.totalProfit).toBe(0);
      expect(state.sessionActive).toBe(true);
      expect(state.reachedLimit).toBe(false);
    });
  });

  describe("error handling", () => {
    it("should throw error when recording result without active session", () => {
      expect(() => {
        cocomo.recordResult("win");
      }).toThrow("No active session");
    });

    it("should throw error when recording after limit is reached", () => {
      cocomo.initSession(10, 50);
      cocomo.recordResult("loss"); // 10 -> 10
      cocomo.recordResult("loss"); // 10 -> 20
      cocomo.recordResult("loss"); // 20 -> 30
      cocomo.recordResult("loss"); // 30 -> 50
      cocomo.recordResult("loss"); // 50 -> 80 (exceeds, session ends)

      expect(() => {
        cocomo.recordResult("win");
      }).toThrow("No active session");
    });
  });

  describe("edge cases", () => {
    it("should handle very long winning streak", () => {
      cocomo.initSession(10, 10000);

      for (let i = 0; i < 100; i++) {
        cocomo.recordResult("win");
      }

      const state = cocomo.getState();

      expect(state.totalProfit).toBe(2000); // 100 wins * 20 net profit
      expect(state.currentBet).toBe(10); // Always resets to base
      expect(state.sessionActive).toBe(true);
    });

    it("should handle alternating win/loss pattern", () => {
      cocomo.initSession(10, 1000);

      for (let i = 0; i < 10; i++) {
        cocomo.recordResult("loss");
        cocomo.recordResult("win");
      }

      const state = cocomo.getState();

      // Each cycle: lose 10, win with bet 10, profit = +10
      expect(state.totalProfit).toBe(100); // 10 cycles * 10 profit
      expect(state.currentBet).toBe(10);
      expect(state.sessionActive).toBe(true);
    });

    it("should maintain correct state after session end", () => {
      cocomo.initSession(10, 60);

      cocomo.recordResult("loss"); // 10 -> 10, profit: -10
      cocomo.recordResult("loss"); // 10 -> 20, profit: -20
      cocomo.recordResult("loss"); // 20 -> 30, profit: -40
      cocomo.recordResult("loss"); // 30 -> 50, profit: -70
      cocomo.recordResult("loss"); // 50 -> 80 (exceeds 60, session ends), profit: -120

      const state = cocomo.getState();

      expect(state.totalProfit).toBe(-120); // -10 -10 -20 -30 -50
      expect(state.currentBet).toBe(0);
      expect(state.sessionActive).toBe(false);
      expect(state.reachedLimit).toBe(true);
    });
  });

  describe("payout multiplier", () => {
    it("should always have payoutMultiplier of 3", () => {
      cocomo.initSession(10);
      const state = cocomo.getState();

      expect(state.payoutMultiplier).toBe(3);
    });

    it("should maintain payoutMultiplier throughout session", () => {
      cocomo.initSession(10);

      cocomo.recordResult("loss");
      cocomo.recordResult("win");
      cocomo.recordResult("loss");

      const state = cocomo.getState();

      expect(state.payoutMultiplier).toBe(3);
    });
  });
});
