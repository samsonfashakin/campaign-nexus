const BASE_URL = 'https://www.dnd5eapi.co/api'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

// Map of url path -> { data, expiresAt }
const cache = new Map()

function getCached(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.data
}

function setCached(key, data) {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS })
}

async function dndFetch(path) {
  const cached = getCached(path)
  if (cached) {
    console.log(`[SRD cache hit] ${path}`)
    return cached
  }

  console.log(`[SRD fetch] ${path}`)
  const response = await fetch(`${BASE_URL}${path}`)

  if (!response.ok) {
    const error = new Error(`DnD 5e API responded with ${response.status}`)
    error.status = response.status
    throw error
  }

  const data = await response.json()
  setCached(path, data)
  return data
}

export const listMonsters    = () => dndFetch('/monsters')
export const getMonster      = (index) => dndFetch(`/monsters/${index}`)
export const listSpells      = () => dndFetch('/spells')
export const getSpell        = (index) => dndFetch(`/spells/${index}`)
export const listEquipment   = () => dndFetch('/equipment')
export const getEquipmentItem = (index) => dndFetch(`/equipment/${index}`)
export const listClasses     = () => dndFetch('/classes')
export const getClass        = (index) => dndFetch(`/classes/${index}`)
export const listRaces       = () => dndFetch('/races')
export const getRace         = (index) => dndFetch(`/races/${index}`)
export const listFeats       = () => dndFetch('/feats')
export const getFeat         = (index) => dndFetch(`/feats/${index}`)