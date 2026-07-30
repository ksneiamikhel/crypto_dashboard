import { useCallback, useEffect, useState } from 'react'
import {
  fetchFearGreed,
  fetchFundingRates,
  fetchMvrvZScore,
  fetchPiCycleBottom,
  fetchPuellMultiple,
  fetchTopFundingAssets,
} from '../api'
import { FearGreedHistoryCard } from '../components/FearGreedHistoryCard'
import { FundingCard } from '../components/FundingCard'
import { GlobalScoreWidget } from '../components/GlobalScoreWidget'
import { MvrvCard } from '../components/MvrvCard'
import { PiCycleCard } from '../components/PiCycleCard'
import { PuellCard } from '../components/PuellCard'
import { SectionCard } from '../components/SectionCard'
import { computeBullishScore } from '../lib/scoring'
import type { FearGreedPoint, FundingRates, MvrvZScore, PiCycleBottom, PuellMultiple, TopFundingAsset } from '../types'

const REFRESH_INTERVAL_MS = 60 * 60 * 1000
const FALLBACK_ASSETS: TopFundingAsset[] = [
  { symbol: 'SOL', name: 'Solana', marketCapRank: 7 },
  { symbol: 'DOGE', name: 'Dogecoin', marketCapRank: 11 },
  { symbol: 'ADA', name: 'Cardano', marketCapRank: 19 },
]

type State = {
  mvrv: MvrvZScore | null
  puell: PuellMultiple | null
  piCycle: PiCycleBottom | null
  fearGreed: FearGreedPoint[] | null
  funding: FundingRates | null
  error: string | null
  loading: boolean
  refreshing: boolean
  lastFetchedAt: number | null
}

function SignalsPage() {
  const [selectedAsset, setSelectedAsset] = useState('SOL')
  const [topAssets, setTopAssets] = useState<TopFundingAsset[]>(FALLBACK_ASSETS)
  const [state, setState] = useState<State>({
    mvrv: null,
    puell: null,
    piCycle: null,
    fearGreed: null,
    funding: null,
    error: null,
    loading: true,
    refreshing: false,
    lastFetchedAt: null,
  })

  const load = useCallback(async (asset: string) => {
    setState((prev) => ({ ...prev, refreshing: true }))
    try {
      const [mvrv, puell, piCycle, fearGreed, funding] = await Promise.all([
        fetchMvrvZScore(),
        fetchPuellMultiple(),
        fetchPiCycleBottom(),
        fetchFearGreed(90),
        fetchFundingRates(['BTC', 'ETH', asset]),
      ])
      setState({
        mvrv,
        puell,
        piCycle,
        fearGreed,
        funding,
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
    load(selectedAsset)
    const id = setInterval(() => load(selectedAsset), REFRESH_INTERVAL_MS)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAsset])

  useEffect(() => {
    fetchTopFundingAssets()
      .then((assets) => {
        const selectable = assets.filter((a) => a.symbol !== 'BTC' && a.symbol !== 'ETH')
        if (selectable.length) setTopAssets(selectable)
      })
      .catch(() => {})
  }, [])

  const allReady = state.mvrv && state.puell && state.piCycle && state.fearGreed && state.funding
  const bullish =
    allReady && state.funding!.BTC
      ? computeBullishScore(state.mvrv!, state.puell!, state.piCycle!, state.fearGreed![0], state.funding!.BTC!)
      : null

  return (
    <div className="min-h-screen">
      <header className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            On-Chain Signals
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            MVRV, Pi Cycle, Puell Multiple, Fear &amp; Greed and funding-rate signals for Bitcoin
          </p>
        </div>
        <div className="flex items-center gap-3">
          {state.lastFetchedAt && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Live data checked {new Date(state.lastFetchedAt).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => load(selectedAsset)}
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
            Loading signals…
          </p>
        )}
        {state.error && (
          <p className="text-sm" style={{ color: 'var(--delta-bad)' }}>
            {state.error}
          </p>
        )}

        {bullish && <GlobalScoreWidget result={bullish} />}

        {state.mvrv && state.piCycle && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SectionCard title="MVRV Z-Score" subtitle="Is Bitcoin over- or under-valued vs. realized value?">
              <MvrvCard data={state.mvrv} />
            </SectionCard>
            <SectionCard title="Pi Cycle Bottom" subtitle="Probability of a cyclical Bitcoin low forming">
              <PiCycleCard data={state.piCycle} />
            </SectionCard>
          </div>
        )}

        {state.puell && state.fearGreed && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SectionCard title="Puell Multiple" subtitle="Miner revenue vs. its 365-day average">
              <PuellCard data={state.puell} />
            </SectionCard>
            <SectionCard title="Fear & Greed Index" subtitle="Current market sentiment">
              <FearGreedHistoryCard history={state.fearGreed} />
            </SectionCard>
          </div>
        )}

        {state.funding && (
          <SectionCard title="Futures: Funding Rate" subtitle="Long/short imbalance across perpetual futures">
            <div className="mb-3 flex items-center gap-2">
              <label className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Selected asset
              </label>
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="text-xs font-medium px-2 py-1 rounded-md"
                style={{ border: '1px solid var(--border)', background: 'var(--surface-1)', color: 'var(--text-primary)' }}
              >
                {topAssets.map((a) => (
                  <option key={a.symbol} value={a.symbol}>
                    #{a.marketCapRank} {a.symbol} — {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['BTC', 'ETH', selectedAsset] as const).map((sym) =>
                state.funding![sym] ? <FundingCard key={sym} data={state.funding![sym]!} /> : null,
              )}
            </div>
            <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Why it matters: </strong>
              Strongly negative funding means most traders are short, raising the odds of a short squeeze. Strongly
              positive funding means longs are overcrowded and paying a premium, raising long-squeeze risk.
            </p>
          </SectionCard>
        )}
      </main>
    </div>
  )
}

export default SignalsPage
