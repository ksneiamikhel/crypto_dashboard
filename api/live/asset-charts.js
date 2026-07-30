import { getAssetCharts } from '../../lib/liveData.js'

export default async function handler(req, res) {
  try {
    const symbols = String(req.query.symbols || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    res.status(200).json(await getAssetCharts(symbols))
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
}
