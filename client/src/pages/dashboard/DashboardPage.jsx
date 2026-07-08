import { useAuth } from '../../context/AuthContext'

export function DashboardPage() {
  const { user } = useAuth()
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-1">Welcome back, {user?.displayName}</h2>
      <p className="text-slate-400">Your adventure awaits.</p>
    </div>
  )
}