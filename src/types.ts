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
 * Cocomo method specific state
 */
export interface CocomoState extends BettingMethodState {
  baseUnit: number;
  previousBet: number;
  currentStreak: number;
  maxBet: number;
  reachedLimit: boolean;
  payoutMultiplier: number;
}

/**
 * Labouchere method specific state
 */
export interface LabouchereState extends BettingMethodState {
  baseUnit: number;
  sequence: number[];
  initialSequence: number[];
  targetProfit: number;
  maxSequenceLength: number;
  sessionsCompleted: number;
  reachedLimit: boolean;
}

/**
 * Oscar's Grind method specific state
 */
export interface OscarsGrindState extends BettingMethodState {
  baseUnit: number;
  currentBetUnits: number;
  maxBetUnits: number;
  targetProfitUnits: number;
  currentProfitUnits: number;
  sessionsCompleted: number;
}

/**
 * D'Alembert method specific state
 */
export interface DAlembertState extends BettingMethodState {
  baseUnit: number;
  maxBet?: number;
  reachedLimit: boolean;
}
