import { cached } from './cache.js'

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with ${res.status}`)
  }
  return res.json()
}

function classify(ratePct) {
  if (ratePct < -0.02) return { status: 'Bullish', signal: 'Strong Long Opportunity' }
  if (ratePct > 0.02) return { status: 'Bearish', signal: 'Overcrowded Longs' }
  return { status: 'Neutral', signal: 'Neutral' }
}

async function fetchFundingForSymbol(ticker) {
  const symbol = `${ticker.toUpperCase()}USDT`
  const [premium, history] = await Promise.all([
    fetchJson(`https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${symbol}`),
    fetchJson(`https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbol}&limit=30`),
  ])

  const series = history.map((h) => ({ time: h.fundingTime, ratePct: Number(h.fundingRate) * 100 }))
  const currentPct = Number(premium.lastFundingRate) * 100
  const last3 = series.slice(-3)
  const avg24hPct = last3.length ? last3.reduce((a, b) => a + b.ratePct, 0) / last3.length : currentPct
  const { status, signal } = classify(currentPct)

  return {
    symbol: ticker.toUpperCase(),
    currentPct,
    avg24hPct,
    status,
    signal,
    series,
    nextFundingTime: premium.nextFundingTime,
    updatedAt: premium.time,
  }
}

export async function getFundingRates(symbols) {
  const unique = [...new Set(symbols.map((s) => s.toUpperCase()))]
  return cached(`funding:${unique.join(',')}`, 5 * 60 * 1000, async () => {
    const entries = await Promise.all(
      unique.map(async (s) => {
        try {
          return [s, await fetchFundingForSymbol(s)]
        } catch {
          return [s, null]
        }
      }),
    )
    return Object.fromEntries(entries)
  })
}
