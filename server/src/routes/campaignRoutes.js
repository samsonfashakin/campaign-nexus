import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import {
  listCampaigns, createCampaign, getCampaign,
  updateCampaign, deleteCampaign,
  joinCampaign, addCharacter, removeCharacter,
} from '../controllers/campaignController.js'
import {
  listEncounters, createEncounter, getEncounter,
  deleteEncounter, addMonster, updateMonster, removeMonster,
} from '../controllers/encounterController.js'

const router = Router()
router.use(requireAuth)

router.get('/',    listCampaigns)
router.post('/',   createCampaign)
router.get('/:id', getCampaign)
router.patch('/:id', updateCampaign)
router.delete('/:id', deleteCampaign)
router.post('/:id/join', joinCampaign)
router.post('/:id/characters', addCharacter)
router.delete('/:id/characters/:characterId', removeCharacter)

router.get('/:campaignId/encounters', listEncounters)
router.post('/:campaignId/encounters', createEncounter)
router.get('/:campaignId/encounters/:encounterId', getEncounter)
router.delete('/:campaignId/encounters/:encounterId', deleteEncounter)
router.post('/:campaignId/encounters/:encounterId/monsters', addMonster)
router.patch('/:campaignId/encounters/:encounterId/monsters/:monsterId', updateMonster)
router.delete('/:campaignId/encounters/:encounterId/monsters/:monsterId', removeMonster)

export default router