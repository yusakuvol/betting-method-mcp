import type { BetResult, ParoliState } from "../types.js";

/**
 * Paroli betting method calculator
 *
 * The Paroli method (also known as Reverse Martingale) doubles the bet after each win.
 * - Start with a base unit bet amount
 * - On win: Double the bet amount
 * - On loss: Reset bet to base unit
 * - On reaching target win streak: Reset bet to base unit
 * - Session can be ended at any time
 */
export class ParoliMethod {
  private state: ParoliState;

  constructor() {
    this.state = {
      baseUnit: 0,
      currentBet: 0,
      winStreak: 0,
      targetWinStreak: 3,
      totalProfit: 0,
      sessionActive: false,
      cyclesCompleted: 0,
    };
  }

  /**
   * Initialize a new betting session
   */
  initSession(baseUnit: number, targetWinStreak?: number): void {
    if (baseUnit <= 0) {
      throw new Error("baseUnit must be positive");
    }

    if (targetWinStreak !== undefined && targetWinStreak <= 0) {
      throw new Error("targetWinStreak must be positive");
    }

    this.state = {
      baseUnit,
      currentBet: baseUnit,
      winStreak: 0,
      targetWinStreak: targetWinStreak ?? 3,
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

      // Check if target win streak reached
      if (this.state.winStreak >= this.state.targetWinStreak) {
        // Reset to base unit and increment cycles completed
        this.state.currentBet = this.state.baseUnit;
        this.state.winStreak = 0;
        this.state.cyclesCompleted++;
      } else {
        // Double the bet
        this.state.currentBet = currentBetAmount * 2;
      }
    } else {
      // loss
      this.state.totalProfit -= currentBetAmount;

      // Reset bet to base unit
      this.state.currentBet = this.state.baseUnit;
      this.state.winStreak = 0;
    }
  }

  /**
   * Get current state
   */
  getState(): ParoliState {
    return { ...this.state };
  }

  /**
   * Reset the session
   */
  reset(): void {
    const { baseUnit, targetWinStreak } = this.state;
    this.initSession(baseUnit, targetWinStreak);
  }
}
