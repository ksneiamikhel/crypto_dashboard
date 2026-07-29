import { useCallback, useEffect, useState } from 'react'
import { fetchFearGreed, fetchMacro, fetchSnapshot, fetchTvl, fetchTvlMovers } from './api'
import { EtfFlows } from './components/EtfFlows'
import { FearGreedMeter } from './components/FearGreedMeter'
import { MacroRow } from './components/MacroRow'
import { NewsList } from './components/NewsList'
import { SectionCard } from './components/SectionCard'
import { TradeIdeas } from './components/TradeIdeas'
import { TvlChart } from './components/TvlChart'
import { TvlMovers } from './components/TvlMovers'
import { UnlocksTable } from './components/UnlocksTable'
import type { FearGreedPoint, MacroData, Snapshot, TvlData, TvlMovers as TvlMoversType } from './types'

const REFRESH_INTERVAL_MS = 60 * 60 * 1000

type State = {
  fearGreed: FearGreedPoint[] | null
  tvl: TvlData | null
  tvlMovers: TvlMoversType | null
  macro: MacroData | null
  snapshot: Snapshot | null
  error: string | null
  loading: boolean
}

function App() {
  const [state, setState] = useState<State>({
    fearGreed: null,
    tvl: null,
    tvlMovers: null,
    macro: null,
    snapshot: null,
    error: null,
    loading: true,
  })

  const load = useCallback(async () => {
    try {
      const [fearGreed, tvl, tvlMovers, macro, snapshot] = await Promise.all([
        fetchFearGreed(),
        fetchTvl(),
        fetchTvlMovers(),
        fetchMacro(),
        fetchSnapshot(),
      ])
      setState({ fearGreed, tvl, tvlMovers, macro, snapshot, error: null, loading: false })
    } catch (err) {
      setState((prev) => ({ ...prev, error: (err as Error).message, loading: false }))
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
              News & trade ideas last refreshed {new Date(state.snapshot.generatedAt).toLocaleString()}
            </p>
          )}
        </div>
        <button
          onClick={load}
          className="text-sm font-medium px-3 py-1.5 rounded-md"
          style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        >
          Refresh
        </button>
      </header>

      <main className="px-6 py-6 flex flex-col gap-5 max-w-6xl mx-auto">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SectionCard title="Top headlines" subtitle="Highlighted items may move price">
              <NewsList items={state.snapshot.news} />
            </SectionCard>
            <SectionCard title="Trades to watch" subtitle="Synthesized from news, macro & on-chain context">
              <TradeIdeas items={state.snapshot.trades} />
            </SectionCard>
          </div>
        )}

        {state.tvl && (
          <SectionCard
            title="Global DeFi TVL"
            subtitle={`${state.tvl.change1d >= 0 ? '+' : ''}${state.tvl.change1d.toFixed(2)}% 24h · ${state.tvl.change7d >= 0 ? '+' : ''}${state.tvl.change7d.toFixed(2)}% 7d`}
          >
            <TvlChart points={state.tvl.points} />
          </SectionCard>
        )}

        {state.tvlMovers && (
          <SectionCard title="TVL movers">
            <TvlMovers gainers={state.tvlMovers.gainers} losers={state.tvlMovers.losers} />
          </SectionCard>
        )}

        {state.snapshot && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SectionCard title="Upcoming unlocks">
              <UnlocksTable items={state.snapshot.unlocks} />
            </SectionCard>
            <SectionCard title="Spot ETF flows">
              <EtfFlows etfFlows={state.snapshot.etfFlows} />
            </SectionCard>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
