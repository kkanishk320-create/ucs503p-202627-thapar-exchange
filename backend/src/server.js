import express from 'express'
import { checkDatabaseConnection, prisma } from './database.js'
import authRouter from './auth.routes.js'
import bookingsRouter from './bookings.routes.js'
import listingsRouter from './listings.routes.js'

const app = express()
const port = process.env.PORT || 5000

app.use(express.json())

app.get('/api/health', async (_request, response) => {
  try {
    await checkDatabaseConnection()
    response.json({
      status: 'ok',
      application: 'ok',
      database: 'connected',
    })
  } catch (error) {
    console.error('Database health check failed:', error)
    response.status(503).json({
      status: 'error',
      application: 'ok',
      database: 'unavailable',
    })
  }
})

app.use('/api/auth', authRouter)
app.use('/api/bookings', bookingsRouter)
app.use('/api/listings', listingsRouter)

app.use((error, _request, response, _next) => {
  if (error?.type === 'entity.parse.failed') {
    response.status(400).json({ error: 'Request body must contain valid JSON.' })
    return
  }

  if (error?.code === 'P2002') {
    response.status(409).json({
      error: 'An account with this email already exists.',
    })
    return
  }

  if (error?.code === 'P2003') {
    response.status(400).json({ error: 'Related record does not exist.' })
    return
  }

  console.error('API request failed:', error)
  response.status(500).json({ error: 'An unexpected server error occurred.' })
})

const server = app.listen(port, () => {
  console.log(`ThaparRent API listening at http://localhost:${port}`)
})

function shutDown(signal) {
  console.log(`${signal} received; closing the server`)
  server.close(async (error) => {
    if (error) {
      console.error('Failed to close the HTTP server:', error)
      process.exitCode = 1
    }

    try {
      await prisma.$disconnect()
    } catch (disconnectError) {
      console.error('Failed to disconnect Prisma:', disconnectError)
      process.exitCode = 1
    }
  })
}

process.once('SIGINT', () => shutDown('SIGINT'))
process.once('SIGTERM', () => shutDown('SIGTERM'))
