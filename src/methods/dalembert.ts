import type { BetResult, DAlembertState, SessionStatistics } from "../types.js";
import {
  calculateRiskMetrics,
  initializeStatistics,
  updateStatistics,
} from "../utils/statistics.js";

/**
 * D'Alembert betting method calculator
 *
 * The D'Alembert method is a negative progression system that increases bet by 1 unit after loss
 * and decreases by 1 unit after win. It's more conservative than Martingale.
 * - Start with a base unit bet amount
 * - On win: Decrease bet by 1 unit (minimum is base unit)
 * - On loss: Increase bet by 1 unit
 * - Session ends when profit is achieved or max bet is reached
 */
export class DAlembertMethod {
  private state: DAlembertState;

  constructor(baseUnit: number = 1, maxBet?: number) {
    this.state = {
      baseUnit,
      currentBet: 0,
      maxBet,
      totalProfit: 0,
      sessionActive: false,
      reachedLimit: false,
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
      maxBet,
      totalProfit: 0,
      sessionActive: true,
      reachedLimit: false,
      statistics: initializeStatistics(),
    };

    // Validate maxBet
    if (this.state.maxBet !== undefined && this.state.maxBet < baseUnit) {
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

      // Decrease bet by 1 unit, but not below base unit
      this.state.currentBet = Math.max(this.state.baseUnit, currentBetAmount - this.state.baseUnit);
    } else {
      // loss
      this.state.totalProfit -= currentBetAmount;

      // Increase bet by 1 unit
      const nextBet = currentBetAmount + this.state.baseUnit;

      // Check if next bet exceeds max bet
      if (this.state.maxBet !== undefined && nextBet > this.state.maxBet) {
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
  getState(): DAlembertState {
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
    const { baseUnit, maxBet } = this.state;
    this.initSession(baseUnit, maxBet);
  }
}
