/**
 * Common types for betting method calculations
 */

/**
 * Result of a bet (win or loss)
 */
export type BetResult = "win" | "loss";

/**
 * Base interface for betting method state
 */
export interface BettingMethodState {
  currentBet: number;
  totalProfit: number;
  sessionActive: boolean;
}

/**
 * Monte Carlo method specific state
 */
export interface MonteCarloState extends BettingMethodState {
  sequence: number[];
  baseUnit: number;
}

/**
 * Parameters for initializing a betting session
 */
export interface InitSessionParams {
  baseUnit: number;
}

/**
 * Parameters for recording a bet result
 */
export interface RecordResultParams {
  result: BetResult;
}

/**
 * Martingale method specific state
 */
export interface MartingaleState extends BettingMethodState {
  baseUnit: number;
  currentStreak: number;
  maxBet: number;
  maxLossStreak: number;
  reachedLimit: boolean;
}

/**
 * Goodman method specific state
 */
export interface GoodmanState extends BettingMethodState {
  baseUnit: number;
  sequence: number[];
  currentStep: number;
  winStreak: number;
  cyclesCompleted: number;
}
