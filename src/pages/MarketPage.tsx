import { useCallback, useEffect, useState } from 'react'
import { fetchAssetCharts, fetchFearGreed, fetchMacro, fetchSnapshot, fetchTvlMovers } from '../api'
import { EtfFlows } from '../components/EtfFlows'
import { FearGreedMeter } from '../components/FearGreedMeter'
import { MacroRow } from '../components/MacroRow'
import { NewsList } from '../components/NewsList'
import { SectionCard } from '../components/SectionCard'
import { TradeIdeas } from '../components/TradeIdeas'
import { TvlMovers } from '../components/TvlMovers'
import { UnlocksTable } from '../components/UnlocksTable'
import type { AssetCharts, FearGreedPoint, MacroData, Snapshot, TvlMovers as TvlMoversType } from '../types'

const REFRESH_INTERVAL_MS = 15 * 60 * 1000

type State = {
  fearGreed: FearGreedPoint[] | null
  tvlMovers: TvlMoversType | null
  macro: MacroData | null
  snapshot: Snapshot | null
  assetCharts: AssetCharts
  error: string | null
  loading: boolean
  refreshing: boolean
  lastFetchedAt: number | null
}

function MarketPage() {
  const [state, setState] = useState<State>({
    fearGreed: null,
    tvlMovers: null,
    macro: null,
    snapshot: null,
    assetCharts: {},
    error: null,
    loading: true,
    refreshing: false,
    lastFetchedAt: null,
  })

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, refreshing: true }))
    try {
      const [fearGreed, tvlMovers, macro, snapshot] = await Promise.all([
        fetchFearGreed(),
        fetchTvlMovers(),
        fetchMacro(),
        fetchSnapshot(),
      ])
      const assetCharts = snapshot.trades.length
        ? await fetchAssetCharts(snapshot.trades.map((t) => t.asset)).catch(() => ({}))
        : {}
      setState({
        fearGreed,
        tvlMovers,
        macro,
        snapshot,
        assetCharts,
        error: null,
        loading: false,
        refreshing: false,
        lastFetchedAt: Date.now(),
      })
    } catch (err) {
      setState((prev) => ({ ...prev, error: (err as Error).message, loading: false, refreshing: false }))
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, REFRESH_INTERVAL_MS)
    return () => clearInterval(id)
  }, [load])

  return (
    <div className="min-h-screen">
      <header className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Crypto Dashboard
          </h1>
          {state.snapshot && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              News & trade ideas last refreshed {new Date(state.snapshot.generatedAt).toLocaleString()} • auto-refresh every 15 min
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {state.lastFetchedAt && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Live data checked {new Date(state.lastFetchedAt).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={load}
            disabled={state.refreshing}
            className="text-sm font-medium px-3 py-1.5 rounded-md disabled:opacity-60"
            style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            {state.refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </header>

      <main className="px-6 py-6 flex flex-col gap-5 max-w-[1600px] mx-auto">
        {state.loading && (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Loading dashboard…
          </p>
        )}
        {state.error && (
          <p className="text-sm" style={{ color: 'var(--delta-bad)' }}>
            {state.error}
          </p>
        )}

        {state.fearGreed && state.macro && (
          <SectionCard title="Market sentiment & macro">
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
              <FearGreedMeter history={state.fearGreed} />
              <MacroRow macro={state.macro} />
            </div>
          </SectionCard>
        )}

        {state.snapshot && (
          <SectionCard title="Top headlines" subtitle="Highlighted items may move price">
            <NewsList items={state.snapshot.news} />
          </SectionCard>
        )}

        {state.snapshot && (
          <SectionCard title="Trades to watch" subtitle="Synthesized from news, macro & on-chain context">
            <TradeIdeas items={state.snapshot.trades} charts={state.assetCharts} />
          </SectionCard>
        )}

        {state.tvlMovers && (
          <SectionCard title="TVL movers" subtitle="Token-backed protocols only">
            <TvlMovers gainers={state.tvlMovers.gainers} losers={state.tvlMovers.losers} />
          </SectionCard>
        )}

        {state.snapshot && (
          <SectionCard title="Upcoming unlocks">
            <UnlocksTable items={state.snapshot.unlocks} />
          </SectionCard>
        )}

        {state.snapshot && (
          <SectionCard title="Spot ETF flows">
            <EtfFlows etfFlows={state.snapshot.etfFlows} />
          </SectionCard>
        )}
      </main>
    </div>
  )
}

export default MarketPage
