import {
  createUser,
  findUserByEmail,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  findUserById,
} from '../services/authService.js'

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, in milliseconds
}

export async function signup(req, res) {
  const { email, password, displayName } = req.body

  if (!email || !password || !displayName) {
    return res.status(400).json({ error: 'email, password, and displayName are all required' })
  }

  const existing = await findUserByEmail(email)
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists' })
  }

  const user = await createUser({ email, password, displayName })

  res.cookie('refreshToken', generateRefreshToken(user), REFRESH_COOKIE_OPTIONS)
  res.status(201).json({
    accessToken: generateAccessToken(user),
    user: { id: user.id, email: user.email, displayName: user.displayName },
  })
}

export async function login(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' })
  }

  const user = await findUserByEmail(email)
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  res.cookie('refreshToken', generateRefreshToken(user), REFRESH_COOKIE_OPTIONS)
  res.json({
    accessToken: generateAccessToken(user),
    user: { id: user.id, email: user.email, displayName: user.displayName },
  })
}

export async function refresh(req, res) {
  const token = req.cookies.refreshToken
  if (!token) {
    return res.status(401).json({ error: 'No refresh token provided' })
  }

  try {
    const payload = verifyRefreshToken(token)
    const accessToken = generateAccessToken({ id: payload.sub })
    res.json({ accessToken })
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token' })
  }
}

export function logout(req, res) {
  res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS)
  res.status(204).send()
}

export async function me(req, res) {
  try {
    const user = await findUserById(req.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
}