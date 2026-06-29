import { verifyAccessToken } from '../services/authService.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' })
  }

  try {
    const payload = verifyAccessToken(header.slice('Bearer '.length))
    req.userId = payload.sub
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired access token' })
  }
}