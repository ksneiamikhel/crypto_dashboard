import { getTopFundingAssets } from '../../lib/futures.js'

export default async function handler(req, res) {
  try {
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=43200')
    res.status(200).json(await getTopFundingAssets())
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
}
