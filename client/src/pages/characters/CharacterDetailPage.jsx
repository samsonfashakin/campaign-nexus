import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { apiGet, apiPatch, apiPost, apiDelete } from '../../api/apiClient'

const ABILITIES = ['strength','dexterity','constitution','intelligence','wisdom','charisma']
const ABILITY_SHORT = { strength:'STR', dexterity:'DEX', constitution:'CON', intelligence:'INT', wisdom:'WIS', charisma:'CHA' }

function mod(score) { return Math.floor((score - 10) / 2) }
function fmtMod(n) { return n >= 0 ? `+${n}` : `${n}` }
function profBonus(level) { return Math.ceil(level / 4) + 1 }

export function CharacterDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [character, setCharacter] = useState(null)
  const [form, setForm]           = useState(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [newItem, setNewItem]     = useState({ name: '', quantity: 1 })
  const [addingItem, setAddingItem] = useState(false)

  useEffect(() => {
    apiGet(`/api/characters/${id}`)
      .then(data => { setCharacter(data.character); setForm(data.character); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [id])

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  // HP changes auto-save immediately since they're used during live combat
  const handleHpChange = useCallback(async (delta) => {
    const newHp = Math.max(0, Math.min(form.maxHp + form.temporaryHp, form.currentHp + delta))
    setForm(prev => ({ ...prev, currentHp: newHp }))
    setCharacter(prev => ({ ...prev, currentHp: newHp }))
    try { await apiPatch(`/api/characters/${id}`, { currentHp: newHp }) }
    catch { /* revert */ setForm(prev => ({ ...prev, currentHp: character.currentHp })) }
  }, [form, character, id])

  async function handleSave() {
    setSaving(true)
    try {
      const { inventory: _, campaigns: __, owner: ___, ...data } = form
      const result = await apiPatch(`/api/characters/${id}`, data)
      setCharacter(result.character)
      setHasChanges(false)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  async function handleAddItem() {
    if (!newItem.name.trim()) return
    setAddingItem(true)
    try {
      const data = await apiPost(`/api/characters/${id}/inventory`, newItem)
      const updated = [...(character.inventory ?? []), data.item]
      setCharacter(prev => ({ ...prev, inventory: updated }))
      setForm(prev => ({ ...prev, inventory: updated }))
      setNewItem({ name: '', quantity: 1 })
    } catch (err) { setError(err.message) }
    finally { setAddingItem(false) }
  }

  async function handleDeleteItem(itemId) {
    try {
      await apiDelete(`/api/characters/${id}/inventory/${itemId}`)
      const updated = character.inventory.filter(i => i.id !== itemId)
      setCharacter(prev => ({ ...prev, inventory: updated }))
      setForm(prev => ({ ...prev, inventory: updated }))
    } catch (err) { setError(err.message) }
  }

  if (loading) return <p className="text-slate-400">Loading…</p>
  if (error) return <p className="text-red-400">{error}</p>
  if (!form) return null

  const pb = profBonus(form.level)
  const hpPct = Math.max(0, Math.min(100, (form.currentHp / form.maxHp) * 100))
  const hpColor = hpPct > 50 ? 'bg-green-500' : hpPct > 25 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <button onClick={() => navigate('/characters')} className="text-slate-400 hover:text-white text-sm mb-2 block">
          ← Back to Characters
        </button>
        <div className="flex gap-2">
          {hasChanges && (
            <button onClick={handleSave} disabled={saving}
              className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>

      {/* Character Identity */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[['name','Name','text'],['class','Class','text'],['race','Race','text'],['level','Level','number']].map(([field, label, type]) => (
          <div key={field}>
            <label className="block text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</label>
            <input type={type} value={form[field] ?? ''} min={type === 'number' ? 1 : undefined} max={type === 'number' ? 20 : undefined}
              onChange={e => handleChange(field, type === 'number' ? Number(e.target.value) : e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors" />
          </div>
        ))}
        <div className="col-span-2 md:col-span-2">
          <label className="block text-xs text-slate-500 uppercase tracking-wide mb-1">Background</label>
          <input value={form.background ?? ''} onChange={e => handleChange('background', e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ability Scores */}
        <div className="md:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Ability Scores</h3>
            <span className="text-xs text-slate-500">Proficiency Bonus: {fmtMod(pb)}</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {ABILITIES.map(ability => (
              <div key={ability} className="bg-slate-700 rounded-lg p-2 text-center">
                <p className="text-xs text-slate-400 font-medium mb-1">{ABILITY_SHORT[ability]}</p>
                <p className="text-xl font-bold text-amber-400">{fmtMod(mod(form[ability]))}</p>
                <input type="number" value={form[ability]} min={1} max={30}
                  onChange={e => handleChange(ability, Number(e.target.value))}
                  className="w-full bg-slate-600 rounded px-1 py-0.5 text-center text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-400 mt-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Combat Stats */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Combat</h3>

          {/* HP */}
          <div>
            <p className="text-xs text-slate-500 mb-1">Hit Points</p>
            <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
              <div className={`${hpColor} h-2 rounded-full transition-all`} style={{ width: `${hpPct}%` }} />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleHpChange(-1)}
                className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-red-800 text-white font-bold transition-colors">−</button>
              <span className="flex-1 text-center text-white font-semibold">
                {form.currentHp} / {form.maxHp}
              </span>
              <button onClick={() => handleHpChange(1)}
                className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-green-800 text-white font-bold transition-colors">+</button>
            </div>
          </div>

          {[['maxHp','Max HP'],['temporaryHp','Temp HP'],['armorClass','Armor Class'],['speed','Speed (ft)']].map(([field, label]) => (
            <div key={field}>
              <label className="block text-xs text-slate-500 mb-1">{label}</label>
              <input type="number" value={form[field]} min={0}
                onChange={e => handleChange(field, Number(e.target.value))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Inventory */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">Inventory</h3>
        <div className="space-y-2 mb-4">
          {(character.inventory ?? []).length === 0
            ? <p className="text-slate-500 text-sm">No items yet.</p>
            : character.inventory.map(item => (
              <div key={item.id} className="flex items-center justify-between bg-slate-700 rounded-lg px-3 py-2">
                <span className="text-white text-sm">{item.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-sm">×{item.quantity}</span>
                  <button onClick={() => handleDeleteItem(item.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors text-xs">Remove</button>
                </div>
              </div>
            ))
          }
        </div>
        <div className="flex gap-2">
          <input value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
            placeholder="Item name"
            onKeyDown={e => e.key === 'Enter' && handleAddItem()}
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400" />
          <input type="number" value={newItem.quantity} min={1}
            onChange={e => setNewItem(p => ({ ...p, quantity: Number(e.target.value) }))}
            className="w-16 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400" />
          <button onClick={handleAddItem} disabled={addingItem || !newItem.name.trim()}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors">
            Add
          </button>
        </div>
      </div>
    </div>
  )
}