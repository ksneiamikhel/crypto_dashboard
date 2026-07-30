import express from 'express'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getFearGreed, getTvlMovers, getMacro, getAssetCharts } from '../lib/liveData.js'
import { getMvrvZScore, getPuellMultiple, getPiCycleBottom } from '../lib/onchain.js'
import { getFundingRates } from '../lib/futures.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SNAPSHOT_PATH = path.join(__dirname, '..', 'data', 'snapshot.json')

const app = express()
const PORT = process.env.PORT || 3001

function handle(getter) {
  return async (_req, res) => {
    try {
      res.json(await getter())
    } catch (err) {
      res.status(502).json({ error: err.message })
    }
  }
}

app.get('/api/live/fear-greed', async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : undefined
    res.json(await getFearGreed(limit))
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})
app.get('/api/live/tvl-movers', handle(getTvlMovers))
app.get('/api/live/macro', handle(getMacro))
app.get('/api/live/asset-charts', async (req, res) => {
  try {
    const symbols = String(req.query.symbols || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    res.json(await getAssetCharts(symbols))
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})
app.get('/api/live/mvrv-zscore', handle(getMvrvZScore))
app.get('/api/live/puell-multiple', handle(getPuellMultiple))
app.get('/api/live/pi-cycle-bottom', handle(getPiCycleBottom))
app.get('/api/live/funding-rates', async (req, res) => {
  try {
    const symbols = String(req.query.symbols || 'BTC,ETH')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    res.json(await getFundingRates(symbols))
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

app.get('/api/snapshot', async (_req, res) => {
  try {
    const raw = await readFile(SNAPSHOT_PATH, 'utf-8')
    res.json(JSON.parse(raw))
  } catch (err) {
    res.status(404).json({ error: 'No snapshot available yet', detail: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`Dashboard API listening on http://localhost:${PORT}`)
})
