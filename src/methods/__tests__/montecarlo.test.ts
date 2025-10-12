import { describe, it, expect, beforeEach } from "vitest";
import { MonteCarloMethod } from "../montecarlo.js";

describe("MonteCarloMethod", () => {
  let monteCarlo: MonteCarloMethod;

  beforeEach(() => {
    monteCarlo = new MonteCarloMethod();
  });

  describe("initSession", () => {
    it("should initialize with default sequence [1, 2, 3]", () => {
      monteCarlo.initSession(10);
      const state = monteCarlo.getState();

      expect(state.sequence).toEqual([1, 2, 3]);
      expect(state.baseUnit).toBe(10);
      expect(state.currentBet).toBe(40); // (1 + 3) * 10
      expect(state.totalProfit).toBe(0);
      expect(state.sessionActive).toBe(true);
    });

    it("should calculate correct initial bet", () => {
      monteCarlo.initSession(5);
      const state = monteCarlo.getState();

      expect(state.currentBet).toBe(20); // (1 + 3) * 5
    });
  });

  describe("recordResult - win", () => {
    beforeEach(() => {
      monteCarlo.initSession(10);
    });

    it("should remove first and last numbers on win", () => {
      monteCarlo.recordResult("win");
      const state = monteCarlo.getState();

      expect(state.sequence).toEqual([2]);
      expect(state.totalProfit).toBe(40); // Previous bet was 40
    });

    it("should complete session when sequence has 1 element and win", () => {
      monteCarlo.recordResult("win"); // [2]
      monteCarlo.recordResult("win"); // []
      const state = monteCarlo.getState();

      expect(state.sequence).toEqual([]);
      expect(state.sessionActive).toBe(false);
      expect(state.currentBet).toBe(0);
    });

    it("should update profit correctly on consecutive wins", () => {
      monteCarlo.recordResult("win"); // +40, sequence: [2]
      monteCarlo.recordResult("win"); // +20, sequence: []
      const state = monteCarlo.getState();

      expect(state.totalProfit).toBe(60); // 40 + 20
    });
  });

  describe("recordResult - loss", () => {
    beforeEach(() => {
      monteCarlo.initSession(10);
    });

    it("should add lost units to end of sequence on loss", () => {
      monteCarlo.recordResult("loss");
      const state = monteCarlo.getState();

      expect(state.sequence).toEqual([1, 2, 3, 4]); // Lost 4 units (40 / 10)
      expect(state.totalProfit).toBe(-40);
    });

    it("should calculate next bet correctly after loss", () => {
      monteCarlo.recordResult("loss");
      const state = monteCarlo.getState();

      expect(state.currentBet).toBe(50); // (1 + 4) * 10
    });

    it("should handle consecutive losses", () => {
      monteCarlo.recordResult("loss"); // [1, 2, 3, 4], bet: 50, profit: -40
      monteCarlo.recordResult("loss"); // [1, 2, 3, 4, 5], bet: 60, profit: -90
      const state = monteCarlo.getState();

      expect(state.sequence).toEqual([1, 2, 3, 4, 5]);
      expect(state.currentBet).toBe(60); // (1 + 5) * 10
      expect(state.totalProfit).toBe(-90); // -40 + -50
    });
  });

  describe("recordResult - mixed results", () => {
    beforeEach(() => {
      monteCarlo.initSession(10);
    });

    it("should handle win-loss-win pattern", () => {
      monteCarlo.recordResult("win"); // +40, [2], bet: 20
      monteCarlo.recordResult("loss"); // -20, [2, 2], bet: 40
      monteCarlo.recordResult("win"); // +40, [], bet: 0
      const state = monteCarlo.getState();

      expect(state.totalProfit).toBe(60); // 40 - 20 + 40
      expect(state.sessionActive).toBe(false);
    });
  });

  describe("getState", () => {
    it("should return a copy of state", () => {
      monteCarlo.initSession(10);
      const state1 = monteCarlo.getState();
      const state2 = monteCarlo.getState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Different objects
    });

    it("should not allow external modification of state", () => {
      monteCarlo.initSession(10);
      const state = monteCarlo.getState();
      state.sequence.push(999);

      const actualState = monteCarlo.getState();
      expect(actualState.sequence).not.toContain(999);
    });
  });

  describe("reset", () => {
    it("should reset to initial session state", () => {
      monteCarlo.initSession(10);
      monteCarlo.recordResult("win");
      monteCarlo.recordResult("loss");

      monteCarlo.reset();
      const state = monteCarlo.getState();

      expect(state.sequence).toEqual([1, 2, 3]);
      expect(state.baseUnit).toBe(10);
      expect(state.currentBet).toBe(40);
      expect(state.totalProfit).toBe(0);
      expect(state.sessionActive).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should throw error when recording result without active session", () => {
      expect(() => {
        monteCarlo.recordResult("win");
      }).toThrow("No active session");
    });

    it("should throw error when recording after session is completed", () => {
      monteCarlo.initSession(10);
      monteCarlo.recordResult("win"); // [2]
      monteCarlo.recordResult("win"); // [] - session complete

      expect(() => {
        monteCarlo.recordResult("win");
      }).toThrow("No active session");
    });
  });
});
