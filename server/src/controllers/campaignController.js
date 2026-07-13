import * as svc from '../services/campaignService.js'

async function requireMember(campaignId, userId, res) {
  const m = await svc.getMembership(campaignId, userId)
  if (!m) { res.status(403).json({ error: 'Not a member of this campaign' }); return null }
  return m
}

async function requireGM(campaignId, userId, res) {
  const m = await requireMember(campaignId, userId, res)
  if (!m) return null
  if (m.role !== 'GM') { res.status(403).json({ error: 'Only the GM can do this' }); return null }
  return m
}

export async function listCampaigns(req, res) {
  try { res.json({ campaigns: await svc.getCampaignsByUser(req.userId) }) }
  catch { res.status(500).json({ error: 'Failed to fetch campaigns' }) }
}

export async function createCampaign(req, res) {
  try {
    const { name, description } = req.body
    if (!name) return res.status(400).json({ error: 'Campaign name is required' })
    const campaign = await svc.createCampaign({ name, description, createdById: req.userId })
    res.status(201).json({ campaign })
  } catch { res.status(500).json({ error: 'Failed to create campaign' }) }
}

export async function getCampaign(req, res) {
  try {
    if (!await requireMember(req.params.id, req.userId, res)) return
    const campaign = await svc.getCampaignById(req.params.id)
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' })
    res.json({ campaign })
  } catch { res.status(500).json({ error: 'Failed to fetch campaign' }) }
}

export async function updateCampaign(req, res) {
  try {
    if (!await requireGM(req.params.id, req.userId, res)) return
    const { name, description } = req.body
    res.json({ campaign: await svc.updateCampaign(req.params.id, { name, description }) })
  } catch { res.status(500).json({ error: 'Failed to update campaign' }) }
}

export async function deleteCampaign(req, res) {
  try {
    if (!await requireGM(req.params.id, req.userId, res)) return
    await svc.deleteCampaign(req.params.id)
    res.status(204).send()
  } catch { res.status(500).json({ error: 'Failed to delete campaign' }) }
}

export async function joinCampaign(req, res) {
  try {
    const existing = await svc.getMembership(req.params.id, req.userId)
    if (existing) return res.status(409).json({ error: 'Already a member' })
    const membership = await svc.joinCampaign(req.params.id, req.userId)
    res.status(201).json({ membership })
  } catch { res.status(500).json({ error: 'Failed to join campaign' }) }
}

export async function addCharacter(req, res) {
  try {
    if (!await requireMember(req.params.id, req.userId, res)) return
    const { characterId } = req.body
    if (!characterId) return res.status(400).json({ error: 'characterId is required' })
    const entry = await svc.addCharacterToCampaign(req.params.id, characterId)
    res.status(201).json({ entry })
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Character already in this campaign' })
    res.status(500).json({ error: 'Failed to add character' })
  }
}

export async function removeCharacter(req, res) {
  try {
    if (!await requireMember(req.params.id, req.userId, res)) return
    await svc.removeCharacterFromCampaign(req.params.id, req.params.characterId)
    res.status(204).send()
  } catch { res.status(500).json({ error: 'Failed to remove character' }) }
}