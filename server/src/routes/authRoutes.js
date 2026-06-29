import { Router } from 'express'
import { signup, login, refresh, logout } from '../controllers/authController.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/refresh', refresh)
router.post('/logout', logout)

router.get('/me', requireAuth, (req, res) => {
  res.json({ userId: req.userId })
})

export default router