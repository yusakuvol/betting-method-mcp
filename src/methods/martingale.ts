import type { BetResult, MartingaleState, SessionStatistics } from "../types.js";
import {
  initializeStatistics,
  updateStatistics,
  calculateRiskMetrics,
} from "../utils/statistics.js";

/**
 * Martingale betting method calculator
 *
 * The Martingale method doubles the bet after each loss and resets to base unit after a win.
 * - Start with a base unit bet amount
 * - On win: Reset bet to base unit
 * - On loss: Double the bet amount
 * - Session ends when max bet or max loss streak is reached
 */
export class MartingaleMethod {
  private state: MartingaleState;

  constructor(baseUnit: number = 1, maxBet?: number, maxLossStreak?: number) {
    this.state = {
      baseUnit,
      currentBet: 0,
      currentStreak: 0,
      maxBet: maxBet ?? baseUnit * 1024, // Default: 10 losses (2^10 = 1024)
      maxLossStreak: maxLossStreak ?? 10,
      totalProfit: 0,
      sessionActive: false,
      reachedLimit: false,
    };
  }

  /**
   * Initialize a new betting session
   */
  initSession(baseUnit: number, maxBet?: number, maxLossStreak?: number): void {
    if (baseUnit <= 0) {
      throw new Error("baseUnit must be positive");
    }

    this.state = {
      baseUnit,
      currentBet: baseUnit,
      currentStreak: 0,
      maxBet: maxBet ?? baseUnit * 1024,
      maxLossStreak: maxLossStreak ?? 10,
      totalProfit: 0,
      sessionActive: true,
      reachedLimit: false,
      statistics: initializeStatistics(),
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

      // Reset bet to base unit
      this.state.currentBet = this.state.baseUnit;
      this.state.currentStreak = 0;
    } else {
      // loss
      this.state.totalProfit -= currentBetAmount;

      // Increment loss streak
      this.state.currentStreak++;

      // Check if max loss streak reached
      if (this.state.currentStreak >= this.state.maxLossStreak) {
        this.state.sessionActive = false;
        this.state.reachedLimit = true;
        this.state.currentBet = 0;
        return;
      }

      // Double the bet
      const nextBet = currentBetAmount * 2;

      // Check if next bet exceeds max bet
      if (nextBet > this.state.maxBet) {
        this.state.sessionActive = false;
        this.state.reachedLimit = true;
        this.state.currentBet = 0;
        return;
      }

      this.state.currentBet = nextBet;
    }

    // Update risk metrics
    this.state.statistics = calculateRiskMetrics(this.state.statistics);
  }

  /**
   * Get current state
   */
  getState(): MartingaleState {
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
    const { baseUnit, maxBet, maxLossStreak } = this.state;
    this.initSession(baseUnit, maxBet, maxLossStreak);
  }
}
