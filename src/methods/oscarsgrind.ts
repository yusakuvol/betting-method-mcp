import type { BetResult, OscarsGrindState } from "../types.js";

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
  }

  /**
   * Get current state
   */
  getState(): OscarsGrindState {
    return { ...this.state };
  }

  /**
   * Reset the session
   */
  reset(): void {
    const { baseUnit, targetProfitUnits, maxBetUnits } = this.state;
    this.initSession(baseUnit, targetProfitUnits, maxBetUnits);
  }
}
