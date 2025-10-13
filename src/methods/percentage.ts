import type { BetResult, PercentageState } from "../types.js";

/**
 * Percentage betting method calculator (Fixed Percentage Betting / 10%法)
 *
 * The Percentage method bets a fixed percentage of the current bankroll.
 * - Bet amount = Current bankroll × Bet percentage (minimum: minBet)
 * - On win: Bankroll increases, next bet increases
 * - On loss: Bankroll decreases, next bet decreases
 * - This method reduces bankruptcy risk while pursuing profits
 */
export class PercentageMethod {
  private state: PercentageState;

  constructor() {
    this.state = {
      initialBankroll: 0,
      currentBankroll: 0,
      betPercentage: 0,
      minBet: 0,
      currentBet: 0,
      totalWins: 0,
      totalLosses: 0,
      totalProfit: 0,
      profitPercentage: 0,
      sessionActive: false,
    };
  }

  /**
   * Initialize a new betting session
   */
  initSession(initialBankroll: number, betPercentage: number, minBet: number): void {
    if (initialBankroll <= 0) {
      throw new Error("initialBankroll must be positive");
    }

    if (betPercentage <= 0 || betPercentage > 1) {
      throw new Error("betPercentage must be between 0 and 1");
    }

    if (minBet <= 0) {
      throw new Error("minBet must be positive");
    }

    if (minBet > initialBankroll) {
      throw new Error("minBet must be less than or equal to initialBankroll");
    }

    const calculatedBet = Math.max(minBet, Math.floor(initialBankroll * betPercentage));

    this.state = {
      initialBankroll,
      currentBankroll: initialBankroll,
      betPercentage,
      minBet,
      currentBet: calculatedBet,
      totalWins: 0,
      totalLosses: 0,
      totalProfit: 0,
      profitPercentage: 0,
      sessionActive: true,
    };
  }

  /**
   * Record a bet result and update the bankroll
   */
  recordResult(result: BetResult): void {
    if (!this.state.sessionActive) {
      throw new Error("No active session. Please initialize a session first.");
    }

    const currentBetAmount = this.state.currentBet;

    if (result === "win") {
      // Update bankroll and profit
      this.state.currentBankroll += currentBetAmount;
      this.state.totalProfit += currentBetAmount;
      this.state.totalWins++;
    } else {
      // loss
      this.state.currentBankroll -= currentBetAmount;
      this.state.totalProfit -= currentBetAmount;
      this.state.totalLosses++;
    }

    // Calculate profit percentage
    this.state.profitPercentage =
      ((this.state.currentBankroll - this.state.initialBankroll) / this.state.initialBankroll) *
      100;

    // Check if bankroll is below minimum bet
    if (this.state.currentBankroll < this.state.minBet) {
      this.state.sessionActive = false;
      this.state.currentBet = 0;
      return;
    }

    // Calculate next bet
    this.state.currentBet = Math.max(
      this.state.minBet,
      Math.floor(this.state.currentBankroll * this.state.betPercentage),
    );
  }

  /**
   * Get current state
   */
  getState(): PercentageState {
    return { ...this.state };
  }

  /**
   * Reset the session
   */
  reset(): void {
    const { initialBankroll, betPercentage, minBet } = this.state;
    this.initSession(initialBankroll, betPercentage, minBet);
  }
}
