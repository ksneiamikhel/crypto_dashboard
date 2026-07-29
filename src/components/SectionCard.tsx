import type { ReactNode } from 'react'

type Props = {
  title: string
  subtitle?: string
  children: ReactNode
}

export function SectionCard({ title, subtitle, children }: Props) {
  return (
    <section
      className="rounded-xl p-5"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
    >
      <header className="mb-4">
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {subtitle}
          </p>
        )}
      </header>
      {children}
    </section>
  )
}
