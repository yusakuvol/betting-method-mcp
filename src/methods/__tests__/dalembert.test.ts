import { beforeEach, describe, expect, it } from "vitest";
import { DAlembertMethod } from "../dalembert.js";

describe("DAlembertMethod", () => {
  let dalembert: DAlembertMethod;

  beforeEach(() => {
    dalembert = new DAlembertMethod();
  });

  describe("initSession", () => {
    it("should initialize with provided parameters", () => {
      dalembert.initSession(10, 100);
      const state = dalembert.getState();

      expect(state.baseUnit).toBe(10);
      expect(state.currentBet).toBe(10);
      expect(state.maxBet).toBe(100);
      expect(state.totalProfit).toBe(0);
      expect(state.sessionActive).toBe(true);
      expect(state.reachedLimit).toBe(false);
    });

    it("should initialize without maxBet", () => {
      dalembert.initSession(10);
      const state = dalembert.getState();

      expect(state.baseUnit).toBe(10);
      expect(state.currentBet).toBe(10);
      expect(state.maxBet).toBeUndefined();
      expect(state.sessionActive).toBe(true);
    });

    it("should throw error if baseUnit is zero or negative", () => {
      expect(() => {
        dalembert.initSession(0);
      }).toThrow("baseUnit must be positive");

      expect(() => {
        dalembert.initSession(-5);
      }).toThrow("baseUnit must be positive");
    });

    it("should throw error if maxBet is less than baseUnit", () => {
      expect(() => {
        dalembert.initSession(10, 5);
      }).toThrow("maxBet must be greater than or equal to baseUnit");
    });
  });

  describe("recordResult - win", () => {
    beforeEach(() => {
      dalembert.initSession(10, 100);
    });

    it("should decrease bet by 1 unit on win", () => {
      dalembert.recordResult("loss"); // bet becomes 20
      dalembert.recordResult("win"); // bet becomes 10
      const state = dalembert.getState();

      expect(state.currentBet).toBe(10);
    });

    it("should not decrease bet below base unit", () => {
      dalembert.recordResult("win"); // bet stays at 10 (base unit)
      const state = dalembert.getState();

      expect(state.currentBet).toBe(10);
    });

    it("should update profit correctly on win", () => {
      dalembert.recordResult("win");
      const state = dalembert.getState();

      expect(state.totalProfit).toBe(10);
    });

    it("should decrease bet correctly after multiple losses then win", () => {
      dalembert.recordResult("loss"); // 10 -> 20
      dalembert.recordResult("loss"); // 20 -> 30
      dalembert.recordResult("loss"); // 30 -> 40
      dalembert.recordResult("win"); // 40 -> 30
      const state = dalembert.getState();

      expect(state.currentBet).toBe(30);
    });
  });

  describe("recordResult - loss", () => {
    beforeEach(() => {
      dalembert.initSession(10, 100);
    });

    it("should increase bet by 1 unit on loss", () => {
      dalembert.recordResult("loss");
      const state = dalembert.getState();

      expect(state.currentBet).toBe(20);
    });

    it("should update profit correctly on loss", () => {
      dalembert.recordResult("loss");
      const state = dalembert.getState();

      expect(state.totalProfit).toBe(-10);
    });

    it("should continue increasing by 1 unit on consecutive losses", () => {
      dalembert.recordResult("loss"); // bet: 10, next: 20, profit: -10
      dalembert.recordResult("loss"); // bet: 20, next: 30, profit: -30
      dalembert.recordResult("loss"); // bet: 30, next: 40, profit: -60
      const state = dalembert.getState();

      expect(state.currentBet).toBe(40);
      expect(state.totalProfit).toBe(-60);
    });
  });

  describe("recordResult - limit reached", () => {
    it("should end session when max bet is exceeded", () => {
      dalembert.initSession(10, 40);

      dalembert.recordResult("loss"); // 10 -> 20
      dalembert.recordResult("loss"); // 20 -> 30
      dalembert.recordResult("loss"); // 30 -> 40
      dalembert.recordResult("loss"); // 40 -> would be 50 (exceeds 40)

      const state = dalembert.getState();

      expect(state.sessionActive).toBe(false);
      expect(state.reachedLimit).toBe(true);
      expect(state.currentBet).toBe(0);
    });

    it("should allow betting at exactly maxBet", () => {
      dalembert.initSession(10, 30);

      dalembert.recordResult("loss"); // 10 -> 20
      dalembert.recordResult("loss"); // 20 -> 30 (exactly maxBet)

      const state = dalembert.getState();

      expect(state.currentBet).toBe(30);
      expect(state.sessionActive).toBe(true);
      expect(state.reachedLimit).toBe(false);
    });

    it("should not have limit if maxBet is not specified", () => {
      dalembert.initSession(10);

      for (let i = 0; i < 100; i++) {
        dalembert.recordResult("loss");
      }

      const state = dalembert.getState();

      expect(state.currentBet).toBe(1010); // 10 + (100 * 10)
      expect(state.sessionActive).toBe(true);
    });
  });

  describe("recordResult - mixed scenarios", () => {
    beforeEach(() => {
      dalembert.initSession(10, 100);
    });

    it("should handle alternating wins and losses", () => {
      dalembert.recordResult("loss"); // 10 -> 20, profit: -10
      dalembert.recordResult("win"); // 20 -> 10, profit: +10
      dalembert.recordResult("loss"); // 10 -> 20, profit: 0
      dalembert.recordResult("win"); // 20 -> 10, profit: +20

      const state = dalembert.getState();

      expect(state.currentBet).toBe(10);
      expect(state.totalProfit).toBe(20);
    });

    it("should gradually recover from losses", () => {
      dalembert.recordResult("loss"); // 10 -> 20, profit: -10
      dalembert.recordResult("loss"); // 20 -> 30, profit: -30
      dalembert.recordResult("loss"); // 30 -> 40, profit: -60
      dalembert.recordResult("win"); // 40 -> 30, profit: -20
      dalembert.recordResult("win"); // 30 -> 20, profit: +10
      dalembert.recordResult("win"); // 20 -> 10, profit: +30

      const state = dalembert.getState();

      expect(state.currentBet).toBe(10);
      expect(state.totalProfit).toBe(30);
    });
  });

  describe("getState", () => {
    it("should return a copy of state", () => {
      dalembert.initSession(10);
      const state1 = dalembert.getState();
      const state2 = dalembert.getState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Different objects
    });
  });

  describe("reset", () => {
    it("should reset session with same parameters", () => {
      dalembert.initSession(10, 50);
      dalembert.recordResult("loss");
      dalembert.recordResult("loss");

      dalembert.reset();
      const state = dalembert.getState();

      expect(state.baseUnit).toBe(10);
      expect(state.currentBet).toBe(10);
      expect(state.maxBet).toBe(50);
      expect(state.totalProfit).toBe(0);
      expect(state.sessionActive).toBe(true);
      expect(state.reachedLimit).toBe(false);
    });

    it("should reset session without maxBet", () => {
      dalembert.initSession(10);
      dalembert.recordResult("loss");
      dalembert.recordResult("loss");

      dalembert.reset();
      const state = dalembert.getState();

      expect(state.baseUnit).toBe(10);
      expect(state.currentBet).toBe(10);
      expect(state.maxBet).toBeUndefined();
      expect(state.totalProfit).toBe(0);
      expect(state.sessionActive).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should throw error when recording result without active session", () => {
      expect(() => {
        dalembert.recordResult("win");
      }).toThrow("No active session");
    });

    it("should throw error when recording after limit is reached", () => {
      dalembert.initSession(10, 30);
      dalembert.recordResult("loss"); // 10 -> 20
      dalembert.recordResult("loss"); // 20 -> 30
      dalembert.recordResult("loss"); // 30 -> would exceed, session ends

      expect(() => {
        dalembert.recordResult("win");
      }).toThrow("No active session");
    });
  });

  describe("edge cases", () => {
    it("should handle very long winning streak", () => {
      dalembert.initSession(10, 1000);

      for (let i = 0; i < 50; i++) {
        dalembert.recordResult("win");
      }

      const state = dalembert.getState();

      expect(state.totalProfit).toBe(500); // 50 wins * 10
      expect(state.currentBet).toBe(10); // Always stays at base unit after first win
      expect(state.sessionActive).toBe(true);
    });

    it("should handle recovery to base unit after losses", () => {
      dalembert.initSession(10, 1000);

      // Build up bet with losses
      dalembert.recordResult("loss"); // 10 -> 20
      dalembert.recordResult("loss"); // 20 -> 30
      dalembert.recordResult("loss"); // 30 -> 40

      // Win back down to base
      dalembert.recordResult("win"); // 40 -> 30
      dalembert.recordResult("win"); // 30 -> 20
      dalembert.recordResult("win"); // 20 -> 10

      const state = dalembert.getState();

      expect(state.currentBet).toBe(10);
      expect(state.totalProfit).toBe(30); // -10 -20 -30 +40 +30 +20 = 30
    });
  });
});
