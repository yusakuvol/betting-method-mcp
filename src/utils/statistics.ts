import type { BetResult, SessionStatistics } from "../types.js";

/**
 * Calculate win rate from wins and losses
 */
export function calculateWinRate(wins: number, losses: number): number {
  const total = wins + losses;
  return total > 0 ? wins / total : 0;
}

/**
 * Calculate ROI (Return on Investment) percentage
 */
export function calculateROI(netProfit: number, totalWagered: number): number {
  return totalWagered > 0 ? (netProfit / totalWagered) * 100 : 0;
}

/**
 * Calculate maximum drawdown from bankroll history
 */
export function calculateDrawdown(bankrollHistory: number[]): number {
  if (bankrollHistory.length === 0) {
    return 0;
  }

  let peak = bankrollHistory[0];
  let maxDrawdown = 0;

  for (const current of bankrollHistory) {
    if (current > peak) {
      peak = current;
    }
    const drawdown = peak > 0 ? ((peak - current) / peak) * 100 : 0;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return maxDrawdown;
}

/**
 * Calculate volatility (standard deviation) of values
 */
export function calculateVolatility(values: number[]): number {
  if (values.length < 2) {
    return 0;
  }

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length;

  return Math.sqrt(variance);
}

/**
 * Calculate Sharpe ratio (risk-adjusted return)
 * @param returns Array of returns (profit/loss per bet)
 * @param riskFreeRate Risk-free rate (default: 0)
 */
export function calculateSharpeRatio(returns: number[], riskFreeRate: number = 0): number {
  if (returns.length < 2) {
    return 0;
  }

  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const volatility = calculateVolatility(returns);

  if (volatility === 0) {
    return 0;
  }

  return (avgReturn - riskFreeRate) / volatility;
}

/**
 * Update streak based on result
 * @param currentStreak Current streak (positive: winning, negative: losing)
 * @param result Bet result
 * @returns Updated streak
 */
export function updateStreak(currentStreak: number, result: BetResult): number {
  if (result === "win") {
    return currentStreak >= 0 ? currentStreak + 1 : 1;
  } else {
    return currentStreak <= 0 ? currentStreak - 1 : -1;
  }
}

/**
 * Initialize empty statistics
 * @param enableHistory Enable history tracking (betHistory, outcomeHistory)
 */
export function initializeStatistics(enableHistory: boolean = true): SessionStatistics {
  return {
    totalGames: 0,
    totalWins: 0,
    totalLosses: 0,
    winRate: 0,
    currentStreak: 0,
    maxWinStreak: 0,
    maxLossStreak: 0,
    totalWagered: 0,
    totalReturned: 0,
    netProfit: 0,
    roi: 0,
    averageBet: 0,
    minBet: Infinity,
    maxBet: 0,
    betHistory: enableHistory ? [] : undefined,
    outcomeHistory: enableHistory ? [] : undefined,
  };
}

/**
 * Update statistics with a new bet result
 */
export function updateStatistics(
  stats: SessionStatistics,
  betAmount: number,
  result: BetResult,
  payout?: number, // Optional payout amount (defaults to 2x for win)
): SessionStatistics {
  const newStats = { ...stats };

  // Basic statistics
  newStats.totalGames++;
  if (result === "win") {
    newStats.totalWins++;
    const actualPayout = payout ?? betAmount * 2; // Default 2x payout
    newStats.totalReturned += actualPayout;
  } else {
    newStats.totalLosses++;
  }

  newStats.winRate = calculateWinRate(newStats.totalWins, newStats.totalLosses);

  // Streaks
  newStats.currentStreak = updateStreak(newStats.currentStreak, result);
  if (result === "win" && newStats.currentStreak > newStats.maxWinStreak) {
    newStats.maxWinStreak = newStats.currentStreak;
  }
  if (result === "loss" && Math.abs(newStats.currentStreak) > newStats.maxLossStreak) {
    newStats.maxLossStreak = Math.abs(newStats.currentStreak);
  }

  // Financial
  newStats.totalWagered += betAmount;
  newStats.netProfit = newStats.totalReturned - newStats.totalWagered;
  newStats.roi = calculateROI(newStats.netProfit, newStats.totalWagered);

  // Bet amount statistics
  newStats.averageBet = newStats.totalWagered / newStats.totalGames;
  newStats.minBet = Math.min(newStats.minBet, betAmount);
  newStats.maxBet = Math.max(newStats.maxBet, betAmount);

  // History (if enabled)
  if (newStats.betHistory) {
    newStats.betHistory = [...newStats.betHistory, betAmount];
  }
  if (newStats.outcomeHistory) {
    newStats.outcomeHistory = [...newStats.outcomeHistory, result];
  }

  return newStats;
}

/**
 * Update bankroll-related statistics
 */
export function updateBankrollStatistics(
  stats: SessionStatistics,
  currentBankroll: number,
  initialBankroll?: number,
): SessionStatistics {
  const newStats = { ...stats };

  if (!newStats.bankrollHistory) {
    newStats.bankrollHistory = [];
  }

  newStats.bankrollHistory = [...newStats.bankrollHistory, currentBankroll];

  if (initialBankroll !== undefined) {
    if (newStats.peakBankroll === undefined) {
      newStats.peakBankroll = initialBankroll;
      newStats.lowestBankroll = initialBankroll;
    }

    newStats.peakBankroll = Math.max(newStats.peakBankroll, currentBankroll);
    newStats.lowestBankroll = Math.min(newStats.lowestBankroll ?? currentBankroll, currentBankroll);

    if (newStats.bankrollHistory.length > 0) {
      newStats.drawdown = calculateDrawdown(newStats.bankrollHistory);
    }
  }

  return newStats;
}

/**
 * Calculate risk metrics (volatility, Sharpe ratio)
 */
export function calculateRiskMetrics(stats: SessionStatistics): SessionStatistics {
  const newStats = { ...stats };

  if (stats.betHistory && stats.betHistory.length >= 2) {
    newStats.volatility = calculateVolatility(stats.betHistory);
  }

  if (stats.outcomeHistory && stats.betHistory) {
    // Calculate returns (profit/loss per bet)
    const returns: number[] = [];
    for (let i = 0; i < stats.outcomeHistory.length; i++) {
      const result = stats.outcomeHistory[i];
      const bet = stats.betHistory[i];
      if (result === "win") {
        returns.push(bet); // Profit = bet amount (assuming 2x payout)
      } else {
        returns.push(-bet); // Loss = -bet amount
      }
    }

    if (returns.length >= 2) {
      newStats.sharpeRatio = calculateSharpeRatio(returns);
    }
  }

  return newStats;
}

/**
 * Generate human-readable summary of statistics
 */
export function generateSummary(stats: SessionStatistics): string {
  const parts: string[] = [];

  parts.push(`${stats.totalGames}ゲーム、勝率${(stats.winRate * 100).toFixed(1)}%`);

  if (stats.netProfit !== 0) {
    const sign = stats.netProfit >= 0 ? "+" : "";
    parts.push(`純利益${sign}${stats.netProfit.toFixed(2)}（ROI ${stats.roi.toFixed(1)}%）`);
  }

  if (stats.maxWinStreak > 0 || stats.maxLossStreak > 0) {
    const streaks: string[] = [];
    if (stats.maxWinStreak > 0) {
      streaks.push(`最大連勝${stats.maxWinStreak}回`);
    }
    if (stats.maxLossStreak > 0) {
      streaks.push(`最大連敗${stats.maxLossStreak}回`);
    }
    parts.push(streaks.join("、"));
  }

  if (stats.drawdown !== undefined && stats.drawdown > 0) {
    parts.push(`最大ドローダウン${stats.drawdown.toFixed(1)}%`);
  }

  return `${parts.join("。")}。`;
}
