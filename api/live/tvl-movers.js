import { getTvlMovers } from '../../lib/liveData.js'

export default async function handler(req, res) {
  try {
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800')
    res.status(200).json(await getTvlMovers())
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
}
