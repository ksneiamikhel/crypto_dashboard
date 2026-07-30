import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const snapshotPath = path.join(__dirname, '..', 'data', 'snapshot.json')
const feedUrl = 'https://www.coindesk.com/arc/outboundfeeds/rss/'

function parseRssItems(xml) {
  const items = []
  const itemRegex = /<item\b[^>]*>([\s\S]*?)<\/item>/gi

  for (const match of xml.matchAll(itemRegex)) {
    const block = match[1]
    const titleMatch = block.match(/<title\b[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?)<\/title>)/i)
    const linkMatch = block.match(/<link\b[^>]*>([\s\S]*?)<\/link>/i)
    const creatorMatch = block.match(/<dc:creator\b[^>]*>([\s\S]*?)<\/dc:creator>/i)

    const title = (titleMatch?.[1] || titleMatch?.[2] || '').trim().replace(/\s+/g, ' ')
    const link = (linkMatch?.[1] || '').trim()
    const source = (creatorMatch?.[1] || 'CoinDesk').trim().replace(/\s+/g, ' ')

    if (!title || !link) continue

    items.push({ title, url: link, source })
  }

  return items
}

function buildNewsItem(entry, index) {
  const lowered = `${entry.title} ${entry.url}`.toLowerCase()
  const highlighted = /fed|rate|inflation|policy|etf|whale|liquidations|bitcoin|macro|regulation|ai/i.test(lowered)

  const reason = highlighted
    ? /fed|rate|inflation|policy/i.test(lowered)
      ? 'Macro-sensitive headline that can move risk appetite and BTC sentiment.'
      : /etf|whale|liquidations/i.test(lowered)
        ? 'Flows and positioning data can change price action quickly.'
        : 'Fresh market-moving headline that may influence short-term sentiment.'
    : 'A new headline from the feed with context worth monitoring.'

  return {
    title: entry.title,
    source: entry.source || 'CoinDesk',
    url: entry.url,
    highlighted,
    reason: index < 3 ? reason : '',
  }
}

async function main() {
  const previousRaw = await readFile(snapshotPath, 'utf8')
  const previous = JSON.parse(previousRaw)

  let nextNews = previous.news || []

  try {
    const res = await fetch(feedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })

    if (!res.ok) {
      throw new Error(`RSS fetch failed with ${res.status}`)
    }

    const xml = await res.text()
    const entries = parseRssItems(xml)
    nextNews = entries.slice(0, 10).map(buildNewsItem)
  } catch (error) {
    console.warn('Falling back to previous news snapshot:', error.message)
  }

  const updatedSnapshot = {
    ...previous,
    generatedAt: new Date().toISOString(),
    news: nextNews,
    sourcesUsed: Array.from(new Set([feedUrl, ...(previous.sourcesUsed || [])]))
  }

  await writeFile(snapshotPath, `${JSON.stringify(updatedSnapshot, null, 2)}\n`, 'utf8')
  console.log(`Updated news snapshot with ${nextNews.length} items.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
