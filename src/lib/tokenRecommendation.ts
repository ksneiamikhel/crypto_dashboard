import type { TokenAnalysis } from '../types'
import type { BullishScoreResult } from './scoring'

export type TradeAction = 'Long' | 'Short' | 'Neutral'
export type Confidence = 'High' | 'Medium' | 'Low'

export type TokenRecommendation = {
  action: TradeAction
  confidence: Confidence
  score: number
  breakdown: { label: string; score: number }[]
  rationale: string[]
}

const WEIGHTS = { trend: 0.35, momentum: 0.3, positioning: 0.15, macro: 0.2 }

function trendScore(trend: TokenAnalysis['trend']) {
  if (trend === 'Bullish') return 90
  if (trend === 'Bearish') return 10
  return 50
}

function momentumScore(analysis: TokenAnalysis) {
  let base: number
  if (analysis.momentum === 'Overbought') base = 45
  else if (analysis.momentum === 'Oversold') base = 55
  else if (analysis.momentum === 'Bullish') base = 75
  else base = 25

  if (analysis.macd.histogram > 0) base += 10
  else if (analysis.macd.histogram < 0) base -= 10
  return Math.max(0, Math.min(100, base))
}

function positioningScore(analysis: TokenAnalysis) {
  if (!analysis.funding) return 50
  if (analysis.funding.status === 'Bullish') return 90
  if (analysis.funding.status === 'Bearish') return 10
  return 50
}

function actionFor(score: number): TradeAction {
  if (score >= 65) return 'Long'
  if (score <= 35) return 'Short'
  return 'Neutral'
}

function bucket(score: number): 'bullish' | 'bearish' | 'mixed' {
  if (score >= 60) return 'bullish'
  if (score <= 40) return 'bearish'
  return 'mixed'
}

function confidenceFor(trend: number, momentum: number, positioning: number): Confidence {
  const buckets = [bucket(trend), bucket(momentum), bucket(positioning)]
  const bullishCount = buckets.filter((b) => b === 'bullish').length
  const bearishCount = buckets.filter((b) => b === 'bearish').length
  if (bullishCount === 3 || bearishCount === 3) return 'High'
  if (bullishCount === 2 || bearishCount === 2) return 'Medium'
  return 'Low'
}

export function computeTokenRecommendation(
  analysis: TokenAnalysis,
  macro: BullishScoreResult,
): TokenRecommendation {
  const trend = trendScore(analysis.trend)
  const momentum = momentumScore(analysis)
  const positioning = positioningScore(analysis)
  const macroScore = macro.score

  const score = Math.round(
    trend * WEIGHTS.trend + momentum * WEIGHTS.momentum + positioning * WEIGHTS.positioning + macroScore * WEIGHTS.macro,
  )

  const rationale: string[] = []
  rationale.push(
    `Trend (1h): price is ${analysis.trend === 'Bullish' ? 'above' : analysis.trend === 'Bearish' ? 'below' : 'straddling'} EMA20/EMA50 — ${analysis.trend.toLowerCase()} structure.`,
  )
  rationale.push(
    `Momentum: RSI14 at ${analysis.rsi14.toFixed(1)} (${analysis.momentum}), MACD histogram ${analysis.macd.histogram >= 0 ? 'positive' : 'negative'} (${analysis.macd.histogram.toFixed(analysis.price < 10 ? 5 : 2)}).`,
  )
  rationale.push(
    analysis.funding
      ? `Positioning: funding rate ${analysis.funding.currentPct >= 0 ? '+' : ''}${analysis.funding.currentPct.toFixed(4)}% (${analysis.funding.status}).`
      : 'Positioning: funding rate unavailable for this asset.',
  )
  rationale.push(`Macro regime (BTC composite): ${macro.band} (score ${macro.score}/100).`)
  rationale.push(`ATR14 is ${analysis.atrPct.toFixed(2)}% of price — use this to size stops on the 1h chart.`)

  return {
    action: actionFor(score),
    confidence: confidenceFor(trend, momentum, positioning),
    score,
    breakdown: [
      { label: 'Trend (1h)', score: trend },
      { label: 'Momentum', score: momentum },
      { label: 'Positioning', score: positioning },
      { label: 'Macro regime', score: macroScore },
    ],
    rationale,
  }
}
