import * as svc from '../services/encounterService.js'
import * as campaignSvc from '../services/campaignService.js'

async function requireGM(campaignId, userId, res) {
  const m = await campaignSvc.getMembership(campaignId, userId)
  if (!m) { res.status(403).json({ error: 'Not a member' }); return false }
  if (m.role !== 'GM') { res.status(403).json({ error: 'GM only' }); return false }
  return true
}

export async function listEncounters(req, res) {
  try {
    const m = await campaignSvc.getMembership(req.params.campaignId, req.userId)
    if (!m) return res.status(403).json({ error: 'Not a member' })
    res.json({ encounters: await svc.getEncountersByCampaign(req.params.campaignId) })
  } catch { res.status(500).json({ error: 'Failed to fetch encounters' }) }
}

export async function createEncounter(req, res) {
  try {
    if (!await requireGM(req.params.campaignId, req.userId, res)) return
    const { name, notes } = req.body
    if (!name) return res.status(400).json({ error: 'Encounter name is required' })
    const encounter = await svc.createEncounter({ campaignId: req.params.campaignId, name, notes })
    res.status(201).json({ encounter })
  } catch { res.status(500).json({ error: 'Failed to create encounter' }) }
}

export async function getEncounter(req, res) {
  try {
    const m = await campaignSvc.getMembership(req.params.campaignId, req.userId)
    if (!m) return res.status(403).json({ error: 'Not a member' })
    const encounter = await svc.getEncounterById(req.params.encounterId)
    if (!encounter) return res.status(404).json({ error: 'Encounter not found' })
    res.json({ encounter })
  } catch { res.status(500).json({ error: 'Failed to fetch encounter' }) }
}

export async function deleteEncounter(req, res) {
  try {
    if (!await requireGM(req.params.campaignId, req.userId, res)) return
    await svc.deleteEncounter(req.params.encounterId)
    res.status(204).send()
  } catch { res.status(500).json({ error: 'Failed to delete encounter' }) }
}

export async function addMonster(req, res) {
  try {
    if (!await requireGM(req.params.campaignId, req.userId, res)) return
    const { monsterIndex, customName, maxHp } = req.body
    if (!monsterIndex || !maxHp) return res.status(400).json({ error: 'monsterIndex and maxHp are required' })
    const monster = await svc.addMonster({ encounterId: req.params.encounterId, monsterIndex, customName, maxHp })
    res.status(201).json({ monster })
  } catch { res.status(500).json({ error: 'Failed to add monster' }) }
}

export async function updateMonster(req, res) {
  try {
    if (!await requireGM(req.params.campaignId, req.userId, res)) return
    res.json({ monster: await svc.updateMonster(req.params.monsterId, req.body) })
  } catch { res.status(500).json({ error: 'Failed to update monster' }) }
}

export async function removeMonster(req, res) {
  try {
    if (!await requireGM(req.params.campaignId, req.userId, res)) return
    await svc.removeMonster(req.params.monsterId)
    res.status(204).send()
  } catch { res.status(500).json({ error: 'Failed to remove monster' }) }
}