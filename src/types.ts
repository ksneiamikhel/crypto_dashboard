export type FearGreedPoint = {
  value: number
  classification: string
  timestamp: number
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

export type AssetChart = {
  price: number
  changePct24h: number
  sparkline: number[]
}

export type AssetCharts = Record<string, AssetChart>

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

export type MvrvZScore = {
  current: number
  status: 'Undervalued' | 'Neutral' | 'Overvalued'
  signal: 'BUY' | 'HOLD' | 'TAKE PROFIT'
  historyRange: { min: number; max: number }
  series: { date: number; value: number }[]
  updatedAt: number
}

export type PuellMultiple = {
  current: number
  status: 'Low' | 'Normal' | 'High'
  signal: 'BUY' | 'NEUTRAL' | 'OVERHEATED'
  historyRange: { min: number; max: number }
  series: { date: number; value: number }[]
  updatedAt: number
}

export type PiCycleBottom = {
  status: 'No Signal' | 'Approaching Bottom' | 'Bottom Signal Active'
  signal: string
  gapPct: number
  shortLine: number
  longLine: number
  previousSignals: number[]
  series: { date: number; short: number; long: number }[]
  updatedAt: number
}

export type FundingRate = {
  symbol: string
  currentPct: number
  avg24hPct: number
  status: 'Bullish' | 'Neutral' | 'Bearish'
  signal: string
  series: { time: number; ratePct: number }[]
  nextFundingTime: number
  updatedAt: number
}

export type FundingRates = Record<string, FundingRate | null>
