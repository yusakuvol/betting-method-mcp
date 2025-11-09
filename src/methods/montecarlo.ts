import type { BetResult, MonteCarloState, SessionStatistics } from "../types.js";
import {
  initializeStatistics,
  updateStatistics,
  calculateRiskMetrics,
  generateSummary,
} from "../utils/statistics.js";

/**
 * Monte Carlo betting method calculator
 *
 * The Monte Carlo method uses a sequence of numbers to determine bet amounts.
 * - Start with a sequence like [1, 2, 3]
 * - Bet = (first number + last number) × base unit
 * - On win: Remove first and last numbers from sequence
 * - On loss: Add the bet amount to the end of sequence
 * - Session ends when sequence has 0 or 1 numbers
 */
export class MonteCarloMethod {
  private state: MonteCarloState;

  constructor(baseUnit: number = 1) {
    this.state = {
      sequence: [1, 2, 3],
      baseUnit,
      currentBet: 0,
      totalProfit: 0,
      sessionActive: false,
    };
  }

  /**
   * Initialize a new betting session
   */
  initSession(baseUnit: number): void {
    this.state = {
      sequence: [1, 2, 3],
      baseUnit,
      currentBet: this.calculateBet([1, 2, 3], baseUnit),
      totalProfit: 0,
      sessionActive: true,
      statistics: initializeStatistics(),
    };
  }

  /**
   * Calculate the current bet amount based on sequence
   * Note: sequence is guaranteed to be non-empty by caller
   */
  private calculateBet(sequence: number[], baseUnit: number): number {
    if (sequence.length === 1) {
      return sequence[0] * baseUnit;
    }
    return (sequence[0] + sequence[sequence.length - 1]) * baseUnit;
  }

  /**
   * Record a bet result and update the sequence
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
    const payout = result === "win" ? currentBetAmount * 2 : 0; // 2x payout for win
    this.state.statistics = updateStatistics(
      this.state.statistics,
      currentBetAmount,
      result,
      payout,
    );

    if (result === "win") {
      // Update profit
      this.state.totalProfit += currentBetAmount;

      // Remove first and last numbers from sequence
      if (this.state.sequence.length > 2) {
        this.state.sequence = this.state.sequence.slice(1, -1);
      } else {
        // Session completed successfully
        this.state.sequence = [];
        this.state.sessionActive = false;
      }
    } else {
      // loss
      this.state.totalProfit -= currentBetAmount;

      // Add lost bet amount to end of sequence (in units)
      const lostUnits = currentBetAmount / this.state.baseUnit;
      this.state.sequence.push(lostUnits);
    }

    // Calculate next bet
    if (this.state.sessionActive && this.state.sequence.length > 0) {
      this.state.currentBet = this.calculateBet(this.state.sequence, this.state.baseUnit);
    } else {
      this.state.currentBet = 0;
    }

    // Update risk metrics
    this.state.statistics = calculateRiskMetrics(this.state.statistics);
  }

  /**
   * Get current state
   */
  getState(): MonteCarloState {
    return {
      ...this.state,
      sequence: [...this.state.sequence], // Deep copy of array
    };
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
    const baseUnit = this.state.baseUnit;
    this.initSession(baseUnit);
  }
}
