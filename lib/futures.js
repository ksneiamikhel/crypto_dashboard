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

// Kraken Futures pays funding hourly (not every 8h like Binance/Bybit). We
// aggregate hourly rates into 8h-equivalent buckets so the numbers and
// thresholds stay comparable to the conventional funding-rate framing.
const KRAKEN_TICKER_REMAP = { BTC: 'XBT' }

export function krakenSymbol(ticker) {
  const root = KRAKEN_TICKER_REMAP[ticker.toUpperCase()] ?? ticker.toUpperCase()
  return `PF_${root}USD`
}

export async function fetchFundingForSymbol(ticker) {
  const symbol = krakenSymbol(ticker)
  const json = await fetchJson(`https://futures.kraken.com/derivatives/api/v4/historicalfundingrates?symbol=${symbol}`)
  const rates = json.rates ?? []
  if (rates.length === 0) throw new Error(`No Kraken funding history for ${symbol}`)

  const hourly = rates.map((r) => ({ time: Date.parse(r.timestamp), rate: r.relativeFundingRate }))

  // Bucket from the most recent hour backward so the last bucket is always
  // exactly the trailing 8 hours, regardless of total history length.
  const buckets = []
  for (let end = hourly.length; end > 0; end -= 8) {
    const chunk = hourly.slice(Math.max(0, end - 8), end)
    buckets.unshift({
      time: chunk[chunk.length - 1].time,
      ratePct: chunk.reduce((a, b) => a + b.rate, 0) * 100,
    })
  }

  const last3Buckets = buckets.slice(-3)
  const currentPct = last3Buckets.length ? last3Buckets[last3Buckets.length - 1].ratePct : 0
  const avg24hPct = last3Buckets.length
    ? last3Buckets.reduce((a, b) => a + b.ratePct, 0) / last3Buckets.length
    : currentPct
  const { status, signal } = classify(currentPct)

  return {
    symbol: ticker.toUpperCase(),
    currentPct,
    avg24hPct,
    status,
    signal,
    series: buckets.slice(-30).map((b) => ({ time: b.time, ratePct: b.ratePct })),
    nextFundingTime: hourly[hourly.length - 1].time + 60 * 60 * 1000,
    updatedAt: hourly[hourly.length - 1].time,
  }
}

export async function getFundingRates(symbols) {
  const unique = [...new Set(symbols.map((s) => s.toUpperCase()))]
  return cached(`funding:${unique.join(',')}`, 5 * 60 * 1000, async () => {
    const entries = await Promise.all(
      unique.map(async (s) => {
        try {
          return [s, await fetchFundingForSymbol(s)]
        } catch (err) {
          console.error(`funding rate fetch failed for ${s}:`, err.message)
          return [s, null]
        }
      }),
    )
    return Object.fromEntries(entries)
  })
}

const STABLE_OR_PEGGED = new Set([
  'USDT', 'USDC', 'USDS', 'DAI', 'USD1', 'USDE', 'PYUSD', 'BUIDL', 'USDY', 'XAUT',
  'PAXG', 'RLUSD', 'USDD', 'USDG', 'USYC', 'FDUSD', 'TUSD', 'GUSD', 'USDP',
])

export async function getTopFundingAssets(limit = 50) {
  return cached(`top-funding-assets:${limit}`, 6 * 60 * 60 * 1000, async () => {
    const [markets, tickers] = await Promise.all([
      fetchJson('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1'),
      fetchJson('https://futures.kraken.com/derivatives/api/v3/tickers'),
    ])

    const perpSymbols = new Set(
      (tickers.tickers ?? []).filter((t) => t.tag === 'perpetual' && t.symbol.endsWith('USD')).map((t) => t.symbol),
    )

    const seen = new Set()
    const assets = []
    for (const coin of markets) {
      const symbol = coin.symbol.toUpperCase()
      if (STABLE_OR_PEGGED.has(symbol) || seen.has(symbol)) continue
      if (!perpSymbols.has(krakenSymbol(symbol))) continue
      seen.add(symbol)
      assets.push({ symbol, name: coin.name, marketCapRank: coin.market_cap_rank })
      if (assets.length >= limit) break
    }
    return assets
  })
}
