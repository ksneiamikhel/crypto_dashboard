import { cached } from './cache.js'

const YAHOO_HEADERS = { 'User-Agent': 'Mozilla/5.0' }

async function fetchJson(url, options) {
  const res = await fetch(url, options)
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with ${res.status}`)
  }
  return res.json()
}

export async function getFearGreed() {
  return cached('fear-greed', 5 * 60 * 1000, async () => {
    const json = await fetchJson('https://api.alternative.me/fng/?limit=14')
    return json.data.map((d) => ({
      value: Number(d.value),
      classification: d.value_classification,
      timestamp: Number(d.timestamp) * 1000,
    }))
  })
}

export async function getGlobalTvl() {
  return cached('global-tvl', 15 * 60 * 1000, async () => {
    const json = await fetchJson('https://api.llama.fi/v2/historicalChainTvl')
    const points = json.slice(-90).map((p) => ({ date: p.date * 1000, tvl: p.tvl }))
    const latest = points[points.length - 1]?.tvl ?? 0
    const dayAgo = points[points.length - 2]?.tvl ?? latest
    const weekAgo = points[points.length - 8]?.tvl ?? latest
    return {
      points,
      latest,
      change1d: dayAgo ? ((latest - dayAgo) / dayAgo) * 100 : 0,
      change7d: weekAgo ? ((latest - weekAgo) / weekAgo) * 100 : 0,
    }
  })
}

export async function getTvlMovers() {
  return cached('tvl-movers', 15 * 60 * 1000, async () => {
    const protocols = await fetchJson('https://api.llama.fi/protocols')
    const eligible = protocols.filter(
      (p) => typeof p.change_1d === 'number' && typeof p.tvl === 'number' && p.tvl > 10_000_000,
    )
    const bySize = [...eligible].sort((a, b) => b.tvl - a.tvl).slice(0, 300)
    const gainers = [...bySize].sort((a, b) => b.change_1d - a.change_1d).slice(0, 5)
    const losers = [...bySize].sort((a, b) => a.change_1d - b.change_1d).slice(0, 5)
    const project = (p) => ({
      name: p.name,
      category: p.category,
      tvl: p.tvl,
      change1d: p.change_1d,
      change7d: p.change_7d,
      url: p.url,
    })
    return { gainers: gainers.map(project), losers: losers.map(project) }
  })
}

const MACRO_SYMBOLS = {
  dxy: 'DX-Y.NYB',
  us10y: '^TNX',
  sp500: '^GSPC',
  btc: 'BTC-USD',
  eth: 'ETH-USD',
}

async function fetchYahooQuote(symbol) {
  const json = await fetchJson(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1mo&interval=1d`,
    { headers: YAHOO_HEADERS },
  )
  const result = json.chart?.result?.[0]
  if (!result) return null
  const closes = result.indicators?.quote?.[0]?.close ?? []
  const timestamps = result.timestamp ?? []
  const points = timestamps
    .map((t, i) => ({ date: t * 1000, value: closes[i] }))
    .filter((p) => typeof p.value === 'number')
  return {
    price: result.meta.regularMarketPrice,
    previousClose: result.meta.chartPreviousClose,
    changePct: result.meta.chartPreviousClose
      ? ((result.meta.regularMarketPrice - result.meta.chartPreviousClose) / result.meta.chartPreviousClose) * 100
      : 0,
    points,
  }
}

export async function getMacro() {
  return cached('macro', 5 * 60 * 1000, async () => {
    const entries = await Promise.all(
      Object.entries(MACRO_SYMBOLS).map(async ([key, symbol]) => {
        try {
          const quote = await fetchYahooQuote(symbol)
          return [key, quote]
        } catch {
          return [key, null]
        }
      }),
    )
    return Object.fromEntries(entries)
  })
}
