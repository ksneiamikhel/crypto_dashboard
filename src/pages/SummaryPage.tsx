import { useCallback, useEffect, useState } from 'react'
import {
  fetchFearGreed,
  fetchFundingRates,
  fetchMvrvZScore,
  fetchPiCycleBottom,
  fetchPuellMultiple,
  fetchTokenAnalysis,
  fetchTopFundingAssets,
} from '../api'
import { MomentumCard } from '../components/MomentumCard'
import { PositioningRiskCard } from '../components/PositioningRiskCard'
import { RecommendationCard } from '../components/RecommendationCard'
import { SectionCard } from '../components/SectionCard'
import { TrendCard } from '../components/TrendCard'
import { computeBullishScore } from '../lib/scoring'
import { computeTokenRecommendation } from '../lib/tokenRecommendation'
import type { TokenAnalysis, TopFundingAsset } from '../types'

const REFRESH_INTERVAL_MS = 60 * 60 * 1000
const FALLBACK_ASSETS: TopFundingAsset[] = [
  { symbol: 'BTC', name: 'Bitcoin', marketCapRank: 1 },
  { symbol: 'ETH', name: 'Ethereum', marketCapRank: 2 },
  { symbol: 'SOL', name: 'Solana', marketCapRank: 7 },
]

function SummaryPage() {
  const [selectedAsset, setSelectedAsset] = useState('BTC')
  const [topAssets, setTopAssets] = useState<TopFundingAsset[]>(FALLBACK_ASSETS)
  const [analysis, setAnalysis] = useState<TokenAnalysis | null>(null)
  const [macroReady, setMacroReady] = useState(false)
  const [recommendation, setRecommendation] = useState<ReturnType<typeof computeTokenRecommendation> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null)

  const load = useCallback(async (asset: string) => {
    setRefreshing(true)
    try {
      const [mvrv, puell, piCycle, fearGreed, fundingBtc, tokenAnalysis] = await Promise.all([
        fetchMvrvZScore(),
        fetchPuellMultiple(),
        fetchPiCycleBottom(),
        fetchFearGreed(),
        fetchFundingRates(['BTC']),
        fetchTokenAnalysis(asset),
      ])
      setMacroReady(true)
      setAnalysis(tokenAnalysis)
      if (fundingBtc.BTC) {
        const macro = computeBullishScore(mvrv, puell, piCycle, fearGreed[0], fundingBtc.BTC)
        setRecommendation(computeTokenRecommendation(tokenAnalysis, macro))
      } else {
        setRecommendation(null)
      }
      setError(null)
      setLastFetchedAt(Date.now())
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load(selectedAsset)
    const id = setInterval(() => load(selectedAsset), REFRESH_INTERVAL_MS)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAsset])

  useEffect(() => {
    fetchTopFundingAssets(100)
      .then((assets) => {
        if (assets.length) setTopAssets(assets)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen">
      <header className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Trade Summary
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            1h technicals + funding + macro regime combined into a single entry signal
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastFetchedAt && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Live data checked {new Date(lastFetchedAt).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => load(selectedAsset)}
            disabled={refreshing}
            className="text-sm font-medium px-3 py-1.5 rounded-md disabled:opacity-60"
            style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </header>

      <main className="px-6 py-6 flex flex-col gap-5 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-2">
          <label className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Token
          </label>
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="text-sm font-medium px-2 py-1.5 rounded-md"
            style={{ border: '1px solid var(--border)', background: 'var(--surface-1)', color: 'var(--text-primary)' }}
          >
            {topAssets.map((a) => (
              <option key={a.symbol} value={a.symbol}>
                #{a.marketCapRank} {a.symbol} — {a.name}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Loading summary…
          </p>
        )}
        {error && (
          <p className="text-sm" style={{ color: 'var(--delta-bad)' }}>
            {error}
          </p>
        )}

        {recommendation && analysis && macroReady && (
          <SectionCard title="Recommendation">
            <RecommendationCard symbol={selectedAsset} rec={recommendation} />
          </SectionCard>
        )}

        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SectionCard title="Price & Trend" subtitle="EMA20 / EMA50 structure on the 1h chart">
              <TrendCard data={analysis} />
            </SectionCard>
            <SectionCard title="Momentum" subtitle="RSI14 and MACD on the 1h chart">
              <MomentumCard data={analysis} />
            </SectionCard>
          </div>
        )}

        {analysis && (
          <SectionCard title="Positioning & Risk" subtitle="Funding rate and volatility (ATR)">
            <PositioningRiskCard data={analysis} />
          </SectionCard>
        )}
      </main>
    </div>
  )
}

export default SummaryPage
