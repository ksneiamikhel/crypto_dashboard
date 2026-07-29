export type FearGreedPoint = {
  value: number
  classification: string
  timestamp: number
}

export type TvlPoint = { date: number; tvl: number }

export type TvlData = {
  points: TvlPoint[]
  latest: number
  change1d: number
  change7d: number
}

export type TvlMover = {
  name: string
  category: string
  tvl: number
  change1d: number
  change7d: number
  url: string
}

export type TvlMovers = {
  gainers: TvlMover[]
  losers: TvlMover[]
}

export type MacroQuote = {
  price: number
  previousClose: number
  changePct: number
  points: { date: number; value: number }[]
} | null

export type MacroData = Record<'dxy' | 'us10y' | 'sp500' | 'btc' | 'eth', MacroQuote>

export type NewsItem = {
  title: string
  source: string
  url: string
  highlighted: boolean
  reason?: string
}

export type TradeIdea = {
  asset: string
  direction: 'long' | 'short' | 'neutral'
  rationale: string
}

export type Unlock = {
  project: string
  date: string
  amountUsd: number | null
  percentOfSupply: number | null
  note?: string | null
}

export type EtfFlow = {
  netFlowUsd: number | null
  trend: string
}

export type Snapshot = {
  generatedAt: string
  news: NewsItem[]
  trades: TradeIdea[]
  unlocks: Unlock[]
  etfFlows: {
    asOf: string
    btc: EtfFlow
    eth: EtfFlow
  }
}
