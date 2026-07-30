import { cached } from './cache.js'

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with ${res.status}`)
  }
  return res.json()
}

export async function getBtcHistory() {
  return cached('coinmetrics-btc-history', 6 * 60 * 60 * 1000, async () => {
    const url =
      'https://community-api.coinmetrics.io/v4/timeseries/asset-metrics' +
      '?assets=btc&metrics=PriceUSD,CapMVRVCur,CapMrktCurUSD&frequency=1d&start_time=2010-01-01&page_size=10000'
    const json = await fetchJson(url)
    return json.data
      .map((d) => ({
        date: Date.parse(d.time),
        price: d.PriceUSD ? Number(d.PriceUSD) : null,
        mvrv: d.CapMVRVCur ? Number(d.CapMVRVCur) : null,
        marketCap: d.CapMrktCurUSD ? Number(d.CapMrktCurUSD) : null,
      }))
      .filter((d) => d.price !== null)
  })
}
