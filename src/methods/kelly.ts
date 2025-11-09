import type { BetResult, KellyCriterionState } from "../types.js";

/**
 * Kelly Criterion betting method calculator
 *
 * The Kelly Criterion calculates the mathematically optimal bet size
 * to maximize long-term growth of bankroll.
 *
 * Formula: f* = (bp - q) / b
 * - f* = optimal bet fraction (percentage of bankroll)
 * - b = payout odds (profit multiplier on win)
 * - p = win probability (0-1)
 * - q = loss probability (1 - p)
 *
 * Fractional Kelly is recommended for practical use (0.25, 0.5, etc.)
 * to reduce volatility while maintaining growth.
 */
export class KellyCriterionMethod {
  private state: KellyCriterionState;

  constructor() {
    this.state = {
      currentBankroll: 0,
      initialBankroll: 0,
      winProbability: 0,
      payoutOdds: 0,
      kellyPercentage: 0,
      fractionalKelly: 0.5,
      minBet: 1,
      maxBet: undefined,
      totalWins: 0,
      totalLosses: 0,
      actualWinRate: 0,
      bankrollHistory: [],
      currentBet: 0,
      totalProfit: 0,
      sessionActive: false,
    };
  }

  /**
   * Initialize a new betting session
   * @param initialBankroll Initial bankroll amount
   * @param winProbability Estimated win probability (0-1)
   * @param payoutOdds Payout odds (profit multiplier, e.g., 2.0 for 2x payout)
   * @param fractionalKelly Fractional Kelly multiplier (0-1, default: 0.5)
   * @param minBet Minimum bet amount (default: 1)
   * @param maxBet Maximum bet amount (optional)
   */
  initSession(
    initialBankroll: number,
    winProbability: number,
    payoutOdds: number,
    fractionalKelly: number = 0.5,
    minBet: number = 1,
    maxBet?: number,
  ): void {
    if (initialBankroll <= 0) {
      throw new Error("initialBankroll must be positive");
    }
    if (winProbability <= 0 || winProbability >= 1) {
      throw new Error("winProbability must be between 0 and 1 (exclusive)");
    }
    if (payoutOdds <= 1) {
      throw new Error("payoutOdds must be greater than 1");
    }
    if (fractionalKelly <= 0 || fractionalKelly > 1) {
      throw new Error("fractionalKelly must be between 0 and 1 (inclusive)");
    }
    if (minBet <= 0) {
      throw new Error("minBet must be positive");
    }
    if (maxBet !== undefined && maxBet < minBet) {
      throw new Error("maxBet must be greater than or equal to minBet");
    }

    const kellyPercentage = this.calculateKelly(winProbability, payoutOdds);

    this.state = {
      currentBankroll: initialBankroll,
      initialBankroll,
      winProbability,
      payoutOdds,
      kellyPercentage,
      fractionalKelly,
      minBet,
      maxBet,
      totalWins: 0,
      totalLosses: 0,
      actualWinRate: 0,
      bankrollHistory: [initialBankroll],
      currentBet: this.calculateRecommendedBet(
        initialBankroll,
        kellyPercentage,
        fractionalKelly,
        minBet,
        maxBet,
      ),
      totalProfit: 0,
      sessionActive: true,
    };
  }

  /**
   * Calculate Kelly percentage using the formula: f* = (bp - q) / b
   * @param winProbability Win probability (p)
   * @param payoutOdds Payout odds (b)
   * @returns Kelly percentage (0-1), or 0 if negative (don't bet)
   */
  private calculateKelly(winProbability: number, payoutOdds: number): number {
    const lossProbability = 1 - winProbability;
    const kelly = (payoutOdds * winProbability - lossProbability) / payoutOdds;

    // If Kelly is negative or zero, expected value is negative - don't bet
    return Math.max(0, kelly);
  }

  /**
   * Calculate recommended bet amount based on Kelly Criterion
   */
  private calculateRecommendedBet(
    bankroll: number,
    kellyPercentage: number,
    fractionalKelly: number,
    minBet: number,
    maxBet?: number,
  ): number {
    if (kellyPercentage <= 0) {
      return 0;
    }

    const recommendedBet = bankroll * kellyPercentage * fractionalKelly;

    // Apply constraints
    let actualBet = Math.max(minBet, recommendedBet);

    if (maxBet !== undefined) {
      actualBet = Math.min(actualBet, maxBet);
    }

    // Don't bet more than current bankroll
    actualBet = Math.min(actualBet, bankroll);

    return Math.round(actualBet * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Record a bet result and update bankroll
   * @param result Bet result (win or loss)
   * @param actualPayout Optional actual payout amount (defaults to bet * payoutOdds)
   */
  recordResult(result: BetResult, actualPayout?: number): void {
    if (!this.state.sessionActive) {
      throw new Error("No active session. Please initialize a session first.");
    }

    const currentBet = this.state.currentBet;

    if (currentBet <= 0) {
      throw new Error("Cannot record result: recommended bet is 0 or negative");
    }

    if (currentBet > this.state.currentBankroll) {
      throw new Error("Cannot record result: bet exceeds current bankroll");
    }

    // Update win/loss counts
    if (result === "win") {
      this.state.totalWins++;
      const payout = actualPayout ?? currentBet * this.state.payoutOdds;
      this.state.currentBankroll += payout - currentBet; // Net profit
      this.state.totalProfit += payout - currentBet;
    } else {
      this.state.totalLosses++;
      this.state.currentBankroll -= currentBet;
      this.state.totalProfit -= currentBet;
    }

    // Update actual win rate
    const totalGames = this.state.totalWins + this.state.totalLosses;
    // totalGames is always > 0 here since we just incremented totalWins or totalLosses
    this.state.actualWinRate = this.state.totalWins / totalGames;

    // Recalculate Kelly percentage (optionally use actual win rate if enough data)
    let effectiveWinProbability = this.state.winProbability;
    if (totalGames >= 30) {
      // Use actual win rate if we have enough data
      effectiveWinProbability = this.state.actualWinRate;
    }

    this.state.kellyPercentage = this.calculateKelly(
      effectiveWinProbability,
      this.state.payoutOdds,
    );

    // Update bankroll history
    this.state.bankrollHistory.push(this.state.currentBankroll);

    // Calculate next bet
    this.state.currentBet = this.calculateRecommendedBet(
      this.state.currentBankroll,
      this.state.kellyPercentage,
      this.state.fractionalKelly,
      this.state.minBet,
      this.state.maxBet,
    );

    // End session if bankroll is too low
    if (this.state.currentBankroll < this.state.minBet) {
      this.state.sessionActive = false;
      this.state.currentBet = 0;
    }
  }

  /**
   * Get current state
   */
  getState(): KellyCriterionState {
    return {
      ...this.state,
      bankrollHistory: [...this.state.bankrollHistory], // Deep copy
    };
  }

  /**
   * Reset the session to initial state
   */
  reset(): void {
    if (!this.state.sessionActive && this.state.initialBankroll === 0) {
      throw new Error("Cannot reset: no session has been initialized");
    }

    const initialBankroll = this.state.initialBankroll;
    const winProbability = this.state.winProbability;
    const payoutOdds = this.state.payoutOdds;
    const fractionalKelly = this.state.fractionalKelly;
    const minBet = this.state.minBet;
    const maxBet = this.state.maxBet;

    this.initSession(initialBankroll, winProbability, payoutOdds, fractionalKelly, minBet, maxBet);
  }
}
