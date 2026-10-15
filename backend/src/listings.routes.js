import { Router } from 'express'
import { prisma } from './database.js'
import { requireAuth } from './auth.middleware.js'

const router = Router()

router.get('/', async (_request, response) => {
  const listings = await prisma.listing.findMany({
    where: { status: 'AVAILABLE' },
  })

  response.json(listings)
})

router.get('/:id', async (request, response) => {
  const listing = await prisma.listing.findUnique({
    where: { id: request.params.id },
  })

  if (!listing) {
    response.status(404).json({ error: 'Listing not found.' })
    return
  }

  response.json(listing)
})

router.post('/', requireAuth, async (request, response) => {
  const body = request.body
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    response.status(400).json({ error: 'Request body must be a JSON object.' })
    return
  }

  const requiredFields = ['title', 'description', 'category']
  const missingFields = requiredFields.filter(
    (field) => typeof body[field] !== 'string' || !body[field].trim(),
  )
  if (missingFields.length > 0) {
    response.status(400).json({
      error: 'Required fields must be non-empty strings.',
      fields: missingFields,
    })
    return
  }

  const priceText = String(body.pricePerDay ?? '').trim()
  const pricePerDay = Number(priceText)
  if (
    !/^\d+(\.\d{1,2})?$/.test(priceText) ||
    !Number.isFinite(pricePerDay) ||
    pricePerDay <= 0 ||
    pricePerDay > 99999999.99
  ) {
    response.status(400).json({
      error: 'pricePerDay must be a positive number with at most 2 decimal places.',
    })
    return
  }

  if (
    body.imageUrl !== undefined &&
    body.imageUrl !== null &&
    typeof body.imageUrl !== 'string'
  ) {
    response.status(400).json({
      error: 'imageUrl must be a string or null.',
    })
    return
  }

  const listing = await prisma.listing.create({
    data: {
      title: body.title.trim(),
      description: body.description.trim(),
      category: body.category.trim(),
      pricePerDay: priceText,
      ownerId: request.auth.userId,
      ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl } : {}),
    },
  })

  response.status(201).json(listing)
})

export default router
