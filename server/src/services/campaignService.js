import { prisma } from './db.js'

export function getCampaignsByUser(userId) {
  return prisma.campaign.findMany({
    where: { memberships: { some: { userId } } },
    include: {
      memberships: {
        where: { userId },
        select: { role: true },
      },
      _count: { select: { characters: true, encounters: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export function getCampaignById(id) {
  return prisma.campaign.findUnique({
    where: { id },
    include: {
      memberships: {
        include: { user: { select: { id: true, displayName: true, email: true } } },
      },
      characters: {
        include: {
          character: {
            include: { owner: { select: { id: true, displayName: true } } },
          },
        },
      },
      encounters: { orderBy: { createdAt: 'desc' } },
    },
  })
}

export function createCampaign({ name, description, createdById }) {
  return prisma.campaign.create({
    data: {
      name,
      description,
      createdById,
      memberships: { create: { userId: createdById, role: 'GM' } },
    },
    include: {
      memberships: {
        where: { userId: createdById },
        select: { role: true },
      },
      _count: { select: { characters: true, encounters: true } },
    },
  })
}

export function updateCampaign(id, data) {
  return prisma.campaign.update({ where: { id }, data })
}

export function deleteCampaign(id) {
  return prisma.campaign.delete({ where: { id } })
}

export function getMembership(campaignId, userId) {
  return prisma.campaignMembership.findUnique({
    where: { campaignId_userId: { campaignId, userId } },
  })
}

export function joinCampaign(campaignId, userId) {
  return prisma.campaignMembership.create({
    data: { campaignId, userId, role: 'PLAYER' },
  })
}

export function addCharacterToCampaign(campaignId, characterId) {
  return prisma.campaignCharacter.create({
    data: { campaignId, characterId, status: 'ACTIVE' },
    include: { character: true },
  })
}

export function removeCharacterFromCampaign(campaignId, characterId) {
  return prisma.campaignCharacter.delete({
    where: { campaignId_characterId: { campaignId, characterId } },
  })
}