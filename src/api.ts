import type { FearGreedPoint, MacroData, Snapshot, TvlData, TvlMovers } from './types'

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} responded with ${res.status}`)
  return res.json() as Promise<T>
}

export const fetchFearGreed = () => getJson<FearGreedPoint[]>('/api/live/fear-greed')
export const fetchTvl = () => getJson<TvlData>('/api/live/tvl')
export const fetchTvlMovers = () => getJson<TvlMovers>('/api/live/tvl-movers')
export const fetchMacro = () => getJson<MacroData>('/api/live/macro')
export const fetchSnapshot = () => getJson<Snapshot>('/api/snapshot')
