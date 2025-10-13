import type { BetResult, CocomoState } from "../types.js";

/**
 * Cocomo betting method calculator
 *
 * The Cocomo method is specialized for 3x payout bets (like Roulette dozen or column bets).
 * - Start with a base unit bet amount
 * - First two bets: Use base unit
 * - From 3rd bet onward: Bet = Previous bet + Bet before previous
 * - On win: Reset to base unit (3x payout recovers all losses plus profit)
 * - On loss: Continue with the Fibonacci-like progression
 * - Session ends when max bet limit is reached
 */
export class CocomoMethod {
  private state: CocomoState;

  constructor(baseUnit: number = 1, maxBet?: number) {
    this.state = {
      baseUnit,
      currentBet: 0,
      previousBet: 0,
      currentStreak: 0,
      maxBet: maxBet ?? baseUnit * 1000,
      totalProfit: 0,
      sessionActive: false,
      reachedLimit: false,
      payoutMultiplier: 3,
    };
  }

  /**
   * Initialize a new betting session
   */
  initSession(baseUnit: number, maxBet?: number): void {
    if (baseUnit <= 0) {
      throw new Error("baseUnit must be positive");
    }

    this.state = {
      baseUnit,
      currentBet: baseUnit,
      previousBet: 0,
      currentStreak: 0,
      maxBet: maxBet ?? baseUnit * 1000,
      totalProfit: 0,
      sessionActive: true,
      reachedLimit: false,
      payoutMultiplier: 3,
    };

    // Validate maxBet
    if (this.state.maxBet < baseUnit) {
      throw new Error("maxBet must be greater than or equal to baseUnit");
    }
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
      // Win: 3x payout, minus the bet amount itself = 2x net profit
      this.state.totalProfit += currentBetAmount * 2;

      // Reset to base unit
      this.state.currentBet = this.state.baseUnit;
      this.state.previousBet = 0;
      this.state.currentStreak = 0;
    } else {
      // loss
      this.state.totalProfit -= currentBetAmount;

      // Increment loss streak
      this.state.currentStreak++;

      // Calculate next bet
      let nextBet: number;
      if (this.state.currentStreak === 1) {
        // Second bet: still use base unit
        nextBet = this.state.baseUnit;
      } else {
        // Third bet onward: current + previous
        nextBet = currentBetAmount + this.state.previousBet;
      }

      // Check if next bet exceeds max bet
      if (nextBet > this.state.maxBet) {
        this.state.sessionActive = false;
        this.state.reachedLimit = true;
        this.state.currentBet = 0;
        return;
      }

      // Update state
      this.state.previousBet = currentBetAmount;
      this.state.currentBet = nextBet;
    }
  }

  /**
   * Get current state
   */
  getState(): CocomoState {
    return { ...this.state };
  }

  /**
   * Reset the session
   */
  reset(): void {
    const { baseUnit, maxBet } = this.state;
    this.initSession(baseUnit, maxBet);
  }
}
