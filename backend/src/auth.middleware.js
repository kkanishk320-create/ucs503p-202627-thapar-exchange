import jwt from 'jsonwebtoken'
import { prisma } from './database.js'

const jwtSecret = process.env.JWT_SECRET

if (!jwtSecret) {
  throw new Error('JWT_SECRET must be set in backend/.env.')
}

export async function requireAuth(request, response, next) {
  const authorization = request.get('authorization')
  const [scheme, token] = authorization?.split(' ') ?? []

  if (scheme !== 'Bearer' || !token) {
    response.status(401).json({ error: 'Authentication required.' })
    return
  }

  try {
    const payload = jwt.verify(token, jwtSecret)
    if (typeof payload === 'string' || typeof payload.userId !== 'string') {
      response.status(401).json({ error: 'Invalid or expired authentication token.' })
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true },
    })
    if (!user) {
      response.status(401).json({ error: 'Invalid or expired authentication token.' })
      return
    }

    request.auth = { userId: user.id }
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      response.status(401).json({ error: 'Invalid or expired authentication token.' })
      return
    }

    next(error)
  }
}
