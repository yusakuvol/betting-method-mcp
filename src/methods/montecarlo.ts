import { MonteCarloState, BetResult } from "../types.js";

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
    };
  }

  /**
   * Calculate the current bet amount based on sequence
   */
  private calculateBet(sequence: number[], baseUnit: number): number {
    if (sequence.length === 0) {
      return 0;
    }
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
      this.state.currentBet = this.calculateBet(
        this.state.sequence,
        this.state.baseUnit
      );
    } else {
      this.state.currentBet = 0;
    }
  }

  /**
   * Get current state
   */
  getState(): MonteCarloState {
    return { ...this.state };
  }

  /**
   * Reset the session
   */
  reset(): void {
    const baseUnit = this.state.baseUnit;
    this.initSession(baseUnit);
  }
}
