import type { BetResult, OscarsGrindState, SessionStatistics } from "../types.js";
import {
  calculateRiskMetrics,
  initializeStatistics,
  updateStatistics,
} from "../utils/statistics.js";

/**
 * Oscar's Grind betting method calculator
 *
 * Oscar's Grind is a conservative betting strategy that aims for 1 unit profit per session.
 * - Bet amount increases only after a win
 * - Bet amount stays the same after a loss
 * - Session completes when target profit is reached
 * - New session automatically starts after completion
 */
export class OscarsGrindMethod {
  private state: OscarsGrindState;

  constructor() {
    this.state = {
      baseUnit: 0,
      currentBet: 0,
      currentBetUnits: 0,
      maxBetUnits: 0,
      targetProfitUnits: 0,
      currentProfitUnits: 0,
      totalProfit: 0,
      sessionActive: false,
      sessionsCompleted: 0,
    };
  }

  /**
   * Initialize a new betting session
   */
  initSession(baseUnit: number, targetProfitUnits: number = 1, maxBetUnits?: number): void {
    if (baseUnit <= 0) {
      throw new Error("baseUnit must be positive");
    }

    if (targetProfitUnits <= 0) {
      throw new Error("targetProfitUnits must be positive");
    }

    const defaultMaxBetUnits = targetProfitUnits * 10;
    const finalMaxBetUnits = maxBetUnits ?? defaultMaxBetUnits;

    if (finalMaxBetUnits < 1) {
      throw new Error("maxBetUnits must be at least 1");
    }

    this.state = {
      baseUnit,
      currentBet: baseUnit,
      currentBetUnits: 1,
      maxBetUnits: finalMaxBetUnits,
      targetProfitUnits,
      currentProfitUnits: 0,
      totalProfit: 0,
      sessionActive: true,
      sessionsCompleted: 0,
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

    const betAmount = this.state.currentBetUnits * this.state.baseUnit;

    // Update statistics
    if (!this.state.statistics) {
      this.state.statistics = initializeStatistics();
    }
    const payout = result === "win" ? betAmount * 2 : 0;
    this.state.statistics = updateStatistics(this.state.statistics, betAmount, result, payout);

    if (result === "win") {
      // Update profit
      this.state.totalProfit += betAmount;
      this.state.currentProfitUnits += this.state.currentBetUnits;

      // Check if target profit reached
      if (this.state.currentProfitUnits >= this.state.targetProfitUnits) {
        // Session completed, start new session
        this.state.sessionsCompleted++;
        this.state.currentProfitUnits = 0;
        this.state.currentBetUnits = 1;
        this.state.currentBet = this.state.baseUnit;
      } else {
        // Increase bet by 1 unit (but not exceeding maxBetUnits)
        this.state.currentBetUnits = Math.min(
          this.state.currentBetUnits + 1,
          this.state.maxBetUnits,
        );
        this.state.currentBet = this.state.currentBetUnits * this.state.baseUnit;
      }
    } else {
      // loss - keep bet the same
      this.state.totalProfit -= betAmount;
      this.state.currentProfitUnits -= this.state.currentBetUnits;
      // currentBetUnits stays the same
    }

    // Update risk metrics
    this.state.statistics = calculateRiskMetrics(this.state.statistics);
  }

  /**
   * Get current state
   */
  getState(): OscarsGrindState {
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
    const { baseUnit, targetProfitUnits, maxBetUnits } = this.state;
    this.initSession(baseUnit, targetProfitUnits, maxBetUnits);
  }
}
