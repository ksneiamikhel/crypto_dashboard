import { cached } from './cache.js'

const YAHOO_HEADERS = { 'User-Agent': 'Mozilla/5.0' }

async function fetchJson(url, options) {
  const res = await fetch(url, options)
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with ${res.status}`)
  }
  return res.json()
}

export async function getFearGreed(limit = 14) {
  return cached(`fear-greed:${limit}`, 5 * 60 * 1000, async () => {
    const json = await fetchJson(`https://api.alternative.me/fng/?limit=${limit}`)
    return json.data.map((d) => ({
      value: Number(d.value),
      classification: d.value_classification,
      timestamp: Number(d.timestamp) * 1000,
    }))
  })
}

const NON_TOKEN_CATEGORIES = new Set(['CEX', 'OTC Marketplace'])

export async function getTvlMovers() {
  return cached('tvl-movers', 15 * 60 * 1000, async () => {
    const protocols = await fetchJson('https://api.llama.fi/protocols')
    const eligible = protocols.filter(
      (p) =>
        typeof p.change_1d === 'number' &&
        typeof p.tvl === 'number' &&
        p.tvl > 10_000_000 &&
        !NON_TOKEN_CATEGORIES.has(p.category),
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

const TICKER_TO_COINGECKO_ID = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  BNB: 'binancecoin',
  XRP: 'ripple',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  AVAX: 'avalanche-2',
  DOT: 'polkadot',
  LINK: 'chainlink',
  MATIC: 'matic-network',
  POL: 'polygon-ecosystem-token',
  UNI: 'uniswap',
  AAVE: 'aave',
  ENA: 'ethena',
  ONDO: 'ondo-finance',
  HYPE: 'hyperliquid',
  EIGEN: 'eigenlayer',
  ARB: 'arbitrum',
  OP: 'optimism',
  SUI: 'sui',
  TRX: 'tron',
  LTC: 'litecoin',
  NEAR: 'near',
  ATOM: 'cosmos',
  INJ: 'injective-protocol',
  TIA: 'celestia',
  RUNE: 'thorchain',
  GRT: 'the-graph',
  RENDER: 'render-token',
  FET: 'fetch-ai',
  PEPE: 'pepe',
  WIF: 'dogwifcoin',
  JUP: 'jupiter-exchange-solana',
  PYTH: 'pyth-network',
  STRK: 'starknet',
  SEI: 'sei-network',
  APT: 'aptos',
  FIL: 'filecoin',
  ICP: 'internet-computer',
  HBAR: 'hedera-hashgraph',
  VET: 'vechain',
  ALGO: 'algorand',
  MKR: 'maker',
  CRV: 'curve-dao-token',
  LDO: 'lido-dao',
  SNX: 'synthetix-network-token',
  COMP: 'compound-governance-token',
  GMX: 'gmx',
  DYDX: 'dydx-chain',
  CAKE: 'pancakeswap-token',
}

export async function getAssetCharts(symbols) {
  const unique = [...new Set(symbols.map((s) => s.toUpperCase()))]
  const idToSymbol = new Map()
  for (const symbol of unique) {
    const id = TICKER_TO_COINGECKO_ID[symbol]
    if (id) idToSymbol.set(id, symbol)
  }
  if (idToSymbol.size === 0) return {}

  const ids = [...idToSymbol.keys()].join(',')
  return cached(`asset-charts:${ids}`, 5 * 60 * 1000, async () => {
    const json = await fetchJson(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&sparkline=true&price_change_percentage=24h`,
    )
    const result = {}
    for (const coin of json) {
      const symbol = idToSymbol.get(coin.id)
      if (!symbol) continue
      result[symbol] = {
        price: coin.current_price,
        changePct24h: coin.price_change_percentage_24h,
        sparkline: coin.sparkline_in_7d?.price ?? [],
      }
    }
    return result
  })
}
