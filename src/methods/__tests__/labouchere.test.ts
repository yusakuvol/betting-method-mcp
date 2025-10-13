import { beforeEach, describe, expect, it } from "vitest";
import { LabouchereMethod } from "../labouchere.js";

describe("LabouchereMethod", () => {
  let labouchere: LabouchereMethod;

  beforeEach(() => {
    labouchere = new LabouchereMethod();
  });

  describe("initSession", () => {
    it("should initialize with provided parameters and custom sequence", () => {
      labouchere.initSession(10, 10, [1, 2, 3, 4]);
      const state = labouchere.getState();

      expect(state.baseUnit).toBe(10);
      expect(state.sequence).toEqual([1, 2, 3, 4]);
      expect(state.initialSequence).toEqual([1, 2, 3, 4]);
      expect(state.targetProfit).toBe(10);
      expect(state.currentBet).toBe(50); // (1 + 4) * 10
      expect(state.totalProfit).toBe(0);
      expect(state.sessionActive).toBe(true);
      expect(state.sessionsCompleted).toBe(0);
      expect(state.reachedLimit).toBe(false);
    });

    it("should generate balanced sequence when not provided", () => {
      labouchere.initSession(10, 10);
      const state = labouchere.getState();

      expect(state.sequence.reduce((a, b) => a + b, 0)).toBe(10);
      expect(state.targetProfit).toBe(10);
      expect(state.sessionActive).toBe(true);
    });

    it("should use default maxSequenceLength if not provided", () => {
      labouchere.initSession(10, 10, [1, 2, 3, 4]);
      const state = labouchere.getState();

      expect(state.maxSequenceLength).toBe(20);
    });

    it("should accept custom maxSequenceLength", () => {
      labouchere.initSession(10, 10, [1, 2, 3, 4], 30);
      const state = labouchere.getState();

      expect(state.maxSequenceLength).toBe(30);
    });

    it("should throw error if baseUnit is zero or negative", () => {
      expect(() => {
        labouchere.initSession(0, 10, [1, 2, 3, 4]);
      }).toThrow("baseUnit must be positive");

      expect(() => {
        labouchere.initSession(-5, 10, [1, 2, 3, 4]);
      }).toThrow("baseUnit must be positive");
    });

    it("should throw error if targetProfit is zero or negative", () => {
      expect(() => {
        labouchere.initSession(10, 0, []);
      }).toThrow("targetProfit must be positive");

      expect(() => {
        labouchere.initSession(10, -10, [1, 2, 3]);
      }).toThrow("targetProfit must be positive");
    });

    it("should throw error if initialSequence contains non-positive numbers", () => {
      expect(() => {
        labouchere.initSession(10, 10, [1, 0, 3, 4]);
      }).toThrow("All numbers in initialSequence must be positive");

      expect(() => {
        labouchere.initSession(10, 10, [1, -2, 3, 4]);
      }).toThrow("All numbers in initialSequence must be positive");
    });

    it("should throw error if initialSequence sum does not equal targetProfit", () => {
      expect(() => {
        labouchere.initSession(10, 10, [1, 2, 3]); // sum is 6, not 10
      }).toThrow("Sum of initialSequence (6) must equal targetProfit (10)");
    });

    it("should throw error if maxSequenceLength is less than initialSequence length", () => {
      expect(() => {
        labouchere.initSession(10, 10, [1, 2, 3, 4], 3);
      }).toThrow("maxSequenceLength must be at least as long as initialSequence");
    });

    it("should calculate correct initial bet for different sequences", () => {
      labouchere.initSession(5, 5, [1, 1, 1, 1, 1]);
      expect(labouchere.getState().currentBet).toBe(10); // (1 + 1) * 5

      labouchere.initSession(10, 20, [2, 4, 6, 8]);
      expect(labouchere.getState().currentBet).toBe(100); // (2 + 8) * 10
    });
  });

  describe("recordResult - win", () => {
    beforeEach(() => {
      labouchere.initSession(10, 10, [1, 2, 3, 4]);
    });

    it("should remove first and last numbers on win", () => {
      labouchere.recordResult("win");
      const state = labouchere.getState();

      expect(state.sequence).toEqual([2, 3]);
      expect(state.totalProfit).toBe(50); // Previous bet was 50
      expect(state.sessionActive).toBe(true);
    });

    it("should calculate next bet correctly after win", () => {
      labouchere.recordResult("win"); // [2, 3]
      const state = labouchere.getState();

      expect(state.currentBet).toBe(50); // (2 + 3) * 10
    });

    it("should complete session when sequence becomes empty", () => {
      labouchere.recordResult("win"); // [2, 3], bet: 50
      labouchere.recordResult("win"); // [], session complete
      const state = labouchere.getState();

      expect(state.sequence).toEqual([]);
      expect(state.sessionActive).toBe(false);
      expect(state.currentBet).toBe(0);
      expect(state.sessionsCompleted).toBe(1);
      expect(state.totalProfit).toBe(100); // 50 + 50
    });

    it("should handle single element sequence correctly", () => {
      labouchere.initSession(10, 5, [5]);
      const state1 = labouchere.getState();
      expect(state1.currentBet).toBe(50); // 5 * 10

      labouchere.recordResult("win");
      const state2 = labouchere.getState();
      expect(state2.sequence).toEqual([]);
      expect(state2.sessionActive).toBe(false);
      expect(state2.totalProfit).toBe(50);
    });

    it("should update profit correctly on consecutive wins", () => {
      labouchere.recordResult("win"); // +50, [2, 3]
      labouchere.recordResult("win"); // +50, []
      const state = labouchere.getState();

      expect(state.totalProfit).toBe(100);
    });
  });

  describe("recordResult - loss", () => {
    beforeEach(() => {
      labouchere.initSession(10, 10, [1, 2, 3, 4]);
    });

    it("should add lost units to end of sequence on loss", () => {
      labouchere.recordResult("loss");
      const state = labouchere.getState();

      expect(state.sequence).toEqual([1, 2, 3, 4, 5]); // Lost 5 units (50 / 10)
      expect(state.totalProfit).toBe(-50);
      expect(state.sessionActive).toBe(true);
    });

    it("should calculate next bet correctly after loss", () => {
      labouchere.recordResult("loss");
      const state = labouchere.getState();

      expect(state.currentBet).toBe(60); // (1 + 5) * 10
    });

    it("should handle consecutive losses", () => {
      labouchere.recordResult("loss"); // [1, 2, 3, 4, 5], bet: 60, profit: -50
      labouchere.recordResult("loss"); // [1, 2, 3, 4, 5, 6], bet: 70, profit: -110
      const state = labouchere.getState();

      expect(state.sequence).toEqual([1, 2, 3, 4, 5, 6]);
      expect(state.currentBet).toBe(70); // (1 + 6) * 10
      expect(state.totalProfit).toBe(-110); // -50 + -60
    });

    it("should end session when maxSequenceLength is exceeded", () => {
      labouchere.initSession(10, 10, [1, 2, 3, 4], 6);

      labouchere.recordResult("loss"); // [1, 2, 3, 4, 5], length: 5
      expect(labouchere.getState().sessionActive).toBe(true);

      labouchere.recordResult("loss"); // [1, 2, 3, 4, 5, 6], length: 6
      expect(labouchere.getState().sessionActive).toBe(true);

      labouchere.recordResult("loss"); // [1, 2, 3, 4, 5, 6, 7], length: 7 (exceeds 6)
      const state = labouchere.getState();

      expect(state.sessionActive).toBe(false);
      expect(state.reachedLimit).toBe(true);
      expect(state.currentBet).toBe(0);
    });
  });

  describe("recordResult - mixed results", () => {
    beforeEach(() => {
      labouchere.initSession(10, 10, [1, 2, 3, 4]);
    });

    it("should handle win-loss-win pattern", () => {
      labouchere.recordResult("win"); // +50, [2, 3], bet: 50
      labouchere.recordResult("loss"); // -50, [2, 3, 5], bet: 70
      labouchere.recordResult("win"); // +70, [3], bet: 30
      const state = labouchere.getState();

      expect(state.sequence).toEqual([3]);
      expect(state.totalProfit).toBe(70); // 50 - 50 + 70
      expect(state.sessionActive).toBe(true);
    });

    it("should match example from issue description", () => {
      // Example: target 10, sequence [1, 2, 3, 4], base 10
      labouchere.initSession(10, 10, [1, 2, 3, 4]);

      // 1st bet: 50 (1+4=5 units) → win
      expect(labouchere.getState().currentBet).toBe(50);
      labouchere.recordResult("win");
      expect(labouchere.getState().sequence).toEqual([2, 3]);

      // 2nd bet: 50 (2+3=5 units) → loss
      expect(labouchere.getState().currentBet).toBe(50);
      labouchere.recordResult("loss");
      expect(labouchere.getState().sequence).toEqual([2, 3, 5]);

      // 3rd bet: 70 (2+5=7 units) → win
      expect(labouchere.getState().currentBet).toBe(70);
      labouchere.recordResult("win");
      expect(labouchere.getState().sequence).toEqual([3]);

      // 4th bet: 30 (3 units) → win
      expect(labouchere.getState().currentBet).toBe(30);
      labouchere.recordResult("win");

      const state = labouchere.getState();
      expect(state.sequence).toEqual([]);
      expect(state.sessionActive).toBe(false);
      expect(state.totalProfit).toBe(100); // 50 - 50 + 70 + 30
    });

    it("should handle loss-win-loss-win pattern", () => {
      labouchere.recordResult("loss"); // -50, [1, 2, 3, 4, 5]
      labouchere.recordResult("win"); // +60, [2, 3, 4]
      labouchere.recordResult("loss"); // -60, [2, 3, 4, 6]
      labouchere.recordResult("win"); // +80, [3, 4]
      const state = labouchere.getState();

      expect(state.sequence).toEqual([3, 4]);
      expect(state.totalProfit).toBe(30); // -50 + 60 - 60 + 80
    });
  });

  describe("getState", () => {
    it("should return a copy of state", () => {
      labouchere.initSession(10, 10, [1, 2, 3, 4]);
      const state1 = labouchere.getState();
      const state2 = labouchere.getState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Different objects
    });

    it("should not allow external modification of sequence", () => {
      labouchere.initSession(10, 10, [1, 2, 3, 4]);
      const state = labouchere.getState();
      state.sequence.push(999);

      const actualState = labouchere.getState();
      expect(actualState.sequence).not.toContain(999);
      expect(actualState.sequence).toEqual([1, 2, 3, 4]);
    });

    it("should not allow external modification of initialSequence", () => {
      labouchere.initSession(10, 10, [1, 2, 3, 4]);
      const state = labouchere.getState();
      state.initialSequence.push(999);

      const actualState = labouchere.getState();
      expect(actualState.initialSequence).not.toContain(999);
      expect(actualState.initialSequence).toEqual([1, 2, 3, 4]);
    });
  });

  describe("reset", () => {
    it("should reset to initial session state", () => {
      labouchere.initSession(10, 10, [1, 2, 3, 4]);
      labouchere.recordResult("win");
      labouchere.recordResult("loss");

      labouchere.reset();
      const state = labouchere.getState();

      expect(state.sequence).toEqual([1, 2, 3, 4]);
      expect(state.initialSequence).toEqual([1, 2, 3, 4]);
      expect(state.baseUnit).toBe(10);
      expect(state.targetProfit).toBe(10);
      expect(state.currentBet).toBe(50);
      expect(state.totalProfit).toBe(0);
      expect(state.sessionActive).toBe(true);
      expect(state.sessionsCompleted).toBe(0);
      expect(state.reachedLimit).toBe(false);
    });

    it("should preserve session parameters after reset", () => {
      labouchere.initSession(5, 20, [2, 4, 6, 8], 30);
      labouchere.recordResult("loss");
      labouchere.recordResult("loss");

      labouchere.reset();
      const state = labouchere.getState();

      expect(state.baseUnit).toBe(5);
      expect(state.targetProfit).toBe(20);
      expect(state.initialSequence).toEqual([2, 4, 6, 8]);
      expect(state.maxSequenceLength).toBe(30);
    });
  });

  describe("error handling", () => {
    it("should throw error when recording result without active session", () => {
      expect(() => {
        labouchere.recordResult("win");
      }).toThrow("No active session");
    });

    it("should throw error when recording after session is completed", () => {
      labouchere.initSession(10, 10, [1, 2, 3, 4]);
      labouchere.recordResult("win"); // [2, 3]
      labouchere.recordResult("win"); // [] - session complete

      expect(() => {
        labouchere.recordResult("win");
      }).toThrow("No active session");
    });

    it("should throw error when recording after reaching limit", () => {
      labouchere.initSession(10, 10, [1, 2, 3, 4], 5);
      labouchere.recordResult("loss"); // [1, 2, 3, 4, 5]
      labouchere.recordResult("loss"); // [1, 2, 3, 4, 5, 6] - exceeds limit

      expect(() => {
        labouchere.recordResult("win");
      }).toThrow("No active session");
    });
  });

  describe("edge cases - sequence scenarios", () => {
    it("should handle empty generated sequence for target 1", () => {
      labouchere.initSession(10, 1);
      const state = labouchere.getState();

      expect(state.sequence).toEqual([1]);
      expect(state.currentBet).toBe(10);
    });

    it("should handle large target profit", () => {
      labouchere.initSession(10, 100);
      const state = labouchere.getState();

      const sum = state.sequence.reduce((a, b) => a + b, 0);
      expect(sum).toBe(100);
      expect(state.sessionActive).toBe(true);
    });

    it("should handle conservative sequence [1, 1, 1, 1, 1]", () => {
      labouchere.initSession(10, 5, [1, 1, 1, 1, 1]);
      const state = labouchere.getState();

      expect(state.currentBet).toBe(20); // (1 + 1) * 10
      expect(state.targetProfit).toBe(5);
    });

    it("should handle aggressive sequence [2, 4, 6, 8]", () => {
      labouchere.initSession(10, 20, [2, 4, 6, 8]);
      const state = labouchere.getState();

      expect(state.currentBet).toBe(100); // (2 + 8) * 10
      expect(state.targetProfit).toBe(20);
    });

    it("should set bet to 0 when sequence is empty after completion", () => {
      labouchere.initSession(10, 5, [5]);
      labouchere.recordResult("win");
      const state = labouchere.getState();

      expect(state.sequence).toEqual([]);
      expect(state.currentBet).toBe(0);
      expect(state.sessionActive).toBe(false);
    });
  });
});
