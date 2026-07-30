import type {
  AssetCharts,
  FearGreedPoint,
  FundingRates,
  MacroData,
  MvrvZScore,
  PiCycleBottom,
  PuellMultiple,
  Snapshot,
  TokenAnalysis,
  TopFundingAsset,
  TvlMovers,
} from './types'

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} responded with ${res.status}`)
  return res.json() as Promise<T>
}

export const fetchFearGreed = (limit?: number) =>
  getJson<FearGreedPoint[]>(limit ? `/api/live/fear-greed?limit=${limit}` : '/api/live/fear-greed')
export const fetchTvlMovers = () => getJson<TvlMovers>('/api/live/tvl-movers')
export const fetchMacro = () => getJson<MacroData>('/api/live/macro')
export const fetchSnapshot = () => getJson<Snapshot>('/api/snapshot')
export const fetchAssetCharts = (symbols: string[]) =>
  getJson<AssetCharts>(`/api/live/asset-charts?symbols=${encodeURIComponent(symbols.join(','))}`)
export const fetchMvrvZScore = () => getJson<MvrvZScore>('/api/live/mvrv-zscore')
export const fetchPuellMultiple = () => getJson<PuellMultiple>('/api/live/puell-multiple')
export const fetchPiCycleBottom = () => getJson<PiCycleBottom>('/api/live/pi-cycle-bottom')
export const fetchFundingRates = (symbols: string[]) =>
  getJson<FundingRates>(`/api/live/funding-rates?symbols=${encodeURIComponent(symbols.join(','))}`)
export const fetchTopFundingAssets = (limit?: number) =>
  getJson<TopFundingAsset[]>(limit ? `/api/live/top-funding-assets?limit=${limit}` : '/api/live/top-funding-assets')
export const fetchTokenAnalysis = (symbol: string) =>
  getJson<TokenAnalysis>(`/api/live/token-analysis?symbol=${encodeURIComponent(symbol)}`)
