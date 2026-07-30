import type { FearGreedPoint, FundingRate, MvrvZScore, PiCycleBottom, PuellMultiple } from '../types'

export type BullishBand = 'Strong Buy' | 'Bullish' | 'Neutral' | 'Caution' | 'High Risk'

export type ScoreBreakdownItem = {
  label: string
  score: number
}

export type BullishScoreResult = {
  score: number
  band: BullishBand
  breakdown: ScoreBreakdownItem[]
}

function mvrvScore(mvrv: MvrvZScore) {
  if (mvrv.status === 'Undervalued') return 90
  if (mvrv.status === 'Overvalued') return 10
  return 50
}

function puellScore(puell: PuellMultiple) {
  if (puell.status === 'Low') return 90
  if (puell.status === 'High') return 10
  return 50
}

function piCycleScore(pi: PiCycleBottom) {
  if (pi.status === 'Bottom Signal Active') return 90
  if (pi.status === 'Approaching Bottom') return 65
  return 50
}

function fearGreedScore(latest: FearGreedPoint) {
  const v = latest.value
  if (v < 20) return 90
  if (v < 40) return 70
  if (v < 60) return 50
  if (v < 80) return 30
  return 10
}

function fundingScore(funding: FundingRate) {
  if (funding.status === 'Bullish') return 90
  if (funding.status === 'Bearish') return 10
  return 50
}

function bandFor(score: number): BullishBand {
  if (score >= 90) return 'Strong Buy'
  if (score >= 70) return 'Bullish'
  if (score >= 40) return 'Neutral'
  if (score >= 20) return 'Caution'
  return 'High Risk'
}

export function computeBullishScore(
  mvrv: MvrvZScore,
  puell: PuellMultiple,
  pi: PiCycleBottom,
  fearGreedLatest: FearGreedPoint,
  funding: FundingRate,
): BullishScoreResult {
  const breakdown: ScoreBreakdownItem[] = [
    { label: 'MVRV Z-Score', score: mvrvScore(mvrv) },
    { label: 'Pi Cycle Bottom', score: piCycleScore(pi) },
    { label: 'Puell Multiple', score: puellScore(puell) },
    { label: 'Fear & Greed', score: fearGreedScore(fearGreedLatest) },
    { label: 'Funding Rate', score: fundingScore(funding) },
  ]
  const score = Math.round(breakdown.reduce((a, b) => a + b.score, 0) / breakdown.length)
  return { score, band: bandFor(score), breakdown }
}
