import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { apiGet, apiPost } from '../../api/apiClient'
import { useAuth } from '../../context/AuthContext'

export function CampaignsPage() {
  const { user } = useAuth()
  const [campaigns, setCampaigns]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin]     = useState(false)
  const [form, setForm]             = useState({ name: '', description: '' })
  const [joinId, setJoinId]         = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    apiGet('/api/campaigns')
      .then(data => { setCampaigns(data.campaigns); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const data = await apiPost('/api/campaigns', form)
      setCampaigns(prev => [data.campaign, ...prev])
      setShowCreate(false)
      setForm({ name: '', description: '' })
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  async function handleJoin(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await apiPost(`/api/campaigns/${joinId.trim()}/join`)
      const data = await apiGet('/api/campaigns')
      setCampaigns(data.campaigns)
      setShowJoin(false)
      setJoinId('')
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  if (loading) return <p className="text-slate-400">Loading campaigns…</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Campaigns</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowJoin(true)}
            className="border border-slate-600 hover:bg-slate-700 text-slate-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Join Campaign
          </button>
          <button onClick={() => setShowCreate(true)}
            className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            + New Campaign
          </button>
        </div>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">New Campaign</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Campaign Name</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Description (optional)</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 border border-slate-600 text-slate-300 hover:bg-slate-700 py-2 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors">
                  {submitting ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join modal */}
      {showJoin && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-2">Join a Campaign</h3>
            <p className="text-slate-400 text-sm mb-4">Ask your GM for their campaign ID and paste it here.</p>
            <form onSubmit={handleJoin} className="space-y-3">
              <input value={joinId} onChange={e => setJoinId(e.target.value)} required
                placeholder="Campaign ID (UUID)"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowJoin(false)}
                  className="flex-1 border border-slate-600 text-slate-300 hover:bg-slate-700 py-2 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors">
                  {submitting ? 'Joining…' : 'Join'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {campaigns.length === 0
        ? <p className="text-slate-500 text-center mt-12">No campaigns yet. Create one or join an existing one.</p>
        : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {campaigns.map(c => {
              const myRole = c.memberships[0]?.role
              return (
                <Link to={`/campaigns/${c.id}`} key={c.id}
                  className="bg-slate-800 border border-slate-700 hover:border-amber-600 rounded-xl p-5 transition-colors block">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{c.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${myRole === 'GM' ? 'bg-amber-900 text-amber-300' : 'bg-blue-900 text-blue-300'}`}>
                      {myRole}
                    </span>
                  </div>
                  {c.description && <p className="text-slate-400 text-sm mb-3 line-clamp-2">{c.description}</p>}
                  <p className="text-slate-500 text-xs">{c._count.characters} characters · {c._count.encounters} encounters</p>
                  {myRole === 'GM' && (
                    <p className="text-slate-600 text-xs mt-1 font-mono">ID: {c.id}</p>
                  )}
                </Link>
              )
            })}
          </div>
        )
      }
    </div>
  )
}