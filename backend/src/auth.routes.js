import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from './database.js'

const router = Router()
const jwtSecret = process.env.JWT_SECRET
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const bcryptRounds = 12

if (!jwtSecret) {
  throw new Error('JWT_SECRET must be set in backend/.env.')
}

function createToken(userId) {
  return jwt.sign({ userId }, jwtSecret, { expiresIn: '1d' })
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email }
}

router.post('/register', async (request, response) => {
  const { name, email, password } = request.body ?? {}
  if (
    typeof name !== 'string' ||
    !name.trim() ||
    name.trim().length > 100 ||
    typeof email !== 'string' ||
    !emailPattern.test(email.trim()) ||
    typeof password !== 'string' ||
    Buffer.byteLength(password, 'utf8') < 8 ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    response.status(400).json({
      error: 'Provide a name, valid email, and password of 8 to 72 UTF-8 bytes.',
    })
    return
  }

  const normalizedEmail = email.trim().toLowerCase()
  const passwordHash = await bcrypt.hash(password, bcryptRounds)
  const user = await prisma.user.create({
    data: { name: name.trim(), email: normalizedEmail, passwordHash },
    select: { id: true, name: true, email: true },
  })

  response.status(201).json({
    token: createToken(user.id),
    user: publicUser(user),
  })
})

router.post('/login', async (request, response) => {
  const { email, password } = request.body ?? {}
  if (
    typeof email !== 'string' ||
    !emailPattern.test(email.trim()) ||
    typeof password !== 'string' ||
    !password
  ) {
    response.status(400).json({ error: 'Provide a valid email and password.' })
    return
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    response.status(401).json({ error: 'Invalid email or password.' })
    return
  }

  response.json({
    token: createToken(user.id),
    user: publicUser(user),
  })
})

export default router
