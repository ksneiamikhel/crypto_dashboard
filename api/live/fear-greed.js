import { getFearGreed } from '../../lib/liveData.js'

export default async function handler(req, res) {
  try {
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    res.status(200).json(await getFearGreed())
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
}
