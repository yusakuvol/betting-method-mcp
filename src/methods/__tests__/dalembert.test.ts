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

    it("should initialize without maxBet (optional)", () => {
      dalembert.initSession(10);
      const state = dalembert.getState();

      expect(state.baseUnit).toBe(10);
      expect(state.currentBet).toBe(10);
      expect(state.maxBet).toBeUndefined();
      expect(state.totalProfit).toBe(0);
      expect(state.sessionActive).toBe(true);
      expect(state.reachedLimit).toBe(false);
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

    it("should not decrease below base unit on win", () => {
      dalembert.recordResult("win"); // Already at base unit
      const state = dalembert.getState();

      expect(state.currentBet).toBe(10); // Stays at base unit
    });

    it("should update profit correctly on win", () => {
      dalembert.recordResult("win");
      const state = dalembert.getState();

      expect(state.totalProfit).toBe(10);
    });

    it("should decrease bet progressively after multiple losses then win", () => {
      dalembert.recordResult("loss"); // bet: 10 -> 20
      dalembert.recordResult("loss"); // bet: 20 -> 30
      dalembert.recordResult("loss"); // bet: 30 -> 40
      dalembert.recordResult("win"); // bet: 40 -> 30
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

    it("should continue increasing on consecutive losses", () => {
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
      dalembert.initSession(10, 50);

      dalembert.recordResult("loss"); // 10 -> 20
      dalembert.recordResult("loss"); // 20 -> 30
      dalembert.recordResult("loss"); // 30 -> 40
      dalembert.recordResult("loss"); // 40 -> 50
      dalembert.recordResult("loss"); // 50 -> would be 60 (exceeds 50)

      const state = dalembert.getState();

      expect(state.sessionActive).toBe(false);
      expect(state.reachedLimit).toBe(true);
      expect(state.currentBet).toBe(0);
    });

    it("should continue when maxBet is not set", () => {
      dalembert.initSession(10); // No maxBet

      for (let i = 0; i < 20; i++) {
        dalembert.recordResult("loss");
      }

      const state = dalembert.getState();

      expect(state.sessionActive).toBe(true);
      expect(state.reachedLimit).toBe(false);
      expect(state.currentBet).toBe(210); // 10 + 20*10
    });
  });

  describe("recordResult - mixed results", () => {
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
      expect(state.sessionActive).toBe(true);
    });

    it("should gradually reduce bet after recovering from losses", () => {
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
      dalembert.initSession(10, 80);
      dalembert.recordResult("loss");
      dalembert.recordResult("loss");

      dalembert.reset();
      const state = dalembert.getState();

      expect(state.baseUnit).toBe(10);
      expect(state.currentBet).toBe(10);
      expect(state.maxBet).toBe(80);
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
      expect(state.reachedLimit).toBe(false);
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
    it("should handle exact maxBet match", () => {
      dalembert.initSession(10, 40);

      dalembert.recordResult("loss"); // 10 -> 20
      dalembert.recordResult("loss"); // 20 -> 30
      dalembert.recordResult("loss"); // 30 -> 40 (exactly maxBet)

      const state = dalembert.getState();

      expect(state.currentBet).toBe(40);
      expect(state.sessionActive).toBe(true); // Still active

      dalembert.recordResult("loss"); // 40 -> 50 (exceeds)

      const finalState = dalembert.getState();
      expect(finalState.sessionActive).toBe(false);
      expect(finalState.reachedLimit).toBe(true);
    });

    it("should handle very long winning streak at base unit", () => {
      dalembert.initSession(10, 100);

      for (let i = 0; i < 50; i++) {
        dalembert.recordResult("win");
      }

      const state = dalembert.getState();

      expect(state.totalProfit).toBe(500); // 50 wins * 10
      expect(state.currentBet).toBe(10); // Always stays at base unit
      expect(state.sessionActive).toBe(true);
    });

    it("should handle recovery scenario with multiple wins", () => {
      dalembert.initSession(10, 100);

      // Build up to 50
      dalembert.recordResult("loss"); // 10 -> 20
      dalembert.recordResult("loss"); // 20 -> 30
      dalembert.recordResult("loss"); // 30 -> 40
      dalembert.recordResult("loss"); // 40 -> 50

      // profit: -100 (10+20+30+40)
      expect(dalembert.getState().totalProfit).toBe(-100);

      // Win and decrease
      dalembert.recordResult("win"); // 50 -> 40, profit: -50
      dalembert.recordResult("win"); // 40 -> 30, profit: -10
      dalembert.recordResult("win"); // 30 -> 20, profit: +20
      dalembert.recordResult("win"); // 20 -> 10, profit: +40

      const state = dalembert.getState();
      expect(state.currentBet).toBe(10);
      expect(state.totalProfit).toBe(40);
    });
  });
});
