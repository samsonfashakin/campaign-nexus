import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { apiGet, apiPost, apiDelete } from '../../api/apiClient'
import { useAuth } from '../../context/AuthContext'

export function CampaignDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [campaign, setCampaign]         = useState(null)
  const [myCharacters, setMyCharacters] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [showAddChar, setShowAddChar]   = useState(false)
  const [showNewEncounter, setShowNewEncounter] = useState(false)
  const [encounterForm, setEncounterForm] = useState({ name: '', notes: '' })
  const [creating, setCreating]         = useState(false)

  const myMembership = campaign?.memberships.find(m => m.user.id === user?.id)
  const isGM = myMembership?.role === 'GM'

  useEffect(() => {
    Promise.all([
      apiGet(`/api/campaigns/${id}`),
      apiGet('/api/characters'),
    ]).then(([campaignData, charData]) => {
      setCampaign(campaignData.campaign)
      setMyCharacters(charData.characters)
      setLoading(false)
    }).catch(err => { setError(err.message); setLoading(false) })
  }, [id])

  async function handleAddCharacter(characterId) {
    try {
      await apiPost(`/api/campaigns/${id}/characters`, { characterId })
      const data = await apiGet(`/api/campaigns/${id}`)
      setCampaign(data.campaign)
      setShowAddChar(false)
    } catch (err) { setError(err.message) }
  }

  async function handleRemoveCharacter(characterId) {
    if (!confirm('Remove this character from the campaign?')) return
    try {
      await apiDelete(`/api/campaigns/${id}/characters/${characterId}`)
      const data = await apiGet(`/api/campaigns/${id}`)
      setCampaign(data.campaign)
    } catch (err) { setError(err.message) }
  }

  async function handleCreateEncounter(e) {
    e.preventDefault()
    setCreating(true)
    try {
      const data = await apiPost(`/api/campaigns/${id}/encounters`, encounterForm)
      navigate(`/campaigns/${id}/encounters/${data.encounter.id}`)
    } catch (err) { setError(err.message) }
    finally { setCreating(false) }
  }

  async function handleDeleteEncounter(encId) {
    if (!confirm('Delete this encounter?')) return
    try {
      await apiDelete(`/api/campaigns/${id}/encounters/${encId}`)
      setCampaign(prev => ({ ...prev, encounters: prev.encounters.filter(e => e.id !== encId) }))
    } catch (err) { setError(err.message) }
  }

  if (loading) return <p className="text-slate-400">Loading campaign…</p>
  if (error)   return <p className="text-red-400">{error}</p>
  if (!campaign) return null

  const alreadyAddedIds = new Set(campaign.characters.map(cc => cc.characterId))
  const availableChars = myCharacters.filter(c => !alreadyAddedIds.has(c.id))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate('/campaigns')} className="text-slate-400 hover:text-white text-sm">
        ← Back to Campaigns
      </button>

      {/* Campaign header */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{campaign.name}</h2>
            {campaign.description && <p className="text-slate-400 mt-1">{campaign.description}</p>}
          </div>
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${isGM ? 'bg-amber-900 text-amber-300' : 'bg-blue-900 text-blue-300'}`}>
            {isGM ? 'Game Master' : 'Player'}
          </span>
        </div>
        {isGM && (
          <p className="text-slate-600 text-xs font-mono mt-3">Campaign ID: {campaign.id}</p>
        )}
      </div>

      {/* Members */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">Members</h3>
        <div className="flex flex-wrap gap-2">
          {campaign.memberships.map(m => (
            <div key={m.user.id} className="flex items-center gap-2 bg-slate-700 rounded-lg px-3 py-2">
              <span className="text-white text-sm">{m.user.displayName}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${m.role === 'GM' ? 'bg-amber-900 text-amber-300' : 'bg-blue-900 text-blue-300'}`}>
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Characters */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Characters</h3>
          <button onClick={() => setShowAddChar(true)}
            className="text-amber-400 hover:text-amber-300 text-sm transition-colors">
            + Add Character
          </button>
        </div>
        {campaign.characters.length === 0
          ? <p className="text-slate-500 text-sm">No characters in this campaign yet.</p>
          : (
            <div className="space-y-2">
              {campaign.characters.map(cc => (
                <div key={cc.characterId} className="flex items-center justify-between bg-slate-700 rounded-lg px-3 py-2">
                  <div>
                    <Link to={`/characters/${cc.character.id}`}
                      className="text-white text-sm font-medium hover:text-amber-400 transition-colors">
                      {cc.character.name}
                    </Link>
                    <span className="text-slate-400 text-xs ml-2">
                      {cc.character.race} {cc.character.class} · Level {cc.character.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-xs">{cc.character.owner.displayName}</span>
                    {(isGM || cc.character.ownerId === user?.id) && (
                      <button onClick={() => handleRemoveCharacter(cc.characterId)}
                        className="text-slate-500 hover:text-red-400 text-xs transition-colors">Remove</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        }
        {showAddChar && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-white mb-4">Add Character to Campaign</h3>
              {availableChars.length === 0
                ? <p className="text-slate-400 text-sm">All your characters are already in this campaign, or you have none.</p>
                : (
                  <div className="space-y-2">
                    {availableChars.map(c => (
                      <button key={c.id} onClick={() => handleAddCharacter(c.id)}
                        className="w-full text-left bg-slate-700 hover:bg-slate-600 rounded-lg px-4 py-3 transition-colors">
                        <p className="text-white font-medium">{c.name}</p>
                        <p className="text-slate-400 text-sm">{c.race} {c.class} · Level {c.level}</p>
                      </button>
                    ))}
                  </div>
                )
              }
              <button onClick={() => setShowAddChar(false)}
                className="mt-4 w-full border border-slate-600 text-slate-300 hover:bg-slate-700 py-2 rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Encounters (GM creates, all members can view) */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Encounters</h3>
          {isGM && (
            <button onClick={() => setShowNewEncounter(true)}
              className="text-amber-400 hover:text-amber-300 text-sm transition-colors">
              + New Encounter
            </button>
          )}
        </div>
        {campaign.encounters.length === 0
          ? <p className="text-slate-500 text-sm">{isGM ? 'No encounters yet. Create one to start building fights.' : 'No encounters yet.'}</p>
          : (
            <div className="space-y-2">
              {campaign.encounters.map(enc => (
                <div key={enc.id} className="flex items-center justify-between bg-slate-700 rounded-lg px-3 py-2">
                  <Link to={`/campaigns/${id}/encounters/${enc.id}`}
                    className="text-white text-sm font-medium hover:text-amber-400 transition-colors flex-1">
                    {enc.name}
                  </Link>
                  {isGM && (
                    <button onClick={() => handleDeleteEncounter(enc.id)}
                      className="text-slate-500 hover:text-red-400 text-xs transition-colors ml-3">
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        }
        {showNewEncounter && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-white mb-4">New Encounter</h3>
              <form onSubmit={handleCreateEncounter} className="space-y-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Name</label>
                  <input value={encounterForm.name} onChange={e => setEncounterForm(p => ({ ...p, name: e.target.value }))}
                    required placeholder="Ambush in the forest"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">GM Notes (optional)</label>
                  <textarea value={encounterForm.notes} onChange={e => setEncounterForm(p => ({ ...p, notes: e.target.value }))}
                    rows={2} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400 resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowNewEncounter(false)}
                    className="flex-1 border border-slate-600 text-slate-300 hover:bg-slate-700 py-2 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={creating}
                    className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors">
                    {creating ? 'Creating…' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}