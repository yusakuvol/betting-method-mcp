import type { BetResult, ParoliState } from "../types.js";

/**
 * Paroli betting method calculator (Reverse Martingale)
 *
 * The Paroli method doubles the bet after each win and resets to base unit after a loss or target win streak.
 * - Start with a base unit bet amount
 * - On win: Double the bet amount
 * - On loss or reaching target win streak: Reset bet to base unit
 * - Focuses on maximizing profits during winning streaks while minimizing losses
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

    const finalTargetWinStreak = targetWinStreak ?? 3;
    if (finalTargetWinStreak <= 0) {
      throw new Error("targetWinStreak must be positive");
    }

    this.state = {
      baseUnit,
      currentBet: baseUnit,
      winStreak: 0,
      targetWinStreak: finalTargetWinStreak,
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
        // Complete the cycle and reset
        this.state.cyclesCompleted++;
        this.state.winStreak = 0;
        this.state.currentBet = this.state.baseUnit;
      } else {
        // Double the bet for next round
        this.state.currentBet = currentBetAmount * 2;
      }
    } else {
      // loss
      this.state.totalProfit -= currentBetAmount;

      // Reset bet to base unit and win streak to 0
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
