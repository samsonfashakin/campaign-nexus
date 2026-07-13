import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { apiGet, apiPost, apiDelete } from '../../api/apiClient'

export function CharactersPage() {
  const [characters, setCharacters]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)

  // Create modal
  const [showCreate, setShowCreate]   = useState(false)
  const [form, setForm]               = useState({ name: '', class: '', race: '', characterType: 'PC' })
  const [creating, setCreating]       = useState(false)

  // SRD option lists — fetched once, cached for the session
  const [classes, setClasses]         = useState([])
  const [races, setRaces]             = useState([])
  const [loadingOptions, setLoadingOptions] = useState(false)

  // Fetch characters on mount
  useEffect(() => {
    apiGet('/api/characters')
      .then(data => { setCharacters(data.characters); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  // Fetch SRD classes and races the first time the modal opens
  useEffect(() => {
    if (!showCreate || classes.length > 0) return
    setLoadingOptions(true)
    Promise.all([
      apiGet('/api/srd/classes'),
      apiGet('/api/srd/races'),
    ])
      .then(([classData, raceData]) => {
        setClasses(classData.results ?? [])
        setRaces(raceData.results ?? [])
      })
      .catch(() => setError('Could not load classes and races from the SRD.'))
      .finally(() => setLoadingOptions(false))
  }, [showCreate, classes.length])

  function openCreate() {
    setForm({ name: '', class: '', race: '', characterType: 'PC' })
    setShowCreate(true)
  }

  async function handleCreate(e) {
    e.preventDefault()
    setCreating(true)
    try {
      const data = await apiPost('/api/characters', form)
      setCharacters(prev => [data.character, ...prev])
      setShowCreate(false)
    } catch (err) { setError(err.message) }
    finally { setCreating(false) }
  }

  async function handleDuplicate(id) {
    try {
      const data = await apiPost(`/api/characters/${id}/duplicate`)
      setCharacters(prev => [data.character, ...prev])
    } catch (err) { setError(err.message) }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this character? This cannot be undone.')) return
    try {
      await apiDelete(`/api/characters/${id}`)
      setCharacters(prev => prev.filter(c => c.id !== id))
    } catch (err) { setError(err.message) }
  }

  if (loading) return <p className="text-slate-400">Loading characters…</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Characters</h2>
        <button onClick={openCreate}
          className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + New Character
        </button>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">New Character</h3>

            {loadingOptions ? (
              <p className="text-slate-400 text-sm text-center py-6 animate-pulse">
                Loading classes and races…
              </p>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                {/* Name — still a free text field */}
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Name</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    required
                    placeholder="Thorin Stoneback"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                {/* Class dropdown */}
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Class</label>
                  <select
                    value={form.class}
                    onChange={e => setForm(p => ({ ...p, class: e.target.value }))}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
                  >
                    <option value="" disabled>Select a class…</option>
                    {classes.map(c => (
                      <option key={c.index} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Race dropdown */}
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Race</label>
                  <select
                    value={form.race}
                    onChange={e => setForm(p => ({ ...p, race: e.target.value }))}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
                  >
                    <option value="" disabled>Select a race…</option>
                    {races.map(r => (
                      <option key={r.index} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>

                {/* Character type */}
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Type</label>
                  <select
                    value={form.characterType}
                    onChange={e => setForm(p => ({ ...p, characterType: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400 transition-colors"
                  >
                    <option value="PC">Player Character</option>
                    <option value="NPC">Non-Player Character</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 border border-slate-600 text-slate-300 hover:bg-slate-700 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors"
                  >
                    {creating ? 'Creating…' : 'Create'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Character list */}
      {characters.length === 0
        ? <p className="text-slate-500 text-center mt-12">No characters yet. Create your first one!</p>
        : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map(c => (
              <div key={c.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <Link to={`/characters/${c.id}`}
                      className="text-lg font-semibold text-white hover:text-amber-400 transition-colors">
                      {c.name}
                    </Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      c.characterType === 'NPC' ? 'bg-purple-900 text-purple-300' : 'bg-blue-900 text-blue-300'
                    }`}>
                      {c.characterType}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">{c.race} {c.class} · Level {c.level}</p>
                  {c.campaigns.length > 0 && (
                    <p className="text-slate-500 text-xs mt-1">
                      Active in: {c.campaigns.find(cc => cc.status === 'ACTIVE')?.campaign?.name ?? '—'}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-700">
                  <Link to={`/characters/${c.id}`}
                    className="flex-1 text-center text-sm text-amber-400 hover:text-amber-300 transition-colors">
                    Open Sheet
                  </Link>
                  <button onClick={() => handleDuplicate(c.id)}
                    className="flex-1 text-sm text-slate-400 hover:text-white transition-colors">
                    Duplicate
                  </button>
                  <button onClick={() => handleDelete(c.id)}
                    className="flex-1 text-sm text-red-500 hover:text-red-400 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}