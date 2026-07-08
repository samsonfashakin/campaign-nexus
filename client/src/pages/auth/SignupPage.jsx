import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import { setToken } from '../../api/apiClient'

export function SignupPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [error, setError]             = useState(null)
  const [loading, setLoading]         = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ displayName, email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setToken(data.accessToken)
      login(data.user, data.accessToken)
      navigate('/')
    } catch {
      setError('Could not reach the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-amber-400 mb-1">Campaign Nexus</h1>
        <p className="text-slate-400 text-sm mb-6">Create your account</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Display Name</label>
            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="Gandalf the Grey" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="••••••••" />
          </div>
          {error && (
            <p className="text-red-400 text-sm bg-red-950 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button type="submit" disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition-colors">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p className="text-slate-500 text-sm mt-5 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-400 hover:text-amber-300">Sign in</Link>
        </p>
      </div>
    </div>
  )
}