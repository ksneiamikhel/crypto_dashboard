import { getFearGreed } from '../../lib/liveData.js'

export default async function handler(req, res) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : undefined
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    res.status(200).json(await getFearGreed(limit))
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
}
