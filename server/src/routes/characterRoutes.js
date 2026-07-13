import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import {
  listCharacters, createCharacter, getCharacter,
  updateCharacter, deleteCharacter, duplicateCharacter,
  addInventoryItem, updateInventoryItem, deleteInventoryItem,
} from '../controllers/characterController.js'

const router = Router()
router.use(requireAuth)

router.get('/',    listCharacters)
router.post('/',   createCharacter)
router.get('/:id', getCharacter)
router.patch('/:id', updateCharacter)
router.delete('/:id', deleteCharacter)
router.post('/:id/duplicate', duplicateCharacter)

router.post('/:id/inventory', addInventoryItem)
router.patch('/:id/inventory/:itemId', updateInventoryItem)
router.delete('/:id/inventory/:itemId', deleteInventoryItem)

export default router