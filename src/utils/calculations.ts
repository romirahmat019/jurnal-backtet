import { TradeDirection, TradeResult } from '../types/trade';

export interface CalculationResult {
  riskDistance: number;
  rewardDistance: number;
  rrPlanned: number;
  actualR: number;
  result: TradeResult;
  warning?: string;
}

/**
 * Calculates planned RR, actual R, and result based on price levels and direction.
 */
export function calculateTradeMetrics(
  direction: TradeDirection,
  entry: number,
  stopLoss: number,
  takeProfit: number,
  exit?: number
): CalculationResult {
  const riskDistance = Math.abs(entry - stopLoss);
  const rewardDistance = Math.abs(takeProfit - entry);

  let warning: string | undefined;

  // Validation warnings on SL placement
  if (direction === 'BUY' && stopLoss >= entry) {
    warning = 'Check Stop Loss placement: Pada posisi BUY, Stop Loss idealnya berada di bawah Entry.';
  } else if (direction === 'SELL' && stopLoss <= entry) {
    warning = 'Check Stop Loss placement: Pada posisi SELL, Stop Loss idealnya berada di atas Entry.';
  }

  // Planned RR
  const rrPlanned = riskDistance > 0 ? Number((rewardDistance / riskDistance).toFixed(2)) : 0;

  // Actual R
  let actualR = 0;
  let result: TradeResult = 'BE';

  if (exit !== undefined && exit !== null && !isNaN(exit) && exit > 0 && riskDistance > 0) {
    const rawProfit = direction === 'BUY' ? (exit - entry) : (entry - exit);
    actualR = Number((rawProfit / riskDistance).toFixed(2));

    if (actualR >= 0.1) {
      result = 'WIN';
    } else if (actualR <= -0.1) {
      result = 'LOSS';
    } else {
      result = 'BE';
    }
  }

  return {
    riskDistance,
    rewardDistance,
    rrPlanned,
    actualR,
    result,
    warning,
  };
}

/**
 * Estimates dollar P&L based on R result and Risk Amount ($)
 */
export function estimateProfitLoss(resultR: number, riskAmount: number): number {
  return Number((resultR * riskAmount).toFixed(2));
}

/**
 * Normalizes decimal digits for display
 */
export function formatPrice(price: number, pair: string = ''): string {
  if (isNaN(price) || price === null || price === undefined) return '-';
  const upper = pair.toUpperCase();
  if (upper.includes('JPY')) {
    return price.toFixed(3);
  }
  if (upper.includes('XAU') || upper.includes('GOLD') || upper.includes('BTC') || upper.includes('US30')) {
    return price.toFixed(2);
  }
  return price.toFixed(5);
}
