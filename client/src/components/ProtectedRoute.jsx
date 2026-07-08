import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute() {
  const { status } = useAuth()

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-amber-400 text-lg animate-pulse">Loading…</p>
      </div>
    )
  }

  return status === 'authenticated' ? <Outlet /> : <Navigate to="/login" replace />
}