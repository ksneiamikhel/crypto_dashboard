import { readFileSync } from 'node:fs'

export default function handler(req, res) {
  try {
    const raw = readFileSync(new URL('../data/snapshot.json', import.meta.url), 'utf-8')
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200')
    res.status(200).json(JSON.parse(raw))
  } catch (err) {
    res.status(404).json({ error: 'No snapshot available yet', detail: err.message })
  }
}
