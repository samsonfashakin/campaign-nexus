import { Outlet, NavLink, useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import { apiPost } from '../../api/apiClient'

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    try { await apiPost('/api/auth/logout') } catch { /* continue regardless */ }
    logout()
    navigate('/login')
  }

  const navClass = ({ isActive }) =>
    `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-amber-600 text-white'
        : 'text-slate-400 hover:bg-slate-700 hover:text-white'
    }`

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      <aside className="w-60 shrink-0 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-5 border-b border-slate-700">
          <h1 className="text-lg font-bold text-amber-400 tracking-wide">Campaign Nexus</h1>
          <p className="text-xs text-slate-500 mt-1 truncate">{user?.displayName}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <NavLink to="/" end className={navClass}>Dashboard</NavLink>
          <NavLink to="/characters" className={navClass}>Characters</NavLink>
          <NavLink to="/campaigns" className={navClass}>Campaigns</NavLink>
        </nav>
        <div className="p-3 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}