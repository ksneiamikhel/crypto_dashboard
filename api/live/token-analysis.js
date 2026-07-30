import { getTokenAnalysis } from '../../lib/technicals.js'

export default async function handler(req, res) {
  try {
    const symbol = String(req.query.symbol || 'BTC').trim()
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    res.status(200).json(await getTokenAnalysis(symbol))
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
}
