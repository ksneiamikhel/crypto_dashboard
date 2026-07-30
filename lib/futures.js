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
  const [tickerJson, historyJson] = await Promise.all([
    fetchJson(`https://api.bybit.com/v5/market/tickers?category=linear&symbol=${symbol}`),
    fetchJson(`https://api.bybit.com/v5/market/funding/history?category=linear&symbol=${symbol}&limit=30`),
  ])

  const info = tickerJson.result?.list?.[0]
  if (!info) throw new Error(`No Bybit ticker data for ${symbol}`)

  const series = [...(historyJson.result?.list ?? [])]
    .reverse()
    .map((h) => ({ time: Number(h.fundingRateTimestamp), ratePct: Number(h.fundingRate) * 100 }))
  const currentPct = Number(info.fundingRate) * 100
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
    nextFundingTime: Number(info.nextFundingTime),
    updatedAt: Number(tickerJson.time),
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

export async function getTopFundingAssets() {
  return cached('top-funding-assets', 6 * 60 * 60 * 1000, async () => {
    const [markets, instruments] = await Promise.all([
      fetchJson('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=150&page=1'),
      fetchJson('https://api.bybit.com/v5/market/instruments-info?category=linear&limit=1000'),
    ])

    const perpSymbols = new Set(
      (instruments.result?.list ?? [])
        .filter((i) => i.contractType === 'LinearPerpetual' && i.symbol.endsWith('USDT'))
        .map((i) => i.symbol),
    )

    const seen = new Set()
    const assets = []
    for (const coin of markets) {
      const symbol = coin.symbol.toUpperCase()
      if (STABLE_OR_PEGGED.has(symbol) || seen.has(symbol)) continue
      if (!perpSymbols.has(`${symbol}USDT`)) continue
      seen.add(symbol)
      assets.push({ symbol, name: coin.name, marketCapRank: coin.market_cap_rank })
      if (assets.length >= 50) break
    }
    return assets
  })
}
