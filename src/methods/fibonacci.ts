import type { BetResult, FibonacciState } from "../types.js";

/**
 * Fibonacci betting method calculator
 *
 * The Fibonacci method uses the famous Fibonacci sequence (1, 1, 2, 3, 5, 8, 13, 21...)
 * to determine bet amounts.
 * - Start at the first position in the sequence
 * - On loss: Move forward one position in the sequence
 * - On win: Move back two positions in the sequence (minimum at position 0)
 * - Session ends when back at the first position after a win
 */
export class FibonacciMethod {
  private state: FibonacciState;

  constructor() {
    this.state = {
      baseUnit: 1,
      sequence: this.generateFibonacciSequence(30),
      currentIndex: 0,
      maxIndex: 29,
      currentBet: 0,
      totalProfit: 0,
      sessionActive: false,
      reachedLimit: false,
    };
  }

  /**
   * Generate Fibonacci sequence up to n elements
   */
  private generateFibonacciSequence(n: number): number[] {
    const sequence: number[] = [1, 1];
    for (let i = 2; i < n; i++) {
      sequence.push(sequence[i - 1] + sequence[i - 2]);
    }
    return sequence;
  }

  /**
   * Initialize a new betting session
   */
  initSession(baseUnit: number, maxIndex?: number): void {
    if (baseUnit <= 0) {
      throw new Error("baseUnit must be positive");
    }

    const maxIdx = maxIndex ?? 29;
    if (maxIdx < 0) {
      throw new Error("maxIndex must be non-negative");
    }

    this.state = {
      baseUnit,
      sequence: this.generateFibonacciSequence(maxIdx + 1),
      currentIndex: 0,
      maxIndex: maxIdx,
      currentBet: baseUnit * this.state.sequence[0],
      totalProfit: 0,
      sessionActive: true,
      reachedLimit: false,
    };
  }

  /**
   * Record a bet result and update the state
   */
  recordResult(result: BetResult): void {
    if (!this.state.sessionActive) {
      throw new Error("No active session. Please initialize a session first.");
    }

    const currentBetAmount = this.state.currentBet;

    if (result === "win") {
      // Update profit
      this.state.totalProfit += currentBetAmount;

      // Move back 2 positions (minimum 0)
      this.state.currentIndex = Math.max(0, this.state.currentIndex - 2);

      // Check if session is complete (back to start)
      if (this.state.currentIndex === 0) {
        this.state.sessionActive = false;
        this.state.currentBet = 0;
        return;
      }

      // Update bet for next round
      this.state.currentBet = this.state.baseUnit * this.state.sequence[this.state.currentIndex];
    } else {
      // loss
      this.state.totalProfit -= currentBetAmount;

      // Move forward one position
      this.state.currentIndex++;

      // Check if max index reached
      if (this.state.currentIndex > this.state.maxIndex) {
        this.state.sessionActive = false;
        this.state.reachedLimit = true;
        this.state.currentBet = 0;
        return;
      }

      // Update bet for next round
      this.state.currentBet = this.state.baseUnit * this.state.sequence[this.state.currentIndex];
    }
  }

  /**
   * Get current state
   */
  getState(): FibonacciState {
    return {
      ...this.state,
      sequence: [...this.state.sequence],
    };
  }

  /**
   * Reset the session
   */
  reset(): void {
    const { baseUnit, maxIndex } = this.state;
    this.initSession(baseUnit, maxIndex);
  }
}
