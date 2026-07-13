import * as svc from '../services/characterService.js'

function owned(character, userId, res) {
  if (!character) { res.status(404).json({ error: 'Character not found' }); return false }
  if (character.ownerId !== userId) { res.status(403).json({ error: 'Forbidden' }); return false }
  return true
}

export async function listCharacters(req, res) {
  try { res.json({ characters: await svc.getCharactersByOwner(req.userId) }) }
  catch { res.status(500).json({ error: 'Failed to fetch characters' }) }
}

export async function createCharacter(req, res) {
  try {
    const {
      name,
      class: characterClass,
      race,
      characterType = 'PC',
      level = 1,
      background = null,
    } = req.body

    if (!name || !characterClass || !race) {
      return res.status(400).json({ error: 'name, class, and race are required' })
    }

    const character = await svc.createCharacter({
      ownerId:       req.userId,
      name,
      class:         characterClass,
      race,
      level,
      characterType,
      background,
    })

    res.status(201).json({ character })
  } catch (err) {
    console.error('[createCharacter]', err)
    res.status(500).json({ error: err.message || 'Failed to create character' })
  }
}

export async function getCharacter(req, res) {
  try {
    const character = await svc.getCharacterById(req.params.id)
    if (!owned(character, req.userId, res)) return
    res.json({ character })
  } catch { res.status(500).json({ error: 'Failed to fetch character' }) }
}

export async function updateCharacter(req, res) {
  try {
    const character = await svc.getCharacterById(req.params.id)
    if (!owned(character, req.userId, res)) return
    // Strip relational fields the client might accidentally send
    const { inventory: _, campaigns: __, ...data } = req.body
    res.json({ character: await svc.updateCharacter(req.params.id, data) })
  } catch { res.status(500).json({ error: 'Failed to update character' }) }
}

export async function deleteCharacter(req, res) {
  try {
    const character = await svc.getCharacterById(req.params.id)
    if (!owned(character, req.userId, res)) return
    await svc.deleteCharacter(req.params.id)
    res.status(204).send()
  } catch { res.status(500).json({ error: 'Failed to delete character' }) }
}

export async function duplicateCharacter(req, res) {
  try {
    const character = await svc.getCharacterById(req.params.id)
    if (!owned(character, req.userId, res)) return
    res.status(201).json({ character: await svc.duplicateCharacter(req.params.id, req.userId) })
  } catch { res.status(500).json({ error: 'Failed to duplicate character' }) }
}

export async function addInventoryItem(req, res) {
  try {
    const character = await svc.getCharacterById(req.params.id)
    if (!owned(character, req.userId, res)) return
    const item = await svc.addInventoryItem(req.params.id, req.body)
    res.status(201).json({ item })
  } catch { res.status(500).json({ error: 'Failed to add item' }) }
}

export async function updateInventoryItem(req, res) {
  try {
    const character = await svc.getCharacterById(req.params.id)
    if (!owned(character, req.userId, res)) return
    res.json({ item: await svc.updateInventoryItem(req.params.itemId, req.body) })
  } catch { res.status(500).json({ error: 'Failed to update item' }) }
}

export async function deleteInventoryItem(req, res) {
  try {
    const character = await svc.getCharacterById(req.params.id)
    if (!owned(character, req.userId, res)) return
    await svc.deleteInventoryItem(req.params.itemId)
    res.status(204).send()
  } catch { res.status(500).json({ error: 'Failed to delete item' }) }
}