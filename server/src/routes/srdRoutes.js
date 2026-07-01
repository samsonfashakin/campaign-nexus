import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { monsters, spells, equipment, classes, races, feats } from '../controllers/srdController.js'

const router = Router()
router.use(requireAuth)

router.get('/monsters',         monsters.list)
router.get('/monsters/:index',  monsters.get)
router.get('/spells',           spells.list)
router.get('/spells/:index',    spells.get)
router.get('/equipment',        equipment.list)
router.get('/equipment/:index', equipment.get)
router.get('/classes',          classes.list)
router.get('/classes/:index',   classes.get)
router.get('/races',            races.list)
router.get('/races/:index',     races.get)
router.get('/feats',            feats.list)
router.get('/feats/:index',     feats.get)

export default router