import { NavLink } from 'react-router-dom'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 text-sm font-medium rounded-md ${isActive ? '' : 'opacity-60 hover:opacity-100'}`

export function NavBar() {
  return (
    <div
      className="px-6 py-2 flex items-center gap-2"
      style={{ background: 'var(--page)', borderBottom: '1px solid var(--border)' }}
    >
      <NavLink
        to="/"
        end
        className={linkClass}
        style={({ isActive }) => ({
          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
          background: isActive ? 'var(--surface-1)' : 'transparent',
          border: isActive ? '1px solid var(--border)' : '1px solid transparent',
        })}
      >
        Markets
      </NavLink>
      <NavLink
        to="/signals"
        className={linkClass}
        style={({ isActive }) => ({
          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
          background: isActive ? 'var(--surface-1)' : 'transparent',
          border: isActive ? '1px solid var(--border)' : '1px solid transparent',
        })}
      >
        On-Chain Signals
      </NavLink>
    </div>
  )
}
