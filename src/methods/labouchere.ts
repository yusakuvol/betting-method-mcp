import type { BetResult, LabouchereState } from "../types.js";

/**
 * Labouchere betting method calculator
 *
 * The Labouchere method (also known as Cancellation System or Split Martingale)
 * is a flexible betting strategy using number sequences.
 * - Start with a sequence representing your target profit (e.g., [1, 2, 3, 4] for 10 units)
 * - Bet = (first number + last number) × base unit
 * - On win: Remove first and last numbers from sequence
 * - On loss: Add the lost bet (in units) to the end of sequence
 * - Session completes when sequence becomes empty (target profit achieved)
 * - Session ends when sequence exceeds maximum length
 */
export class LabouchereMethod {
  private state: LabouchereState;

  constructor() {
    this.state = {
      baseUnit: 1,
      sequence: [],
      initialSequence: [],
      currentBet: 0,
      targetProfit: 0,
      maxSequenceLength: 20,
      totalProfit: 0,
      sessionActive: false,
      sessionsCompleted: 0,
      reachedLimit: false,
    };
  }

  /**
   * Initialize a new betting session
   */
  initSession(
    baseUnit: number,
    targetProfit: number,
    initialSequence?: number[],
    maxSequenceLength?: number,
  ): void {
    // Validate baseUnit
    if (baseUnit <= 0) {
      throw new Error("baseUnit must be positive");
    }

    // Validate targetProfit
    if (targetProfit <= 0) {
      throw new Error("targetProfit must be positive");
    }

    // If no initial sequence provided, create a balanced one
    let sequence: number[];
    if (initialSequence && initialSequence.length > 0) {
      // Validate that all numbers in the sequence are positive
      if (initialSequence.some((num) => num <= 0)) {
        throw new Error("All numbers in initialSequence must be positive");
      }

      // Validate that sequence sum equals target profit
      const sum = initialSequence.reduce((acc, num) => acc + num, 0);
      if (sum !== targetProfit) {
        throw new Error(
          `Sum of initialSequence (${sum}) must equal targetProfit (${targetProfit})`,
        );
      }

      sequence = [...initialSequence];
    } else {
      // Generate a balanced sequence: [1, 2, 3, 4] for target 10
      sequence = this.generateBalancedSequence(targetProfit);
    }

    // Validate maxSequenceLength
    const maxLength = maxSequenceLength ?? 20;
    if (maxLength < sequence.length) {
      throw new Error("maxSequenceLength must be at least as long as initialSequence");
    }

    this.state = {
      baseUnit,
      sequence: [...sequence],
      initialSequence: [...sequence],
      currentBet: this.calculateBet(sequence, baseUnit),
      targetProfit,
      maxSequenceLength: maxLength,
      totalProfit: 0,
      sessionActive: true,
      sessionsCompleted: 0,
      reachedLimit: false,
    };
  }

  /**
   * Generate a balanced sequence that sums to the target profit
   */
  private generateBalancedSequence(targetProfit: number): number[] {
    // Create a simple balanced sequence
    // For example: target 10 -> [1, 2, 3, 4]
    const sequence: number[] = [];
    let remaining = targetProfit;
    let current = 1;

    while (remaining > 0) {
      if (remaining >= current) {
        sequence.push(current);
        remaining -= current;
        current++;
      } else {
        sequence.push(remaining);
        remaining = 0;
      }
    }

    return sequence;
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
    const betUnits = currentBetAmount / this.state.baseUnit;

    if (result === "win") {
      // Update profit
      this.state.totalProfit += currentBetAmount;

      // Remove first and last numbers from sequence
      if (this.state.sequence.length > 2) {
        this.state.sequence = this.state.sequence.slice(1, -1);
      } else {
        // Session completed successfully - target profit achieved
        this.state.sequence = [];
        this.state.sessionActive = false;
        this.state.sessionsCompleted++;
      }
    } else {
      // loss
      this.state.totalProfit -= currentBetAmount;

      // Add lost bet units to end of sequence
      this.state.sequence.push(betUnits);

      // Check if sequence exceeds maximum length
      if (this.state.sequence.length > this.state.maxSequenceLength) {
        this.state.sessionActive = false;
        this.state.reachedLimit = true;
      }
    }

    // Calculate next bet
    if (this.state.sessionActive && this.state.sequence.length > 0) {
      this.state.currentBet = this.calculateBet(this.state.sequence, this.state.baseUnit);
    } else {
      this.state.currentBet = 0;
    }
  }

  /**
   * Get current state
   */
  getState(): LabouchereState {
    return {
      ...this.state,
      sequence: [...this.state.sequence],
      initialSequence: [...this.state.initialSequence],
    };
  }

  /**
   * Reset the session
   */
  reset(): void {
    const { baseUnit, targetProfit, initialSequence, maxSequenceLength } = this.state;
    this.initSession(baseUnit, targetProfit, initialSequence, maxSequenceLength);
  }
}
