import { beforeEach, describe, expect, it } from "vitest";
import { GoodmanMethod } from "../goodman.js";

describe("GoodmanMethod", () => {
  let goodman: GoodmanMethod;

  beforeEach(() => {
    goodman = new GoodmanMethod();
  });

  describe("initSession", () => {
    it("should initialize with provided base unit", () => {
      goodman.initSession(10);
      const state = goodman.getState();

      expect(state.baseUnit).toBe(10);
      expect(state.currentBet).toBe(10); // 1 * 10
      expect(state.currentStep).toBe(0);
      expect(state.winStreak).toBe(0);
      expect(state.totalProfit).toBe(0);
      expect(state.sessionActive).toBe(true);
      expect(state.cyclesCompleted).toBe(0);
      expect(state.sequence).toEqual([1, 2, 3, 5]);
    });

    it("should throw error if baseUnit is zero or negative", () => {
      expect(() => {
        goodman.initSession(0);
      }).toThrow("baseUnit must be positive");

      expect(() => {
        goodman.initSession(-5);
      }).toThrow("baseUnit must be positive");
    });
  });

  describe("recordResult - win progression", () => {
    beforeEach(() => {
      goodman.initSession(10);
    });

    it("should progress from 1 to 2 units on first win", () => {
      goodman.recordResult("win");
      const state = goodman.getState();

      expect(state.currentBet).toBe(20); // 2 * 10
      expect(state.currentStep).toBe(1);
      expect(state.winStreak).toBe(1);
      expect(state.totalProfit).toBe(10);
    });

    it("should progress through full sequence: 1→2→3→5", () => {
      goodman.recordResult("win"); // 1 unit, profit +10
      expect(goodman.getState().currentBet).toBe(20); // 2 units

      goodman.recordResult("win"); // 2 units, profit +30
      expect(goodman.getState().currentBet).toBe(30); // 3 units

      goodman.recordResult("win"); // 3 units, profit +60
      expect(goodman.getState().currentBet).toBe(50); // 5 units

      const state = goodman.getState();
      expect(state.currentStep).toBe(3);
      expect(state.winStreak).toBe(3);
      expect(state.totalProfit).toBe(60);
      expect(state.cyclesCompleted).toBe(1);
    });

    it("should stay at 5 units after reaching the top", () => {
      // Progress to 5 units
      goodman.recordResult("win"); // 1 → 2
      goodman.recordResult("win"); // 2 → 3
      goodman.recordResult("win"); // 3 → 5

      expect(goodman.getState().cyclesCompleted).toBe(1);

      // Continue winning at 5 units
      goodman.recordResult("win"); // 5 → 5
      goodman.recordResult("win"); // 5 → 5

      const state = goodman.getState();
      expect(state.currentBet).toBe(50); // Still 5 units
      expect(state.currentStep).toBe(3);
      expect(state.winStreak).toBe(5);
      expect(state.totalProfit).toBe(160); // 10+20+30+50+50
      expect(state.cyclesCompleted).toBe(1); // Should not increment again
    });
  });

  describe("recordResult - loss behavior", () => {
    beforeEach(() => {
      goodman.initSession(10);
    });

    it("should reset to 1 unit on loss", () => {
      goodman.recordResult("win"); // 1 → 2
      goodman.recordResult("win"); // 2 → 3
      goodman.recordResult("loss"); // Reset to 1

      const state = goodman.getState();
      expect(state.currentBet).toBe(10); // 1 * 10
      expect(state.currentStep).toBe(0);
      expect(state.winStreak).toBe(0);
      expect(state.totalProfit).toBe(0); // +10+20-30 = 0
    });

    it("should reset from 5 units to 1 unit on loss", () => {
      // Progress to 5 units
      goodman.recordResult("win"); // 1 → 2
      goodman.recordResult("win"); // 2 → 3
      goodman.recordResult("win"); // 3 → 5
      goodman.recordResult("win"); // 5 → 5

      goodman.recordResult("loss"); // Reset to 1

      const state = goodman.getState();
      expect(state.currentBet).toBe(10); // 1 * 10
      expect(state.currentStep).toBe(0);
      expect(state.winStreak).toBe(0);
      expect(state.totalProfit).toBe(60); // 10+20+30+50-50
    });

    it("should handle immediate loss", () => {
      goodman.recordResult("loss");

      const state = goodman.getState();
      expect(state.currentBet).toBe(10); // Still 1 unit
      expect(state.currentStep).toBe(0);
      expect(state.winStreak).toBe(0);
      expect(state.totalProfit).toBe(-10);
    });
  });

  describe("recordResult - mixed win/loss scenarios", () => {
    beforeEach(() => {
      goodman.initSession(10);
    });

    it("should handle alternating wins and losses", () => {
      goodman.recordResult("win"); // +10, bet now 20
      goodman.recordResult("loss"); // -20, bet now 10
      goodman.recordResult("win"); // +10, bet now 20
      goodman.recordResult("loss"); // -20, bet now 10

      const state = goodman.getState();
      expect(state.totalProfit).toBe(-20); // +10-20+10-20
      expect(state.currentBet).toBe(10);
    });

    it("should track profit correctly through complex sequence", () => {
      goodman.recordResult("win"); // +10 (bet was 10), now 20
      goodman.recordResult("win"); // +20 (bet was 20), now 30
      goodman.recordResult("loss"); // -30 (bet was 30), now 10
      goodman.recordResult("win"); // +10 (bet was 10), now 20
      goodman.recordResult("win"); // +20 (bet was 20), now 30
      goodman.recordResult("win"); // +30 (bet was 30), now 50

      const state = goodman.getState();
      expect(state.totalProfit).toBe(60); // 10+20-30+10+20+30
      expect(state.currentBet).toBe(50);
    });
  });

  describe("getState", () => {
    it("should return a copy of state", () => {
      goodman.initSession(10);
      const state1 = goodman.getState();
      const state2 = goodman.getState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Different objects
    });

    it("should not allow modification of internal state through returned state", () => {
      goodman.initSession(10);
      const state = goodman.getState();

      // Try to modify the returned state
      state.sequence.push(999);
      state.currentBet = 9999;

      const actualState = goodman.getState();
      expect(actualState.sequence).toEqual([1, 2, 3, 5]);
      expect(actualState.currentBet).toBe(10);
    });
  });

  describe("reset", () => {
    it("should reset to initial session state", () => {
      goodman.initSession(10);
      goodman.recordResult("win");
      goodman.recordResult("win");
      goodman.recordResult("win");

      goodman.reset();
      const state = goodman.getState();

      expect(state.baseUnit).toBe(10);
      expect(state.currentBet).toBe(10);
      expect(state.currentStep).toBe(0);
      expect(state.winStreak).toBe(0);
      expect(state.totalProfit).toBe(0);
      expect(state.sessionActive).toBe(true);
      expect(state.cyclesCompleted).toBe(0);
    });
  });

  describe("error handling", () => {
    it("should throw error when recording result without active session", () => {
      expect(() => {
        goodman.recordResult("win");
      }).toThrow("No active session");
    });

    it("should maintain session after recording results", () => {
      goodman.initSession(10);
      goodman.recordResult("win");
      goodman.recordResult("loss");
      goodman.recordResult("win");

      const state = goodman.getState();
      expect(state.sessionActive).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle very long winning streak correctly", () => {
      goodman.initSession(10);

      // Win 10 times
      for (let i = 0; i < 10; i++) {
        goodman.recordResult("win");
      }

      const state = goodman.getState();
      expect(state.currentBet).toBe(50); // Should stay at 5 units
      expect(state.currentStep).toBe(3);
      expect(state.winStreak).toBe(10);
      // Profit: 10+20+30 + (50*7) = 60 + 350 = 410
      expect(state.totalProfit).toBe(410);
      expect(state.cyclesCompleted).toBe(1);
    });

    it("should handle multiple cycles with losses in between", () => {
      goodman.initSession(10);

      // First cycle to 5
      goodman.recordResult("win"); // 10
      goodman.recordResult("win"); // 20
      goodman.recordResult("win"); // 30 - cycle 1
      expect(goodman.getState().cyclesCompleted).toBe(1);

      goodman.recordResult("loss"); // -50

      // Second cycle to 5
      goodman.recordResult("win"); // 10
      goodman.recordResult("win"); // 20
      goodman.recordResult("win"); // 30 - cycle 2

      const state = goodman.getState();
      expect(state.cyclesCompleted).toBe(2);
      expect(state.totalProfit).toBe(70); // 10+20+30-50+10+20+30 = 70
    });

    it("should handle large base unit values", () => {
      goodman.initSession(1000);

      goodman.recordResult("win");
      goodman.recordResult("win");
      goodman.recordResult("win");

      const state = goodman.getState();
      expect(state.currentBet).toBe(5000); // 5 * 1000
      expect(state.totalProfit).toBe(6000); // 1000+2000+3000
    });

    it("should handle fractional base unit values", () => {
      goodman.initSession(0.5);

      goodman.recordResult("win");
      goodman.recordResult("win");

      const state = goodman.getState();
      expect(state.currentBet).toBe(1.5); // 3 * 0.5
      expect(state.totalProfit).toBe(1.5); // 0.5+1.0
    });
  });

  describe("cyclesCompleted tracking", () => {
    beforeEach(() => {
      goodman.initSession(10);
    });

    it("should not increment cyclesCompleted until reaching step 3", () => {
      goodman.recordResult("win"); // step 1
      expect(goodman.getState().cyclesCompleted).toBe(0);

      goodman.recordResult("win"); // step 2
      expect(goodman.getState().cyclesCompleted).toBe(0);

      goodman.recordResult("win"); // step 3 (5 units) - FIRST TIME
      expect(goodman.getState().cyclesCompleted).toBe(1);
    });

    it("should not increment cyclesCompleted when already at step 3", () => {
      goodman.recordResult("win"); // step 1
      goodman.recordResult("win"); // step 2
      goodman.recordResult("win"); // step 3 - cycle 1
      expect(goodman.getState().cyclesCompleted).toBe(1);

      goodman.recordResult("win"); // still step 3
      expect(goodman.getState().cyclesCompleted).toBe(1);

      goodman.recordResult("win"); // still step 3
      expect(goodman.getState().cyclesCompleted).toBe(1);
    });

    it("should increment cyclesCompleted each time reaching step 3 from below", () => {
      // First cycle
      goodman.recordResult("win"); // step 1
      goodman.recordResult("win"); // step 2
      goodman.recordResult("win"); // step 3 - cycle 1
      expect(goodman.getState().cyclesCompleted).toBe(1);

      goodman.recordResult("loss"); // reset to step 0

      // Second cycle
      goodman.recordResult("win"); // step 1
      goodman.recordResult("win"); // step 2
      goodman.recordResult("win"); // step 3 - cycle 2
      expect(goodman.getState().cyclesCompleted).toBe(2);
    });
  });
});
