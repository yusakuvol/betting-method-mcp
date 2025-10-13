import { beforeEach, describe, expect, it } from "vitest";
import { OscarsGrindMethod } from "../oscarsgrind.js";

describe("OscarsGrindMethod", () => {
  let oscarsGrind: OscarsGrindMethod;

  beforeEach(() => {
    oscarsGrind = new OscarsGrindMethod();
  });

  describe("initSession", () => {
    it("should initialize with provided parameters", () => {
      oscarsGrind.initSession(10, 1, 5);
      const state = oscarsGrind.getState();

      expect(state.baseUnit).toBe(10);
      expect(state.currentBet).toBe(10);
      expect(state.currentBetUnits).toBe(1);
      expect(state.maxBetUnits).toBe(5);
      expect(state.targetProfitUnits).toBe(1);
      expect(state.currentProfitUnits).toBe(0);
      expect(state.totalProfit).toBe(0);
      expect(state.sessionActive).toBe(true);
      expect(state.sessionsCompleted).toBe(0);
    });

    it("should use default targetProfitUnits of 1 if not provided", () => {
      oscarsGrind.initSession(10);
      const state = oscarsGrind.getState();

      expect(state.targetProfitUnits).toBe(1);
      expect(state.maxBetUnits).toBe(10); // targetProfitUnits * 10
    });

    it("should use default maxBetUnits if not provided", () => {
      oscarsGrind.initSession(10, 2);
      const state = oscarsGrind.getState();

      expect(state.maxBetUnits).toBe(20); // targetProfitUnits * 10
    });

    it("should throw error if baseUnit is zero or negative", () => {
      expect(() => {
        oscarsGrind.initSession(0);
      }).toThrow("baseUnit must be positive");

      expect(() => {
        oscarsGrind.initSession(-5);
      }).toThrow("baseUnit must be positive");
    });

    it("should throw error if targetProfitUnits is zero or negative", () => {
      expect(() => {
        oscarsGrind.initSession(10, 0);
      }).toThrow("targetProfitUnits must be positive");

      expect(() => {
        oscarsGrind.initSession(10, -1);
      }).toThrow("targetProfitUnits must be positive");
    });

    it("should throw error if maxBetUnits is less than 1", () => {
      expect(() => {
        oscarsGrind.initSession(10, 1, 0);
      }).toThrow("maxBetUnits must be at least 1");
    });
  });

  describe("recordResult - win", () => {
    beforeEach(() => {
      oscarsGrind.initSession(10, 1, 5);
    });

    it("should increase bet by 1 unit on win when below target", () => {
      oscarsGrind.recordResult("loss"); // profit: -1 unit
      oscarsGrind.recordResult("win"); // profit: 0 units, bet should stay 1
      const state = oscarsGrind.getState();

      expect(state.currentProfitUnits).toBe(0);
      expect(state.currentBetUnits).toBe(2); // Increased after win while below target
      expect(state.currentBet).toBe(20);
    });

    it("should update profit correctly on win", () => {
      oscarsGrind.recordResult("win");
      const state = oscarsGrind.getState();

      expect(state.totalProfit).toBe(10);
      expect(state.currentProfitUnits).toBe(0); // Session completed, reset to 0
      expect(state.sessionsCompleted).toBe(1);
    });

    it("should complete session when target profit is reached", () => {
      oscarsGrind.recordResult("win"); // +1 unit -> target reached
      const state = oscarsGrind.getState();

      expect(state.currentProfitUnits).toBe(0); // Reset for new session
      expect(state.currentBetUnits).toBe(1); // Reset to 1 unit
      expect(state.currentBet).toBe(10);
      expect(state.sessionsCompleted).toBe(1);
      expect(state.totalProfit).toBe(10);
    });

    it("should not exceed maxBetUnits", () => {
      oscarsGrind.initSession(10, 3, 2); // maxBetUnits = 2

      oscarsGrind.recordResult("loss"); // profit: -1
      oscarsGrind.recordResult("win"); // profit: 0, bet increases to 2
      oscarsGrind.recordResult("win"); // profit: 2, bet should stay at 2 (max)

      const state = oscarsGrind.getState();

      expect(state.currentBetUnits).toBe(2); // Should not exceed max
      expect(state.currentProfitUnits).toBe(2);
    });
  });

  describe("recordResult - loss", () => {
    beforeEach(() => {
      oscarsGrind.initSession(10, 1, 5);
    });

    it("should keep bet the same on loss", () => {
      oscarsGrind.recordResult("loss");
      const state = oscarsGrind.getState();

      expect(state.currentBetUnits).toBe(1); // Stays the same
      expect(state.currentBet).toBe(10);
      expect(state.currentProfitUnits).toBe(-1);
    });

    it("should update profit correctly on loss", () => {
      oscarsGrind.recordResult("loss");
      const state = oscarsGrind.getState();

      expect(state.totalProfit).toBe(-10);
      expect(state.currentProfitUnits).toBe(-1);
    });

    it("should not change bet after consecutive losses", () => {
      oscarsGrind.recordResult("loss");
      oscarsGrind.recordResult("loss");
      oscarsGrind.recordResult("loss");
      const state = oscarsGrind.getState();

      expect(state.currentBetUnits).toBe(1); // Still 1 unit
      expect(state.currentBet).toBe(10);
      expect(state.currentProfitUnits).toBe(-3);
      expect(state.totalProfit).toBe(-30);
    });
  });

  describe("recordResult - mixed results", () => {
    beforeEach(() => {
      oscarsGrind.initSession(10, 1, 5);
    });

    it("should follow the example from the issue", () => {
      // 1st bet: 10 (1 unit) -> loss, profit -1 unit
      oscarsGrind.recordResult("loss");
      let state = oscarsGrind.getState();
      expect(state.currentBetUnits).toBe(1);
      expect(state.currentProfitUnits).toBe(-1);
      expect(state.totalProfit).toBe(-10);

      // 2nd bet: 10 (1 unit) -> loss, profit -2 units
      oscarsGrind.recordResult("loss");
      state = oscarsGrind.getState();
      expect(state.currentBetUnits).toBe(1);
      expect(state.currentProfitUnits).toBe(-2);
      expect(state.totalProfit).toBe(-20);

      // 3rd bet: 10 (1 unit) -> win, profit -1 unit
      oscarsGrind.recordResult("win");
      state = oscarsGrind.getState();
      expect(state.currentBetUnits).toBe(2); // Increased after win
      expect(state.currentProfitUnits).toBe(-1);
      expect(state.totalProfit).toBe(-10);

      // 4th bet: 20 (2 units) -> win, profit +1 unit -> session complete
      oscarsGrind.recordResult("win");
      state = oscarsGrind.getState();
      expect(state.currentBetUnits).toBe(1); // Reset for new session
      expect(state.currentProfitUnits).toBe(0); // Reset for new session
      expect(state.totalProfit).toBe(10);
      expect(state.sessionsCompleted).toBe(1);

      // 5th bet: 10 (1 unit) -> new session
      oscarsGrind.recordResult("win");
      state = oscarsGrind.getState();
      expect(state.sessionsCompleted).toBe(2);
      expect(state.totalProfit).toBe(20);
    });

    it("should handle recovery from deep losses", () => {
      // Multiple losses
      oscarsGrind.recordResult("loss"); // -1 unit
      oscarsGrind.recordResult("loss"); // -2 units
      oscarsGrind.recordResult("loss"); // -3 units
      oscarsGrind.recordResult("loss"); // -4 units

      // Start winning
      oscarsGrind.recordResult("win"); // -3 units, bet increases to 2
      oscarsGrind.recordResult("win"); // -1 unit, bet increases to 3
      oscarsGrind.recordResult("win"); // +2 units -> exceeds target, session complete

      const state = oscarsGrind.getState();

      expect(state.sessionsCompleted).toBe(1);
      expect(state.currentProfitUnits).toBe(0); // New session started
      expect(state.currentBetUnits).toBe(1);
      expect(state.totalProfit).toBe(20); // -40 + 60 = 20
    });

    it("should handle multiple session completions", () => {
      // Session 1
      oscarsGrind.recordResult("win");
      let state = oscarsGrind.getState();
      expect(state.sessionsCompleted).toBe(1);

      // Session 2
      oscarsGrind.recordResult("win");
      state = oscarsGrind.getState();
      expect(state.sessionsCompleted).toBe(2);

      // Session 3
      oscarsGrind.recordResult("win");
      state = oscarsGrind.getState();
      expect(state.sessionsCompleted).toBe(3);

      expect(state.totalProfit).toBe(30); // 3 sessions * 10 profit each
    });
  });

  describe("getState", () => {
    it("should return a copy of state", () => {
      oscarsGrind.initSession(10);
      const state1 = oscarsGrind.getState();
      const state2 = oscarsGrind.getState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Different objects
    });

    it("should not allow external modification of state", () => {
      oscarsGrind.initSession(10);
      const state = oscarsGrind.getState();

      state.currentBetUnits = 999;
      const newState = oscarsGrind.getState();

      expect(newState.currentBetUnits).toBe(1); // Unchanged
    });
  });

  describe("reset", () => {
    it("should reset session with same parameters", () => {
      oscarsGrind.initSession(10, 2, 5);
      oscarsGrind.recordResult("loss");
      oscarsGrind.recordResult("win");
      oscarsGrind.recordResult("win");

      oscarsGrind.reset();
      const state = oscarsGrind.getState();

      expect(state.baseUnit).toBe(10);
      expect(state.currentBet).toBe(10);
      expect(state.currentBetUnits).toBe(1);
      expect(state.maxBetUnits).toBe(5);
      expect(state.targetProfitUnits).toBe(2);
      expect(state.currentProfitUnits).toBe(0);
      expect(state.totalProfit).toBe(0);
      expect(state.sessionActive).toBe(true);
      expect(state.sessionsCompleted).toBe(0);
    });
  });

  describe("error handling", () => {
    it("should throw error when recording result without active session", () => {
      expect(() => {
        oscarsGrind.recordResult("win");
      }).toThrow("No active session");
    });
  });

  describe("edge cases", () => {
    it("should handle target profit of multiple units", () => {
      oscarsGrind.initSession(10, 3, 10);

      oscarsGrind.recordResult("win"); // +1 unit, profit: 1
      oscarsGrind.recordResult("win"); // +2 units, profit: 3 -> target reached

      const state = oscarsGrind.getState();

      expect(state.sessionsCompleted).toBe(1);
      expect(state.currentProfitUnits).toBe(0);
      expect(state.totalProfit).toBe(30); // 10 + 20
    });

    it("should handle exact target profit match", () => {
      oscarsGrind.initSession(10, 5, 10);

      oscarsGrind.recordResult("win"); // +1, profit: 1
      oscarsGrind.recordResult("win"); // +2, profit: 3
      oscarsGrind.recordResult("win"); // +3, profit: 6 -> exceeds 5, session complete

      const state = oscarsGrind.getState();

      expect(state.sessionsCompleted).toBe(1);
      expect(state.totalProfit).toBe(60);
    });

    it("should handle very long losing streak followed by recovery", () => {
      oscarsGrind.initSession(10, 1, 20);

      // 10 consecutive losses
      for (let i = 0; i < 10; i++) {
        oscarsGrind.recordResult("loss");
      }

      let state = oscarsGrind.getState();
      expect(state.currentProfitUnits).toBe(-10);
      expect(state.currentBetUnits).toBe(1); // Still 1 unit

      // Now win to start recovery
      oscarsGrind.recordResult("win"); // profit: -9, bet increases to 2
      state = oscarsGrind.getState();
      expect(state.currentBetUnits).toBe(2);
      expect(state.currentProfitUnits).toBe(-9);
    });

    it("should handle maxBetUnits constraint during recovery", () => {
      oscarsGrind.initSession(10, 1, 3);

      oscarsGrind.recordResult("loss"); // -1
      oscarsGrind.recordResult("win"); // 0, bet -> 2
      oscarsGrind.recordResult("loss"); // -2
      oscarsGrind.recordResult("win"); // 0, bet -> 3 (max)
      oscarsGrind.recordResult("loss"); // -3
      oscarsGrind.recordResult("win"); // 0, bet stays at 3 (max)

      const state = oscarsGrind.getState();

      expect(state.currentBetUnits).toBe(3); // At max
      expect(state.currentProfitUnits).toBe(0);
    });
  });
});
