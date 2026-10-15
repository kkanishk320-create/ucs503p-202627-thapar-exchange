import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from './database.js'
import { requireAuth } from './auth.middleware.js'

const router = Router()

router.use(requireAuth)

router.post('/', async (request, response) => {
  const { listingId } = request.body ?? {}
  if (typeof listingId !== 'string' || !listingId.trim()) {
    response.status(400).json({ error: 'listingId is required.' })
    return
  }

  try {
    const result = await prisma.$transaction(async (transaction) => {
      const listing = await transaction.listing.findUnique({
        where: { id: listingId.trim() },
        select: { id: true, ownerId: true, status: true },
      })
      if (!listing) return { error: 'Listing not found.', status: 404 }
      if (listing.status !== 'AVAILABLE') {
        return { error: 'This listing is not available for booking.', status: 409 }
      }
      if (listing.ownerId === request.auth.userId) {
        return { error: 'You cannot request your own listing.', status: 403 }
      }

      const pendingBooking = await transaction.booking.findFirst({
        where: {
          listingId: listing.id,
          renterId: request.auth.userId,
          status: 'PENDING',
        },
        select: { id: true },
      })
      if (pendingBooking) {
        return {
          error: 'You already have a pending request for this listing.',
          status: 409,
        }
      }

      const booking = await transaction.booking.create({
        data: {
          listingId: listing.id,
          renterId: request.auth.userId,
        },
        include: {
          listing: { select: { id: true, title: true, pricePerDay: true } },
        },
      })
      return { booking }
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })

    if (result.error) {
      response.status(result.status).json({ error: result.error })
      return
    }
    response.status(201).json(result.booking)
  } catch (error) {
    if (error?.code === 'P2034') {
      response.status(409).json({
        error: 'A booking request for this listing is already being processed. Please retry.',
      })
      return
    }
    throw error
  }
})

router.get('/mine', async (request, response) => {
  const bookings = await prisma.booking.findMany({
    where: { renterId: request.auth.userId },
    include: {
      listing: {
        include: { owner: { select: { id: true, name: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  response.json(bookings)
})

router.get('/owner', async (request, response) => {
  const bookings = await prisma.booking.findMany({
    where: { listing: { ownerId: request.auth.userId } },
    include: {
      listing: { select: { id: true, title: true, pricePerDay: true } },
      renter: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  response.json(bookings)
})

router.patch('/:id/status', async (request, response) => {
  const { status } = request.body ?? {}
  if (status !== 'ACCEPTED' && status !== 'REJECTED') {
    response.status(400).json({
      error: 'status must be either ACCEPTED or REJECTED.',
    })
    return
  }

  const booking = await prisma.booking.findUnique({
    where: { id: request.params.id },
    select: { id: true, status: true, listing: { select: { ownerId: true } } },
  })
  if (!booking) {
    response.status(404).json({ error: 'Booking request not found.' })
    return
  }
  if (booking.listing.ownerId !== request.auth.userId) {
    response.status(403).json({ error: 'Only the listing owner can update this request.' })
    return
  }
  if (booking.status !== 'PENDING') {
    response.status(409).json({ error: 'Only pending requests can be updated.' })
    return
  }

  const update = await prisma.booking.updateMany({
    where: { id: booking.id, status: 'PENDING' },
    data: { status },
  })
  if (update.count === 0) {
    response.status(409).json({ error: 'This booking request has already been updated.' })
    return
  }

  const updatedBooking = await prisma.booking.findUnique({
    where: { id: booking.id },
    include: {
      listing: { select: { id: true, title: true } },
      renter: { select: { id: true, name: true } },
    },
  })
  response.json(updatedBooking)
})

export default router
