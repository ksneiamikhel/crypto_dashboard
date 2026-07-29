import express from 'express'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getFearGreed, getGlobalTvl, getTvlMovers, getMacro } from '../lib/liveData.js'

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

app.get('/api/live/fear-greed', handle(getFearGreed))
app.get('/api/live/tvl', handle(getGlobalTvl))
app.get('/api/live/tvl-movers', handle(getTvlMovers))
app.get('/api/live/macro', handle(getMacro))

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
