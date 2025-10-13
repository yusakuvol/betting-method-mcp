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
      expect(state.maxIndex).toBe(15);
      expect(state.currentBet).toBe(10); // baseUnit * sequence[0] = 10 * 1
      expect(state.totalProfit).toBe(0);
      expect(state.sessionActive).toBe(true);
      expect(state.reachedLimit).toBe(false);
      expect(state.sequence).toHaveLength(16);
    });

    it("should use default maxIndex if not provided", () => {
      fibonacci.initSession(10);
      const state = fibonacci.getState();

      expect(state.maxIndex).toBe(29);
      expect(state.sequence).toHaveLength(30);
    });

    it("should throw error if baseUnit is zero or negative", () => {
      expect(() => {
        fibonacci.initSession(0);
      }).toThrow("baseUnit must be positive");

      expect(() => {
        fibonacci.initSession(-5);
      }).toThrow("baseUnit must be positive");
    });

    it("should throw error if maxIndex is negative", () => {
      expect(() => {
        fibonacci.initSession(10, -1);
      }).toThrow("maxIndex must be non-negative");
    });

    it("should generate correct Fibonacci sequence", () => {
      fibonacci.initSession(1);
      const state = fibonacci.getState();

      // First few Fibonacci numbers: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55
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
  });

  describe("recordResult - loss", () => {
    beforeEach(() => {
      fibonacci.initSession(10, 15);
    });

    it("should move forward one position on loss", () => {
      fibonacci.recordResult("loss");
      const state = fibonacci.getState();

      expect(state.currentIndex).toBe(1);
      expect(state.currentBet).toBe(10); // baseUnit * sequence[1] = 10 * 1
      expect(state.totalProfit).toBe(-10);
    });

    it("should update profit correctly on loss", () => {
      fibonacci.recordResult("loss");
      const state = fibonacci.getState();

      expect(state.totalProfit).toBe(-10);
    });

    it("should continue moving forward on consecutive losses", () => {
      fibonacci.recordResult("loss"); // index: 0->1, bet was 10, profit: -10, next bet: 10
      fibonacci.recordResult("loss"); // index: 1->2, bet was 10, profit: -20, next bet: 20
      fibonacci.recordResult("loss"); // index: 2->3, bet was 20, profit: -40, next bet: 30
      const state = fibonacci.getState();

      expect(state.currentIndex).toBe(3);
      expect(state.currentBet).toBe(30); // baseUnit * sequence[3] = 10 * 3
      expect(state.totalProfit).toBe(-40);
    });

    it("should progress through Fibonacci sequence correctly", () => {
      // Sequence: 1, 1, 2, 3, 5, 8, 13...
      // With baseUnit = 10: 10, 10, 20, 30, 50, 80, 130...
      fibonacci.recordResult("loss"); // index 1, bet becomes 10 * 1 = 10
      expect(fibonacci.getState().currentBet).toBe(10);

      fibonacci.recordResult("loss"); // index 2, bet becomes 10 * 2 = 20
      expect(fibonacci.getState().currentBet).toBe(20);

      fibonacci.recordResult("loss"); // index 3, bet becomes 10 * 3 = 30
      expect(fibonacci.getState().currentBet).toBe(30);

      fibonacci.recordResult("loss"); // index 4, bet becomes 10 * 5 = 50
      expect(fibonacci.getState().currentBet).toBe(50);

      fibonacci.recordResult("loss"); // index 5, bet becomes 10 * 8 = 80
      expect(fibonacci.getState().currentBet).toBe(80);
    });
  });

  describe("recordResult - win", () => {
    beforeEach(() => {
      fibonacci.initSession(10, 15);
    });

    it("should move back two positions on win", () => {
      // Move forward first
      fibonacci.recordResult("loss"); // index: 0->1
      fibonacci.recordResult("loss"); // index: 1->2
      fibonacci.recordResult("loss"); // index: 2->3

      fibonacci.recordResult("win"); // index: 3->1
      const state = fibonacci.getState();

      expect(state.currentIndex).toBe(1);
      expect(state.currentBet).toBe(10); // baseUnit * sequence[1] = 10 * 1
    });

    it("should not go below index 0 on win", () => {
      fibonacci.recordResult("loss"); // index: 0->1
      fibonacci.recordResult("win"); // index: 1->0 (can't go below 0)

      const state = fibonacci.getState();

      expect(state.currentIndex).toBe(0);
      expect(state.sessionActive).toBe(false); // Session ends when back to start
    });

    it("should update profit correctly on win", () => {
      fibonacci.recordResult("loss"); // profit: -10
      fibonacci.recordResult("loss"); // profit: -20
      fibonacci.recordResult("win"); // profit: -20 + 20 = 0

      const state = fibonacci.getState();

      expect(state.totalProfit).toBe(0);
    });

    it("should end session when returning to index 0 after win", () => {
      fibonacci.recordResult("loss"); // index: 0->1
      fibonacci.recordResult("win"); // index: 1->0, session ends

      const state = fibonacci.getState();

      expect(state.currentIndex).toBe(0);
      expect(state.sessionActive).toBe(false);
      expect(state.currentBet).toBe(0);
    });
  });

  describe("recordResult - mixed results", () => {
    beforeEach(() => {
      fibonacci.initSession(10, 15);
    });

    it("should handle alternating wins and losses", () => {
      fibonacci.recordResult("loss"); // index: 0->1, bet: 10
      fibonacci.recordResult("loss"); // index: 1->2, bet: 20
      fibonacci.recordResult("win"); // index: 2->0, session ends

      const state = fibonacci.getState();

      expect(state.sessionActive).toBe(false);
    });

    it("should track profit correctly in mixed scenario", () => {
      // Start at index 0, bet 10
      fibonacci.recordResult("loss"); // -10, index 1, bet 10
      fibonacci.recordResult("loss"); // -20, index 2, bet 20
      fibonacci.recordResult("loss"); // -40, index 3, bet 30
      fibonacci.recordResult("win"); // -10, index 1, bet 10

      const state = fibonacci.getState();

      expect(state.totalProfit).toBe(-10);
      expect(state.currentIndex).toBe(1);
    });

    it("should handle complex sequence", () => {
      // Sequence of losses
      fibonacci.recordResult("loss"); // index 1
      fibonacci.recordResult("loss"); // index 2
      fibonacci.recordResult("loss"); // index 3
      fibonacci.recordResult("loss"); // index 4
      fibonacci.recordResult("loss"); // index 5

      expect(fibonacci.getState().currentIndex).toBe(5);

      // Win brings back 2 positions
      fibonacci.recordResult("win"); // index 3
      expect(fibonacci.getState().currentIndex).toBe(3);

      // Another win
      fibonacci.recordResult("win"); // index 1
      expect(fibonacci.getState().currentIndex).toBe(1);

      // Win again to end session
      fibonacci.recordResult("win"); // index 0, session ends
      expect(fibonacci.getState().sessionActive).toBe(false);
    });
  });

  describe("recordResult - limit reached", () => {
    it("should end session when maxIndex is exceeded", () => {
      fibonacci.initSession(10, 5);

      fibonacci.recordResult("loss"); // index 1
      fibonacci.recordResult("loss"); // index 2
      fibonacci.recordResult("loss"); // index 3
      fibonacci.recordResult("loss"); // index 4
      fibonacci.recordResult("loss"); // index 5
      fibonacci.recordResult("loss"); // index 6 (exceeds maxIndex 5)

      const state = fibonacci.getState();

      expect(state.sessionActive).toBe(false);
      expect(state.reachedLimit).toBe(true);
      expect(state.currentBet).toBe(0);
    });

    it("should handle exact maxIndex match", () => {
      fibonacci.initSession(10, 3);

      fibonacci.recordResult("loss"); // index 1
      fibonacci.recordResult("loss"); // index 2
      fibonacci.recordResult("loss"); // index 3 (exactly maxIndex)

      const state = fibonacci.getState();

      expect(state.currentIndex).toBe(3);
      expect(state.sessionActive).toBe(true); // Still active

      fibonacci.recordResult("loss"); // index 4 (exceeds)

      const finalState = fibonacci.getState();
      expect(finalState.sessionActive).toBe(false);
      expect(finalState.reachedLimit).toBe(true);
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

    it("should return a deep copy of sequence array", () => {
      fibonacci.initSession(10);
      const state1 = fibonacci.getState();
      const state2 = fibonacci.getState();

      expect(state1.sequence).toEqual(state2.sequence);
      expect(state1.sequence).not.toBe(state2.sequence); // Different arrays
    });
  });

  describe("reset", () => {
    it("should reset session with same parameters", () => {
      fibonacci.initSession(10, 12);
      fibonacci.recordResult("loss");
      fibonacci.recordResult("loss");

      fibonacci.reset();
      const state = fibonacci.getState();

      expect(state.baseUnit).toBe(10);
      expect(state.maxIndex).toBe(12);
      expect(state.currentIndex).toBe(0);
      expect(state.currentBet).toBe(10);
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

    it("should throw error when recording after session ends", () => {
      fibonacci.initSession(10);
      fibonacci.recordResult("loss"); // index 1
      fibonacci.recordResult("win"); // index 0, session ends

      expect(() => {
        fibonacci.recordResult("win");
      }).toThrow("No active session");
    });

    it("should throw error when recording after limit is reached", () => {
      fibonacci.initSession(10, 2);
      fibonacci.recordResult("loss"); // index 1
      fibonacci.recordResult("loss"); // index 2
      fibonacci.recordResult("loss"); // index 3, exceeds limit

      expect(() => {
        fibonacci.recordResult("win");
      }).toThrow("No active session");
    });
  });

  describe("edge cases", () => {
    it("should handle very small maxIndex", () => {
      fibonacci.initSession(10, 0);

      const state = fibonacci.getState();
      expect(state.currentIndex).toBe(0);
      expect(state.maxIndex).toBe(0);

      fibonacci.recordResult("loss"); // Would exceed limit immediately

      const finalState = fibonacci.getState();
      expect(finalState.sessionActive).toBe(false);
      expect(finalState.reachedLimit).toBe(true);
    });

    it("should handle immediate win at start", () => {
      fibonacci.initSession(10);
      // Can't win at index 0 as moving back 2 would still be 0, ending session
      fibonacci.recordResult("loss"); // index 1
      fibonacci.recordResult("win"); // back to 0, session ends

      const state = fibonacci.getState();
      expect(state.sessionActive).toBe(false);
      expect(state.currentIndex).toBe(0);
    });

    it("should handle long losing streak", () => {
      fibonacci.initSession(10, 20);

      for (let i = 0; i < 15; i++) {
        fibonacci.recordResult("loss");
      }

      const state = fibonacci.getState();
      expect(state.currentIndex).toBe(15);
      expect(state.sessionActive).toBe(true);
      expect(state.currentBet).toBe(10 * state.sequence[15]);
    });

    it("should calculate correct bet amounts for large indices", () => {
      fibonacci.initSession(1, 10);

      // Move to index 10
      for (let i = 0; i < 10; i++) {
        fibonacci.recordResult("loss");
      }

      const state = fibonacci.getState();
      // Fibonacci[10] = 89
      expect(state.currentBet).toBe(89);
    });
  });

  describe("session completion", () => {
    it("should complete session successfully after recovery", () => {
      fibonacci.initSession(10);

      // Lose some bets
      fibonacci.recordResult("loss"); // index 1
      fibonacci.recordResult("loss"); // index 2
      fibonacci.recordResult("loss"); // index 3
      fibonacci.recordResult("loss"); // index 4

      // Start winning back
      fibonacci.recordResult("win"); // index 2
      fibonacci.recordResult("win"); // index 0, session complete

      const state = fibonacci.getState();
      expect(state.sessionActive).toBe(false);
      expect(state.reachedLimit).toBe(false);
      expect(state.currentIndex).toBe(0);
    });

    it("should track profit through complete session", () => {
      fibonacci.initSession(10);

      // Sequence: 1, 1, 2, 3, 5, 8
      // Bets: 10, 10, 20, 30, 50, 80

      fibonacci.recordResult("loss"); // -10, index 1, next bet 10
      fibonacci.recordResult("loss"); // -20, index 2, next bet 20
      fibonacci.recordResult("loss"); // -40, index 3, next bet 30
      fibonacci.recordResult("win"); // -10, index 1, next bet 10
      fibonacci.recordResult("win"); // 0, index 0, session ends

      const state = fibonacci.getState();
      expect(state.totalProfit).toBe(0);
      expect(state.sessionActive).toBe(false);
    });
  });
});
