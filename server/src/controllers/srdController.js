import * as dndApi from '../services/dndApiService.js'

function handleExternalError(res, error) {
  console.error('[SRD error]', error.message)
  if (error.status === 404) {
    return res.status(404).json({ error: 'That resource does not exist in the SRD.' })
  }
  return res.status(502).json({ error: 'Could not reach the D&D 5e API. Please try again.' })
}

function makeHandlers(listFn, getFn) {
  return {
    list: async (req, res) => {
      try { res.json(await listFn()) }
      catch (err) { handleExternalError(res, err) }
    },
    get: async (req, res) => {
      try { res.json(await getFn(req.params.index)) }
      catch (err) { handleExternalError(res, err) }
    },
  }
}

export const monsters  = makeHandlers(dndApi.listMonsters, dndApi.getMonster)
export const spells    = makeHandlers(dndApi.listSpells, dndApi.getSpell)
export const equipment = makeHandlers(dndApi.listEquipment, dndApi.getEquipmentItem)
export const classes   = makeHandlers(dndApi.listClasses, dndApi.getClass)
export const races     = makeHandlers(dndApi.listRaces, dndApi.getRace)
export const feats     = makeHandlers(dndApi.listFeats, dndApi.getFeat)