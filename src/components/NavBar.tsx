import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/', label: 'Markets', end: true },
  { to: '/signals', label: 'On-Chain Signals', end: false },
  { to: '/summary', label: 'Trade Summary', end: false },
]

export function NavBar() {
  return (
    <div
      className="px-6 py-2 flex items-center gap-2"
      style={{ background: 'var(--page)', borderBottom: '1px solid var(--border)' }}
    >
      {LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className="px-3 py-1.5 text-sm font-medium rounded-md"
          style={({ isActive }) => ({
            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            background: isActive ? 'var(--surface-1)' : 'transparent',
            border: isActive ? '1px solid var(--border)' : '1px solid transparent',
            opacity: isActive ? 1 : 0.8,
          })}
        >
          {link.label}
        </NavLink>
      ))}
    </div>
  )
}
