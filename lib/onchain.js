import { cached } from './cache.js'
import { getBtcHistory } from './coinmetrics.js'

function mean(values) {
  return values.reduce((a, b) => a + b, 0) / values.length
}

function stddev(values, avg) {
  const variance = values.reduce((a, b) => a + (b - avg) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

function sma(values, period) {
  const out = new Array(values.length).fill(null)
  let sum = 0
  for (let i = 0; i < values.length; i++) {
    sum += values[i]
    if (i >= period) sum -= values[i - period]
    if (i >= period - 1) out[i] = sum / period
  }
  return out
}

function ema(values, period) {
  const out = new Array(values.length).fill(null)
  if (values.length < period) return out
  const k = 2 / (period + 1)
  let prev = mean(values.slice(0, period))
  out[period - 1] = prev
  for (let i = period; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k)
    out[i] = prev
  }
  return out
}

export async function getMvrvZScore() {
  return cached('mvrv-zscore', 6 * 60 * 60 * 1000, async () => {
    const history = await getBtcHistory()
    const withMvrv = history.filter((d) => d.mvrv !== null && d.marketCap !== null)
    const marketCaps = withMvrv.map((d) => d.marketCap)
    const realizedCaps = withMvrv.map((d) => d.marketCap / d.mvrv)
    const avgMcap = mean(marketCaps)
    const std = stddev(marketCaps, avgMcap)

    const series = withMvrv.map((d, i) => ({
      date: d.date,
      value: (marketCaps[i] - realizedCaps[i]) / std,
    }))

    const values = series.map((p) => p.value)
    const current = values[values.length - 1]
    const status = current < 0 ? 'Undervalued' : current < 1.5 ? 'Neutral' : 'Overvalued'
    const signal = status === 'Undervalued' ? 'BUY' : status === 'Neutral' ? 'HOLD' : 'TAKE PROFIT'

    return {
      current,
      status,
      signal,
      historyRange: { min: Math.min(...values), max: Math.max(...values) },
      series: series.slice(-365 * 8).filter((_, i) => i % 7 === 0),
      updatedAt: series[series.length - 1].date,
    }
  })
}

const HALVINGS = [
  { date: Date.parse('2009-01-03'), reward: 50 },
  { date: Date.parse('2012-11-28'), reward: 25 },
  { date: Date.parse('2016-07-09'), reward: 12.5 },
  { date: Date.parse('2020-05-11'), reward: 6.25 },
  { date: Date.parse('2024-04-20'), reward: 3.125 },
]
const BLOCKS_PER_DAY = 144

function rewardForDate(ts) {
  let reward = HALVINGS[0].reward
  for (const h of HALVINGS) {
    if (ts >= h.date) reward = h.reward
  }
  return reward
}

export async function getPuellMultiple() {
  return cached('puell-multiple', 6 * 60 * 60 * 1000, async () => {
    const history = await getBtcHistory()
    const issuanceValue = history.map((d) => rewardForDate(d.date) * BLOCKS_PER_DAY * d.price)

    const series = []
    let windowSum = 0
    for (let i = 0; i < history.length; i++) {
      windowSum += issuanceValue[i]
      if (i >= 365) windowSum -= issuanceValue[i - 365]
      if (i >= 364) {
        const ma365 = windowSum / 365
        series.push({ date: history[i].date, value: issuanceValue[i] / ma365 })
      }
    }

    const values = series.map((p) => p.value)
    const current = values[values.length - 1]
    const status = current < 0.5 ? 'Low' : current < 4 ? 'Normal' : 'High'
    const signal = status === 'Low' ? 'BUY' : status === 'Normal' ? 'NEUTRAL' : 'OVERHEATED'

    return {
      current,
      status,
      signal,
      historyRange: { min: Math.min(...values), max: Math.max(...values) },
      series: series.slice(-365 * 8).filter((_, i) => i % 7 === 0),
      updatedAt: series[series.length - 1].date,
    }
  })
}

export async function getPiCycleBottom() {
  return cached('pi-cycle-bottom', 6 * 60 * 60 * 1000, async () => {
    const history = await getBtcHistory()
    const prices = history.map((d) => d.price)
    const ema150 = ema(prices, 150)
    const sma471 = sma(prices, 471)

    const crossovers = []
    for (let i = 1; i < prices.length; i++) {
      if (ema150[i] === null || sma471[i] === null || ema150[i - 1] === null || sma471[i - 1] === null) continue
      const shortPrev = ema150[i - 1] * 0.745
      const shortCur = ema150[i] * 0.745
      if (shortPrev < sma471[i - 1] && shortCur >= sma471[i]) {
        crossovers.push(history[i].date)
      }
    }

    const lastIdx = prices.length - 1
    const shortLine = ema150[lastIdx] * 0.745
    const longLine = sma471[lastIdx]
    const gapPct = ((shortLine - longLine) / longLine) * 100
    const daysSinceLastCross = crossovers.length
      ? Math.round((history[lastIdx].date - crossovers[crossovers.length - 1]) / 86_400_000)
      : null

    let status
    let signal
    if (daysSinceLastCross !== null && daysSinceLastCross <= 14) {
      status = 'Bottom Signal Active'
      signal = 'Bottom Signal Active'
    } else if (gapPct < 0 && gapPct >= -15) {
      status = 'Approaching Bottom'
      signal = 'Approaching Bottom'
    } else {
      status = 'No Signal'
      signal = 'No Signal'
    }

    const series = history
      .map((d, i) => ({ date: d.date, short: ema150[i] !== null ? ema150[i] * 0.745 : null, long: sma471[i] }))
      .filter((p) => p.short !== null && p.long !== null)
      .slice(-365 * 8)
      .filter((_, i) => i % 7 === 0)

    return {
      status,
      signal,
      gapPct,
      shortLine,
      longLine,
      previousSignals: crossovers.slice(-8),
      series,
      updatedAt: history[lastIdx].date,
    }
  })
}
