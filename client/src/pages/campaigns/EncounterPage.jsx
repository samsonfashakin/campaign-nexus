import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router'
import { apiGet, apiPost, apiPatch, apiDelete } from '../../api/apiClient'

function mod(score) { return Math.floor((score - 10) / 2) }
function fmtMod(n) { return n >= 0 ? `+${n}` : `${n}` }

export function EncounterPage() {
  const { id: campaignId, encounterId } = useParams()
  const navigate = useNavigate()

  const [encounter, setEncounter]         = useState(null)
  const [monsterList, setMonsterList]     = useState([])
  const [search, setSearch]               = useState('')
  const [selectedMonster, setSelected]    = useState(null)
  const [statBlock, setStatBlock]         = useState(null)
  const [loadingBlock, setLoadingBlock]   = useState(false)
  const [customHp, setCustomHp]           = useState('')
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)

  useEffect(() => {
    Promise.all([
      apiGet(`/api/campaigns/${campaignId}/encounters/${encounterId}`),
      apiGet('/api/srd/monsters'),
    ]).then(([encData, monData]) => {
      setEncounter(encData.encounter)
      setMonsterList(monData.results ?? [])
      setLoading(false)
    }).catch(err => { setError(err.message); setLoading(false) })
  }, [campaignId, encounterId])

  const filteredMonsters = useMemo(() => {
    if (!search.trim()) return []
    const q = search.toLowerCase()
    return monsterList.filter(m => m.name.toLowerCase().includes(q)).slice(0, 10)
  }, [search, monsterList])

  async function handleSelectMonster(m) {
    setSelected(m)
    setStatBlock(null)
    setLoadingBlock(true)
    try {
      const data = await apiGet(`/api/srd/monsters/${m.index}`)
      setStatBlock(data)
      setCustomHp(String(data.hit_points))
    } catch { setStatBlock(null) }
    finally { setLoadingBlock(false) }
  }

  async function handleAddMonster() {
    if (!selectedMonster || !customHp) return
    try {
      const data = await apiPost(
        `/api/campaigns/${campaignId}/encounters/${encounterId}/monsters`,
        {
          monsterIndex: selectedMonster.index,
          customName: statBlock?.name,
          maxHp: Number(customHp),
        }
      )
      setEncounter(prev => ({ ...prev, monsters: [...prev.monsters, data.monster] }))
      setSearch('')
      setSelected(null)
      setStatBlock(null)
    } catch (err) { setError(err.message) }
  }

  async function handleHpChange(monsterId, delta) {
    const monster = encounter.monsters.find(m => m.id === monsterId)
    if (!monster) return
    const newHp = Math.max(0, Math.min(monster.maxHp, monster.currentHp + delta))
    setEncounter(prev => ({
      ...prev,
      monsters: prev.monsters.map(m => m.id === monsterId ? { ...m, currentHp: newHp } : m),
    }))
    try { await apiPatch(`/api/campaigns/${campaignId}/encounters/${encounterId}/monsters/${monsterId}`, { currentHp: newHp }) }
    catch { /* revert */ setEncounter(prev => ({ ...prev, monsters: prev.monsters.map(m => m.id === monsterId ? { ...m, currentHp: monster.currentHp } : m) })) }
  }

  async function handleRemoveMonster(monsterId) {
    try {
      await apiDelete(`/api/campaigns/${campaignId}/encounters/${encounterId}/monsters/${monsterId}`)
      setEncounter(prev => ({ ...prev, monsters: prev.monsters.filter(m => m.id !== monsterId) }))
    } catch (err) { setError(err.message) }
  }

  if (loading) return <p className="text-slate-400">Loading encounter…</p>
  if (error)   return <p className="text-red-400">{error}</p>
  if (!encounter) return null

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={() => navigate(`/campaigns/${campaignId}`)} className="text-slate-400 hover:text-white text-sm">
        ← Back to Campaign
      </button>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-2xl font-bold text-white">{encounter.name}</h2>
        {encounter.notes && <p className="text-slate-400 mt-1 text-sm">{encounter.notes}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active monsters */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
            Active Monsters ({encounter.monsters.length})
          </h3>
          {encounter.monsters.length === 0
            ? <p className="text-slate-500 text-sm">No monsters yet. Search and add some on the right.</p>
            : (
              <div className="space-y-3">
                {encounter.monsters.map(m => {
                  const pct = Math.max(0, (m.currentHp / m.maxHp) * 100)
                  const color = pct > 50 ? 'bg-green-500' : pct > 25 ? 'bg-yellow-500' : 'bg-red-500'
                  return (
                    <div key={m.id} className={`bg-slate-700 rounded-lg p-3 ${m.currentHp === 0 ? 'opacity-50' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-white font-medium text-sm">{m.customName || m.monsterIndex}</span>
                          {m.currentHp === 0 && <span className="text-red-400 text-xs ml-2">Defeated</span>}
                        </div>
                        <button onClick={() => handleRemoveMonster(m.id)}
                          className="text-slate-500 hover:text-red-400 text-xs transition-colors">Remove</button>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-1.5 mb-2">
                        <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleHpChange(m.id, -1)}
                          className="w-7 h-7 rounded bg-slate-600 hover:bg-red-800 text-white text-sm font-bold transition-colors">−</button>
                        <span className="flex-1 text-center text-white text-sm font-medium">
                          {m.currentHp} / {m.maxHp} HP
                        </span>
                        <button onClick={() => handleHpChange(m.id, 1)}
                          className="w-7 h-7 rounded bg-slate-600 hover:bg-green-800 text-white text-sm font-bold transition-colors">+</button>
                        <button onClick={() => handleHpChange(m.id, -5)}
                          className="text-xs text-slate-400 hover:text-red-300 px-2 transition-colors">−5</button>
                        <button onClick={() => handleHpChange(m.id, 5)}
                          className="text-xs text-slate-400 hover:text-green-300 px-2 transition-colors">+5</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          }
        </div>

        {/* Monster search + stat block */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Add Monster</h3>
          <div className="relative">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search monsters (e.g. goblin, dragon)"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400" />
            {filteredMonsters.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-slate-700 border border-slate-600 rounded-lg mt-1 max-h-48 overflow-y-auto z-10">
                {filteredMonsters.map(m => (
                  <button key={m.index} onClick={() => { handleSelectMonster(m); setSearch(m.name) }}
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-slate-600 transition-colors capitalize">
                    {m.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loadingBlock && <p className="text-slate-400 text-sm">Loading stat block…</p>}

          {statBlock && (
            <div className="bg-slate-700 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-white font-bold">{statBlock.name}</h4>
                  <p className="text-slate-400 text-xs capitalize">
                    {statBlock.size} {statBlock.type} · CR {statBlock.challenge_rating}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <p>AC {statBlock.armor_class?.[0]?.value ?? '—'}</p>
                  <p>Speed {statBlock.speed?.walk ?? '—'}</p>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-1 text-center">
                {['strength','dexterity','constitution','intelligence','wisdom','charisma'].map(a => (
                  <div key={a} className="bg-slate-600 rounded p-1">
                    <p className="text-slate-400 text-xs uppercase">{a.slice(0,3)}</p>
                    <p className="text-white text-sm font-bold">{fmtMod(mod(statBlock[a]))}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <label className="text-slate-400 text-sm whitespace-nowrap">HP to add:</label>
                <input type="number" value={customHp} min={1}
                  onChange={e => setCustomHp(e.target.value)}
                  className="w-24 bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-amber-400" />
                <button onClick={handleAddMonster}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
                  Add to Encounter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}