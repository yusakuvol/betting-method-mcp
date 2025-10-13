import type { BetResult, PercentageState } from "../types.js";

/**
 * Percentage (Fixed Percentage Betting) method calculator
 *
 * The Percentage method bets a fixed percentage of the current bankroll.
 * - Start with an initial bankroll
 * - Set a bet percentage (e.g., 10% = 0.1)
 * - Set a minimum bet amount (floor when bankroll is low)
 * - Bet = max(minBet, floor(currentBankroll × betPercentage))
 * - On win: Bankroll increases, next bet increases
 * - On loss: Bankroll decreases, next bet decreases
 * - Excellent money management: reduces bankruptcy risk
 */
export class PercentageMethod {
  private state: PercentageState;

  constructor() {
    this.state = {
      initialBankroll: 0,
      currentBankroll: 0,
      betPercentage: 0.1,
      minBet: 1,
      currentBet: 0,
      totalWins: 0,
      totalLosses: 0,
      totalProfit: 0,
      sessionActive: false,
      profitPercentage: 0,
    };
  }

  /**
   * Initialize a new betting session
   */
  initSession(initialBankroll: number, betPercentage: number, minBet: number): void {
    // Validate initialBankroll
    if (initialBankroll <= 0) {
      throw new Error("initialBankroll must be positive");
    }

    // Validate betPercentage
    if (betPercentage <= 0 || betPercentage > 1) {
      throw new Error("betPercentage must be between 0 and 1");
    }

    // Validate minBet
    if (minBet <= 0) {
      throw new Error("minBet must be positive");
    }

    // Validate that minBet is not greater than initialBankroll
    if (minBet > initialBankroll) {
      throw new Error("minBet must not be greater than initialBankroll");
    }

    // Calculate initial bet
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
      sessionActive: true,
      profitPercentage: 0,
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

    // Check if bankroll is below minimum bet (session should end)
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
