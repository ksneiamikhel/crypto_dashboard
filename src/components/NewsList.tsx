import type { NewsItem } from '../types'

export function NewsList({ items }: { items: NewsItem[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item.url}>
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-lg px-3 py-2.5 -mx-3 hover:opacity-90"
            style={
              item.highlighted
                ? {
                    background: 'color-mix(in srgb, var(--status-warning) 12%, transparent)',
                    borderLeft: '3px solid var(--status-warning)',
                  }
                : { borderLeft: '3px solid transparent' }
            }
          >
            <div className="flex items-start gap-2">
              {item.highlighted && (
                <span
                  className="text-xs font-semibold shrink-0 mt-0.5 px-1.5 py-0.5 rounded"
                  style={{ color: 'var(--status-serious)', background: 'color-mix(in srgb, var(--status-warning) 20%, transparent)' }}
                >
                  ⚠ Watch
                </span>
              )}
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {item.title}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {item.source}
                </div>
                {item.highlighted && item.reason && (
                  <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {item.reason}
                  </div>
                )}
              </div>
            </div>
          </a>
        </li>
      ))}
    </ul>
  )
}
