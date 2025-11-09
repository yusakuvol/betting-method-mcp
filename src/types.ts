/**
 * Common types for betting method calculations
 */

/**
 * Result of a bet (win or loss)
 */
export type BetResult = "win" | "loss";

/**
 * Session statistics for betting methods
 */
export interface SessionStatistics {
  // Basic statistics
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;

  // Streaks
  currentStreak: number; // Positive: winning streak, Negative: losing streak
  maxWinStreak: number;
  maxLossStreak: number;

  // Financial
  totalWagered: number; // Total amount bet
  totalReturned: number; // Total amount returned (wins)
  netProfit: number; // Net profit (totalReturned - totalWagered)
  roi: number; // Return on Investment (%)

  // Bet amount statistics
  averageBet: number;
  minBet: number;
  maxBet: number;

  // Bankroll statistics (optional, for methods with bankroll)
  peakBankroll?: number;
  lowestBankroll?: number;
  drawdown?: number; // Maximum drawdown (%)

  // Risk metrics (optional)
  volatility?: number; // Standard deviation of bet amounts
  sharpeRatio?: number; // Sharpe ratio (risk-adjusted return)

  // History (optional, for detailed analysis)
  betHistory?: number[]; // Bet amount history
  bankrollHistory?: number[]; // Bankroll history
  outcomeHistory?: BetResult[]; // Win/loss history
}

/**
 * Base interface for betting method state
 */
export interface BettingMethodState {
  currentBet: number;
  totalProfit: number;
  sessionActive: boolean;
  statistics?: SessionStatistics;
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

/**
 * Fibonacci method specific state
 */
export interface FibonacciState extends BettingMethodState {
  baseUnit: number;
  sequence: number[];
  currentIndex: number;
  maxIndex: number;
  reachedLimit: boolean;
}

/**
 * Paroli method specific state
 */
export interface ParoliState extends BettingMethodState {
  baseUnit: number;
  winStreak: number;
  targetWinStreak: number;
  cyclesCompleted: number;
}

/**
 * Percentage (Fixed Percentage Betting) method specific state
 */
export interface PercentageState extends BettingMethodState {
  initialBankroll: number;
  currentBankroll: number;
  betPercentage: number;
  minBet: number;
  totalWins: number;
  totalLosses: number;
  profitPercentage: number;
}

/**
 * Kelly Criterion method specific state
 */
export interface KellyCriterionState extends BettingMethodState {
  currentBankroll: number;
  initialBankroll: number;
  winProbability: number;
  payoutOdds: number;
  kellyPercentage: number;
  fractionalKelly: number;
  minBet: number;
  maxBet?: number;
  totalWins: number;
  totalLosses: number;
  actualWinRate: number;
  bankrollHistory: number[];
}
