import { beforeEach, describe, expect, it } from "vitest";
import { FibonacciMethod } from "../fibonacci.js";

describe("FibonacciMethod", () => {
  let fibonacci: FibonacciMethod;

  beforeEach(() => {
    fibonacci = new FibonacciMethod();
  });

  describe("initSession", () => {
    it("should initialize with provided parameters", () => {
      fibonacci.initSession(10, 15);
      const state = fibonacci.getState();

      expect(state.baseUnit).toBe(10);
      expect(state.currentIndex).toBe(0);
      expect(state.currentBet).toBe(10); // sequence[0] * baseUnit = 1 * 10
      expect(state.maxIndex).toBe(15);
      expect(state.totalProfit).toBe(0);
      expect(state.sessionActive).toBe(true);
      expect(state.reachedLimit).toBe(false);
      expect(state.sequence.length).toBeGreaterThanOrEqual(16); // maxIndex + 1
    });

    it("should use default maxIndex if not provided", () => {
      fibonacci.initSession(10);
      const state = fibonacci.getState();

      expect(state.maxIndex).toBe(20);
    });

    it("should generate valid Fibonacci sequence", () => {
      fibonacci.initSession(10);
      const state = fibonacci.getState();

      // Check first few elements of Fibonacci sequence
      expect(state.sequence[0]).toBe(1);
      expect(state.sequence[1]).toBe(1);
      expect(state.sequence[2]).toBe(2);
      expect(state.sequence[3]).toBe(3);
      expect(state.sequence[4]).toBe(5);
      expect(state.sequence[5]).toBe(8);
      expect(state.sequence[6]).toBe(13);
      expect(state.sequence[7]).toBe(21);
      expect(state.sequence[8]).toBe(34);
      expect(state.sequence[9]).toBe(55);
    });

    it("should throw error if baseUnit is zero or negative", () => {
      expect(() => {
        fibonacci.initSession(0);
      }).toThrow("baseUnit must be positive");

      expect(() => {
        fibonacci.initSession(-5);
      }).toThrow("baseUnit must be positive");
    });

    it("should throw error if maxIndex is less than 1", () => {
      expect(() => {
        fibonacci.initSession(10, 0);
      }).toThrow("maxIndex must be at least 1");

      expect(() => {
        fibonacci.initSession(10, -1);
      }).toThrow("maxIndex must be at least 1");
    });
  });

  describe("recordResult - loss", () => {
    beforeEach(() => {
      fibonacci.initSession(10, 15);
    });

    it("should move forward one position on loss", () => {
      fibonacci.recordResult("loss");
      const state = fibonacci.getState();

      expect(state.currentIndex).toBe(1);
      expect(state.currentBet).toBe(10); // sequence[1] * baseUnit = 1 * 10
    });

    it("should update profit correctly on loss", () => {
      fibonacci.recordResult("loss");
      const state = fibonacci.getState();

      expect(state.totalProfit).toBe(-10);
    });

    it("should progress through sequence on consecutive losses", () => {
      // Index 0: bet 10 (1*10)
      fibonacci.recordResult("loss"); // Index 1: bet 10 (1*10), profit: -10
      fibonacci.recordResult("loss"); // Index 2: bet 20 (2*10), profit: -20
      fibonacci.recordResult("loss"); // Index 3: bet 30 (3*10), profit: -40
      fibonacci.recordResult("loss"); // Index 4: bet 50 (5*10), profit: -70

      const state = fibonacci.getState();

      expect(state.currentIndex).toBe(4);
      expect(state.currentBet).toBe(50); // sequence[4] = 5
      expect(state.totalProfit).toBe(-70);
    });
  });

  describe("recordResult - win", () => {
    beforeEach(() => {
      fibonacci.initSession(10, 15);
    });

    it("should move back two positions on win", () => {
      // Move to index 4 first
      fibonacci.recordResult("loss"); // index 0->1
      fibonacci.recordResult("loss"); // index 1->2
      fibonacci.recordResult("loss"); // index 2->3
      fibonacci.recordResult("loss"); // index 3->4

      fibonacci.recordResult("win"); // index 4->2

      const state = fibonacci.getState();

      expect(state.currentIndex).toBe(2);
      expect(state.currentBet).toBe(20); // sequence[2] * baseUnit = 2 * 10
    });

    it("should update profit correctly on win", () => {
      fibonacci.recordResult("loss"); // index 0->1, profit: -10
      fibonacci.recordResult("win"); // index 1->0, profit: 0

      const state = fibonacci.getState();

      expect(state.totalProfit).toBe(0);
    });

    it("should not go below index 0", () => {
      fibonacci.recordResult("loss"); // index 0->1
      fibonacci.recordResult("win"); // index 1->0 (not -1)

      const state = fibonacci.getState();

      expect(state.currentIndex).toBe(0);
      expect(state.sessionActive).toBe(false); // Session completes when returning to start
    });

    it("should end session when returning to index 0 after progression", () => {
      fibonacci.recordResult("loss"); // index 0->1
      fibonacci.recordResult("loss"); // index 1->2
      fibonacci.recordResult("win"); // index 2->0

      const state = fibonacci.getState();

      expect(state.currentIndex).toBe(0);
      expect(state.sessionActive).toBe(false);
      expect(state.currentBet).toBe(10); // Still shows first position bet
    });
  });

  describe("recordResult - limit reached", () => {
    it("should end session when maxIndex is exceeded", () => {
      fibonacci.initSession(10, 5);

      fibonacci.recordResult("loss"); // index 0->1
      fibonacci.recordResult("loss"); // index 1->2
      fibonacci.recordResult("loss"); // index 2->3
      fibonacci.recordResult("loss"); // index 3->4
      fibonacci.recordResult("loss"); // index 4->5
      fibonacci.recordResult("loss"); // index 5->6 (exceeds maxIndex 5)

      const state = fibonacci.getState();

      expect(state.sessionActive).toBe(false);
      expect(state.reachedLimit).toBe(true);
      expect(state.currentBet).toBe(0);
    });
  });

  describe("recordResult - mixed scenarios", () => {
    beforeEach(() => {
      fibonacci.initSession(10, 15);
    });

    it("should handle win-loss pattern correctly", () => {
      fibonacci.recordResult("loss"); // index 0->1, profit: -10
      fibonacci.recordResult("loss"); // index 1->2, profit: -20
      fibonacci.recordResult("loss"); // index 2->3, profit: -40
      fibonacci.recordResult("win"); // index 3->1, profit: -10 (win 30)
      fibonacci.recordResult("loss"); // index 1->2, profit: -20
      fibonacci.recordResult("win"); // index 2->0, profit: 0 (win 20)

      const state = fibonacci.getState();

      expect(state.sessionActive).toBe(false); // Returned to start
      expect(state.totalProfit).toBe(0);
    });

    it("should handle long sequence progression", () => {
      fibonacci.initSession(10, 10);

      // Progression: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89
      for (let i = 0; i < 10; i++) {
        fibonacci.recordResult("loss");
      }

      const state = fibonacci.getState();

      expect(state.currentIndex).toBe(10);
      expect(state.currentBet).toBe(890); // sequence[10] = 89
      expect(state.sessionActive).toBe(true);

      // One more loss should trigger limit
      fibonacci.recordResult("loss");
      const finalState = fibonacci.getState();

      expect(finalState.sessionActive).toBe(false);
      expect(finalState.reachedLimit).toBe(true);
    });

    it("should handle recovery from deep losses", () => {
      fibonacci.initSession(10, 15);

      // Go deep into sequence
      for (let i = 0; i < 8; i++) {
        fibonacci.recordResult("loss");
      }

      let state = fibonacci.getState();
      expect(state.currentIndex).toBe(8); // sequence[8] = 34
      expect(state.currentBet).toBe(340);

      // Win several times to recover
      fibonacci.recordResult("win"); // index 8->6
      state = fibonacci.getState();
      expect(state.currentIndex).toBe(6);

      fibonacci.recordResult("win"); // index 6->4
      state = fibonacci.getState();
      expect(state.currentIndex).toBe(4);

      fibonacci.recordResult("win"); // index 4->2
      state = fibonacci.getState();
      expect(state.currentIndex).toBe(2);

      fibonacci.recordResult("win"); // index 2->0 (session ends)
      state = fibonacci.getState();
      expect(state.currentIndex).toBe(0);
      expect(state.sessionActive).toBe(false);
    });
  });

  describe("getState", () => {
    it("should return a copy of state", () => {
      fibonacci.initSession(10);
      const state1 = fibonacci.getState();
      const state2 = fibonacci.getState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Different objects
    });
  });

  describe("reset", () => {
    it("should reset session with same parameters", () => {
      fibonacci.initSession(10, 12);
      fibonacci.recordResult("loss");
      fibonacci.recordResult("loss");
      fibonacci.recordResult("loss");

      fibonacci.reset();
      const state = fibonacci.getState();

      expect(state.baseUnit).toBe(10);
      expect(state.currentIndex).toBe(0);
      expect(state.currentBet).toBe(10);
      expect(state.maxIndex).toBe(12);
      expect(state.totalProfit).toBe(0);
      expect(state.sessionActive).toBe(true);
      expect(state.reachedLimit).toBe(false);
    });
  });

  describe("error handling", () => {
    it("should throw error when recording result without active session", () => {
      expect(() => {
        fibonacci.recordResult("win");
      }).toThrow("No active session");
    });

    it("should throw error when recording after session completes", () => {
      fibonacci.initSession(10);
      fibonacci.recordResult("loss"); // index 0->1
      fibonacci.recordResult("win"); // index 1->0, session ends

      expect(() => {
        fibonacci.recordResult("win");
      }).toThrow("No active session");
    });

    it("should throw error when recording after limit is reached", () => {
      fibonacci.initSession(10, 2);
      fibonacci.recordResult("loss"); // index 0->1
      fibonacci.recordResult("loss"); // index 1->2
      fibonacci.recordResult("loss"); // index 2->3 (exceeds limit, session ends)

      expect(() => {
        fibonacci.recordResult("win");
      }).toThrow("No active session");
    });
  });

  describe("edge cases", () => {
    it("should handle winning at index 1", () => {
      fibonacci.initSession(10);
      fibonacci.recordResult("loss"); // index 0->1
      fibonacci.recordResult("win"); // index 1->0 (can't go negative)

      const state = fibonacci.getState();

      expect(state.currentIndex).toBe(0);
      expect(state.sessionActive).toBe(false);
    });

    it("should handle exact maxIndex match", () => {
      fibonacci.initSession(10, 5);

      for (let i = 0; i < 5; i++) {
        fibonacci.recordResult("loss");
      }

      const state = fibonacci.getState();

      expect(state.currentIndex).toBe(5);
      expect(state.sessionActive).toBe(true); // Still active at exact maxIndex

      fibonacci.recordResult("loss"); // Should trigger limit

      const finalState = fibonacci.getState();
      expect(finalState.sessionActive).toBe(false);
      expect(finalState.reachedLimit).toBe(true);
    });

    it("should calculate profit correctly through complex sequence", () => {
      fibonacci.initSession(10);

      // Loss at index 0 (bet 10): profit = -10
      fibonacci.recordResult("loss");
      expect(fibonacci.getState().totalProfit).toBe(-10);

      // Loss at index 1 (bet 10): profit = -20
      fibonacci.recordResult("loss");
      expect(fibonacci.getState().totalProfit).toBe(-20);

      // Loss at index 2 (bet 20): profit = -40
      fibonacci.recordResult("loss");
      expect(fibonacci.getState().totalProfit).toBe(-40);

      // Win at index 3 (bet 30): profit = -10
      fibonacci.recordResult("win");
      expect(fibonacci.getState().totalProfit).toBe(-10);

      // Win at index 1 (bet 10): profit = 0
      fibonacci.recordResult("win");
      expect(fibonacci.getState().totalProfit).toBe(0);

      // Session should be complete now
      expect(fibonacci.getState().sessionActive).toBe(false);
    });
  });
});
