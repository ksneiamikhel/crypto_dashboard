import { getFundingRates } from '../../lib/futures.js'

export default async function handler(req, res) {
  try {
    const symbols = String(req.query.symbols || 'BTC,ETH')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    res.status(200).json(await getFundingRates(symbols))
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
}
