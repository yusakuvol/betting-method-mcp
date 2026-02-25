import type { BetResult, FibonacciState, SessionStatistics } from "../types.js";
import {
  calculateRiskMetrics,
  initializeStatistics,
  updateStatistics,
} from "../utils/statistics.js";

/**
 * Fibonacci betting method calculator
 *
 * The Fibonacci method uses the famous Fibonacci sequence (1, 1, 2, 3, 5, 8, 13, 21...)
 * as a betting progression strategy. It's more conservative than Martingale.
 * - Start at the first position in the sequence
 * - On loss: Move forward one position in the sequence
 * - On win: Move back two positions (but never before the start)
 * - Session completes when returning to the first position after a win
 * - Session ends when reaching the maximum index limit
 */
export class FibonacciMethod {
  private state: FibonacciState;

  constructor() {
    this.state = {
      baseUnit: 0,
      sequence: [],
      currentIndex: 0,
      currentBet: 0,
      maxIndex: 0,
      totalProfit: 0,
      sessionActive: false,
      reachedLimit: false,
    };
  }

  /**
   * Generate Fibonacci sequence up to a maximum number of elements
   */
  private generateFibonacciSequence(maxElements: number): number[] {
    const sequence: number[] = [1, 1];

    while (sequence.length < maxElements) {
      const nextValue = sequence[sequence.length - 1] + sequence[sequence.length - 2];
      sequence.push(nextValue);
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

    const maxIdx = maxIndex ?? 20;

    if (maxIdx < 1) {
      throw new Error("maxIndex must be at least 1");
    }

    // Generate Fibonacci sequence (default to 30 elements for safety)
    const sequence = this.generateFibonacciSequence(Math.max(maxIdx + 1, 30));

    this.state = {
      baseUnit,
      sequence,
      currentIndex: 0,
      currentBet: sequence[0] * baseUnit,
      maxIndex: maxIdx,
      totalProfit: 0,
      sessionActive: true,
      reachedLimit: false,
      statistics: initializeStatistics(),
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

    // Update statistics
    if (!this.state.statistics) {
      this.state.statistics = initializeStatistics();
    }
    const payout = result === "win" ? currentBetAmount * 2 : 0;
    this.state.statistics = updateStatistics(
      this.state.statistics,
      currentBetAmount,
      result,
      payout,
    );

    if (result === "win") {
      // Update profit
      this.state.totalProfit += currentBetAmount;

      // Move back 2 positions, but never go below index 0
      const newIndex = Math.max(0, this.state.currentIndex - 2);

      // If we're back at the start (index 0), session is complete
      if (newIndex === 0 && this.state.currentIndex > 0) {
        this.state.sessionActive = false;
        this.state.currentIndex = 0;
        this.state.currentBet = this.state.sequence[0] * this.state.baseUnit;
        return;
      }

      this.state.currentIndex = newIndex;
      this.state.currentBet = this.state.sequence[newIndex] * this.state.baseUnit;
    } else {
      // loss
      this.state.totalProfit -= currentBetAmount;

      // Move forward one position
      const newIndex = this.state.currentIndex + 1;

      // Check if we've reached the maximum index
      if (newIndex > this.state.maxIndex) {
        this.state.sessionActive = false;
        this.state.reachedLimit = true;
        this.state.currentBet = 0;
        return;
      }

      this.state.currentIndex = newIndex;
      this.state.currentBet = this.state.sequence[newIndex] * this.state.baseUnit;
    }

    // Update risk metrics
    this.state.statistics = calculateRiskMetrics(this.state.statistics);
  }

  /**
   * Get current state
   */
  getState(): FibonacciState {
    return { ...this.state };
  }

  /**
   * Get statistics for the current session
   */
  getStatistics(): SessionStatistics | undefined {
    if (!this.state.statistics) {
      return undefined;
    }
    return {
      ...this.state.statistics,
      betHistory: this.state.statistics.betHistory
        ? [...this.state.statistics.betHistory]
        : undefined,
      outcomeHistory: this.state.statistics.outcomeHistory
        ? [...this.state.statistics.outcomeHistory]
        : undefined,
      bankrollHistory: this.state.statistics.bankrollHistory
        ? [...this.state.statistics.bankrollHistory]
        : undefined,
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
