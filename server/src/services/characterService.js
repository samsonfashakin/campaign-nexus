import { prisma } from './db.js'

export function getCharactersByOwner(ownerId) {
  return prisma.character.findMany({
    where: { ownerId },
    include: { campaigns: { include: { campaign: { select: { id: true, name: true } } } } },
    orderBy: { createdAt: 'desc' },
  })
}

export function getCharacterById(id) {
  return prisma.character.findUnique({
    where: { id },
    include: {
      inventory: true,
      campaigns: { include: { campaign: { select: { id: true, name: true } } } },
    },
  })
}

export function createCharacter(data) {
  return prisma.character.create({
    data,
    include: {
      campaigns: {
        include: { campaign: { select: { id: true, name: true } } },
      },
    },
  })
}

export function updateCharacter(id, data) {
  return prisma.character.update({ where: { id }, data })
}

export function deleteCharacter(id) {
  return prisma.character.delete({ where: { id } })
}

export async function duplicateCharacter(id, ownerId) {
  const original = await prisma.character.findUnique({
    where: { id },
    include: { inventory: true },
  })
  if (!original) return null

  const { id: _id, createdAt: _ca, updatedAt: _ua, campaigns: _camp, ...charData } = original

  return prisma.character.create({
    data: {
      ...charData,
      ownerId,
      name: `${original.name} (Copy)`,
      inventory: {
        create: original.inventory.map(({ id: _iid, characterId: _cid, ...item }) => item),
      },
    },
    include: { inventory: true },
  })
}

export function addInventoryItem(characterId, data) {
  return prisma.inventoryItem.create({ data: { characterId, ...data } })
}

export function updateInventoryItem(id, data) {
  return prisma.inventoryItem.update({ where: { id }, data })
}

export function deleteInventoryItem(id) {
  return prisma.inventoryItem.delete({ where: { id } })
}