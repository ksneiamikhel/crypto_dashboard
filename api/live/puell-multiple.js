import { getPuellMultiple } from '../../lib/onchain.js'

export default async function handler(req, res) {
  try {
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=43200')
    res.status(200).json(await getPuellMultiple())
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
}
