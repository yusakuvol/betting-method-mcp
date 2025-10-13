import type { BetResult, GoodmanState } from "../types.js";

/**
 * Goodman betting method calculator (1-2-3-5 method)
 *
 * The Goodman method uses a fixed sequence [1, 2, 3, 5] to determine bet amounts.
 * - Start with 1 unit
 * - On win: Move to next step in sequence (up to 5 units)
 * - On loss: Reset to 1 unit
 * - Stays at 5 units after reaching the top of the sequence
 */
export class GoodmanMethod {
  private state: GoodmanState;

  constructor(baseUnit: number = 1) {
    this.state = {
      sequence: [1, 2, 3, 5],
      baseUnit,
      currentStep: 0,
      currentBet: 0,
      winStreak: 0,
      totalProfit: 0,
      sessionActive: false,
      cyclesCompleted: 0,
    };
  }

  /**
   * Initialize a new betting session
   */
  initSession(baseUnit: number): void {
    if (baseUnit <= 0) {
      throw new Error("baseUnit must be positive");
    }

    this.state = {
      sequence: [1, 2, 3, 5],
      baseUnit,
      currentStep: 0,
      currentBet: baseUnit,
      winStreak: 0,
      totalProfit: 0,
      sessionActive: true,
      cyclesCompleted: 0,
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

      // Increment win streak
      this.state.winStreak++;

      // Move to next step, but cap at 3 (index of last element, which is 5)
      const nextStep = Math.min(this.state.currentStep + 1, 3);

      // Check if we reached the top (step 3 = 5 units)
      if (this.state.currentStep === 3 && nextStep === 3) {
        // We were already at 5 and staying at 5
        // Don't increment cyclesCompleted again
      } else if (nextStep === 3 && this.state.currentStep !== 3) {
        // Just reached 5 for the first time in this streak
        this.state.cyclesCompleted++;
      }

      this.state.currentStep = nextStep;
      this.state.currentBet = this.state.sequence[this.state.currentStep] * this.state.baseUnit;
    } else {
      // loss
      this.state.totalProfit -= currentBetAmount;

      // Reset to step 0
      this.state.currentStep = 0;
      this.state.winStreak = 0;
      this.state.currentBet = this.state.sequence[0] * this.state.baseUnit;
    }
  }

  /**
   * Get current state
   */
  getState(): GoodmanState {
    return {
      ...this.state,
      sequence: [...this.state.sequence], // Deep copy of array
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
