import { cached } from './cache.js'
import { fetchFundingForSymbol, krakenSymbol } from './futures.js'

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with ${res.status}`)
  }
  return res.json()
}

async function fetchHourlyCandles(symbol) {
  const from = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 20 // 20 days of 1h candles
  const json = await fetchJson(`https://futures.kraken.com/api/charts/v1/trade/${symbol}/1h?from=${from}`)
  return (json.candles ?? []).map((c) => ({
    time: c.time,
    open: Number(c.open),
    high: Number(c.high),
    low: Number(c.low),
    close: Number(c.close),
    volume: Number(c.volume),
  }))
}

function ema(values, period) {
  const out = new Array(values.length).fill(null)
  if (values.length < period) return out
  const k = 2 / (period + 1)
  let prev = values.slice(0, period).reduce((a, b) => a + b, 0) / period
  out[period - 1] = prev
  for (let i = period; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k)
    out[i] = prev
  }
  return out
}

function rsi(closes, period = 14) {
  const out = new Array(closes.length).fill(null)
  if (closes.length < period + 1) return out
  let gainSum = 0
  let lossSum = 0
  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1]
    if (change > 0) gainSum += change
    else lossSum -= change
  }
  let avgGain = gainSum / period
  let avgLoss = lossSum / period
  out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)
  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1]
    const gain = change > 0 ? change : 0
    const loss = change < 0 ? -change : 0
    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period
    out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)
  }
  return out
}

function macd(closes, fast = 12, slow = 26, signalPeriod = 9) {
  const emaFast = ema(closes, fast)
  const emaSlow = ema(closes, slow)
  const line = closes.map((_, i) => (emaFast[i] !== null && emaSlow[i] !== null ? emaFast[i] - emaSlow[i] : null))
  const lineValues = line.filter((v) => v !== null)
  const signalOnValid = ema(lineValues, signalPeriod)
  const signal = new Array(closes.length).fill(null)
  let vi = 0
  for (let i = 0; i < closes.length; i++) {
    if (line[i] !== null) {
      signal[i] = signalOnValid[vi] ?? null
      vi++
    }
  }
  const histogram = closes.map((_, i) => (line[i] !== null && signal[i] !== null ? line[i] - signal[i] : null))
  return { line, signal, histogram }
}

function atr(candles, period = 14) {
  const trs = candles.map((c, i) => {
    if (i === 0) return c.high - c.low
    return Math.max(c.high - c.low, Math.abs(c.high - candles[i - 1].close), Math.abs(c.low - candles[i - 1].close))
  })
  const out = ema(trs, period)
  return out
}

function lastValid(arr) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] !== null) return arr[i]
  }
  return null
}

export async function getTokenAnalysis(ticker) {
  const symbol = krakenSymbol(ticker)
  return cached(`token-analysis:${symbol}`, 5 * 60 * 1000, async () => {
    const candles = await fetchHourlyCandles(symbol)
    if (candles.length < 60) throw new Error(`Not enough candle history for ${symbol}`)

    const closes = candles.map((c) => c.close)
    const price = closes[closes.length - 1]

    const ema20Series = ema(closes, 20)
    const ema50Series = ema(closes, 50)
    const ema20 = lastValid(ema20Series)
    const ema50 = lastValid(ema50Series)

    let trend
    if (price > ema20 && ema20 > ema50) trend = 'Bullish'
    else if (price < ema20 && ema20 < ema50) trend = 'Bearish'
    else trend = 'Mixed'

    const rsiSeries = rsi(closes, 14)
    const rsi14 = lastValid(rsiSeries)
    let momentum
    if (rsi14 >= 70) momentum = 'Overbought'
    else if (rsi14 <= 30) momentum = 'Oversold'
    else if (rsi14 >= 50) momentum = 'Bullish'
    else momentum = 'Bearish'

    const { line, signal, histogram } = macd(closes)
    const macdLine = lastValid(line)
    const macdSignal = lastValid(signal)
    const macdHistogram = lastValid(histogram)

    const atrSeries = atr(candles, 14)
    const atr14 = lastValid(atrSeries)
    const atrPct = (atr14 / price) * 100

    const funding = await fetchFundingForSymbol(ticker).catch(() => null)

    const series = candles.slice(-90).map((c) => ({ time: c.time, close: c.close }))

    return {
      symbol: ticker.toUpperCase(),
      price,
      ema20,
      ema50,
      trend,
      rsi14,
      momentum,
      macd: { line: macdLine, signal: macdSignal, histogram: macdHistogram },
      atr14,
      atrPct,
      funding: funding ? { currentPct: funding.currentPct, status: funding.status } : null,
      series,
      updatedAt: candles[candles.length - 1].time,
    }
  })
}
