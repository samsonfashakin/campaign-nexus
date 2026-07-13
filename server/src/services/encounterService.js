import { prisma } from './db.js'

export function getEncountersByCampaign(campaignId) {
  return prisma.encounter.findMany({
    where: { campaignId },
    include: { _count: { select: { monsters: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export function getEncounterById(id) {
  return prisma.encounter.findUnique({
    where: { id },
    include: { monsters: true },
  })
}

export function createEncounter({ campaignId, name, notes }) {
  return prisma.encounter.create({ data: { campaignId, name, notes } })
}

export function updateEncounter(id, data) {
  return prisma.encounter.update({ where: { id }, data })
}

export function deleteEncounter(id) {
  return prisma.encounter.delete({ where: { id } })
}

export function addMonster({ encounterId, monsterIndex, customName, maxHp }) {
  return prisma.encounterMonster.create({
    data: { encounterId, monsterIndex, customName, maxHp, currentHp: maxHp },
  })
}

export function updateMonster(id, data) {
  return prisma.encounterMonster.update({ where: { id }, data })
}

export function removeMonster(id) {
  return prisma.encounterMonster.delete({ where: { id } })
}