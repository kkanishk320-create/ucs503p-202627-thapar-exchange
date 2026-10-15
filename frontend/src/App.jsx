import { useEffect, useState } from 'react'
import './App.css'

const initialForm = {
  title: '',
  description: '',
  category: '',
  pricePerDay: '',
  imageUrl: '',
}

function getSavedSession() {
  try {
    const value = window.localStorage.getItem('thaparrent-session')
    if (!value) return null
    const session = JSON.parse(value)
    return typeof session.token === 'string' && session.user?.id ? session : null
  } catch {
    return null
  }
}

async function readResponse(response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}.`)
  }
  return data
}

function getRequestError(error, fallback) {
  if (error instanceof TypeError) {
    return 'Could not reach the API. Make sure the frontend and backend servers are running.'
  }
  return error.message || fallback
}

function authenticatedRequest(path, token, options = {}) {
  return fetch(path, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  })
}

function formatPrice(price) {
  const amount = Number(price)
  return Number.isFinite(amount) ? amount.toFixed(2) : price
}

function App() {
  const appName = import.meta.env.VITE_APP_TITLE || 'ThaparRent'
  const [listings, setListings] = useState([])
  const [listingsLoading, setListingsLoading] = useState(true)
  const [listingsError, setListingsError] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [selectedListing, setSelectedListing] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [session, setSession] = useState(getSavedSession)
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [formMessage, setFormMessage] = useState('')
  const [formError, setFormError] = useState('')
  const [myBookings, setMyBookings] = useState([])
  const [ownerBookings, setOwnerBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [bookingsError, setBookingsError] = useState('')
  const [bookingActionId, setBookingActionId] = useState('')
  const [bookingMessage, setBookingMessage] = useState('')
  const [bookingError, setBookingError] = useState('')

  async function loadListings() {
    setListingsLoading(true)
    setListingsError('')
    try {
      const response = await fetch('/api/listings')
      setListings(await readResponse(response))
    } catch (error) {
      setListingsError(getRequestError(error, 'Could not load listings.'))
    } finally {
      setListingsLoading(false)
    }
  }

  useEffect(() => {
    loadListings()
  }, [])

  async function loadBookings() {
    if (!session?.token) return
    setBookingsLoading(true)
    setBookingsError('')
    try {
      const [mineResponse, ownerResponse] = await Promise.all([
        authenticatedRequest('/api/bookings/mine', session.token),
        authenticatedRequest('/api/bookings/owner', session.token),
      ])
      const [mine, owner] = await Promise.all([
        readResponse(mineResponse),
        readResponse(ownerResponse),
      ])
      setMyBookings(mine)
      setOwnerBookings(owner)
    } catch (error) {
      setBookingsError(getRequestError(error, 'Could not load bookings.'))
    } finally {
      setBookingsLoading(false)
    }
  }

  useEffect(() => {
    if (session?.token) {
      loadBookings()
    } else {
      setMyBookings([])
      setOwnerBookings([])
    }
  }, [session?.token])

  useEffect(() => {
    if (!selectedId) {
      setSelectedListing(null)
      setDetailError('')
      setDetailLoading(false)
      return undefined
    }

    const controller = new AbortController()
    async function loadListingDetails() {
      setDetailLoading(true)
      setDetailError('')
      setSelectedListing(null)
      try {
        const response = await fetch(`/api/listings/${encodeURIComponent(selectedId)}`, {
          signal: controller.signal,
        })
        setSelectedListing(await readResponse(response))
      } catch (error) {
        if (error.name !== 'AbortError') {
          setDetailError(getRequestError(error, 'Could not load this listing.'))
        }
      } finally {
        if (!controller.signal.aborted) {
          setDetailLoading(false)
        }
      }
    }

    loadListingDetails()
    return () => controller.abort()
  }, [selectedId])

  function updateForm(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setFormMessage('')
    setFormError('')
  }

  async function submitAuth(event) {
    event.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    try {
      const response = await fetch(`/api/auth/${authMode === 'register' ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      })
      const nextSession = await readResponse(response)
      window.localStorage.setItem('thaparrent-session', JSON.stringify(nextSession))
      setSession(nextSession)
      setAuthForm({ name: '', email: '', password: '' })
    } catch (error) {
      setAuthError(getRequestError(error, 'Could not authenticate.'))
    } finally {
      setAuthLoading(false)
    }
  }

  function signOut() {
    window.localStorage.removeItem('thaparrent-session')
    setSession(null)
    setFormMessage('')
    setFormError('')
  }

  async function requestBooking(listingId) {
    if (!session?.token) return
    setBookingActionId(listingId)
    setBookingMessage('')
    setBookingError('')
    try {
      const response = await authenticatedRequest('/api/bookings', session.token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      })
      await readResponse(response)
      setBookingMessage('Rental request sent.')
      await loadBookings()
    } catch (error) {
      setBookingError(getRequestError(error, 'Could not request this rental.'))
    } finally {
      setBookingActionId('')
    }
  }

  async function updateBookingStatus(bookingId, status) {
    if (!session?.token) return
    setBookingActionId(bookingId)
    setBookingMessage('')
    setBookingError('')
    try {
      const response = await authenticatedRequest(
        `/api/bookings/${encodeURIComponent(bookingId)}/status`,
        session.token,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        },
      )
      await readResponse(response)
      setBookingMessage(`Request ${status.toLowerCase()}.`)
      await loadBookings()
    } catch (error) {
      setBookingError(getRequestError(error, 'Could not update this request.'))
    } finally {
      setBookingActionId('')
    }
  }

  async function createListing(event) {
    event.preventDefault()
    setSubmitting(true)
    setFormMessage('')
    setFormError('')

    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          pricePerDay: form.pricePerDay,
          imageUrl: form.imageUrl || null,
        }),
      })
      await readResponse(response)
      setForm(initialForm)
      setFormMessage('Listing created successfully.')
      setSelectedId('')
      await loadListings()
    } catch (error) {
      setFormError(getRequestError(error, 'Could not create listing.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="page">
      <header className="site-header">
        <a
          className="brand"
          href="/"
          aria-label="ThaparRent home"
          onClick={(event) => {
            event.preventDefault()
            setSelectedId('')
          }}
        >
          <span className="brand-mark">T</span>
          <span>{appName}</span>
        </a>
        <span className="campus-label">Made for TIET students</span>
      </header>

      <section className="welcome">
        <p className="eyebrow">Your campus. Shared smarter.</p>
        <h1>Find what you need, right here on campus.</h1>
        <p className="intro">
          ThaparRent is a student-to-student marketplace for renting useful
          things around TIET.
        </p>
      </section>

      <section className="account-section" aria-labelledby="account-heading">
        {session ? (
          <div className="account-status">
            <p id="account-heading">
              Signed in as <strong>{session.user.name}</strong>
            </p>
            <button className="text-button" onClick={signOut}>Sign out</button>
          </div>
        ) : (
          <>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Student account</p>
                <h2 id="account-heading">
                  {authMode === 'register' ? 'Create your account' : 'Welcome back'}
                </h2>
              </div>
              <button
                className="text-button"
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'register' ? 'login' : 'register')
                  setAuthError('')
                }}
              >
                {authMode === 'register' ? 'Already registered? Log in' : 'New student? Register'}
              </button>
            </div>
            <form className="listing-form auth-form" onSubmit={submitAuth}>
              {authMode === 'register' && (
                <label>
                  Name
                  <input
                    name="name"
                    value={authForm.name}
                    onChange={(event) =>
                      setAuthForm((current) => ({ ...current, name: event.target.value }))
                    }
                    autoComplete="name"
                    required
                  />
                </label>
              )}
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={authForm.email}
                  onChange={(event) =>
                    setAuthForm((current) => ({ ...current, email: event.target.value }))
                  }
                  autoComplete="email"
                  required
                />
              </label>
              <label>
                Password
                <input
                  name="password"
                  type="password"
                  value={authForm.password}
                  onChange={(event) =>
                    setAuthForm((current) => ({ ...current, password: event.target.value }))
                  }
                  autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                  minLength={authMode === 'register' ? 8 : undefined}
                  required
                />
              </label>
              {authError && <p className="message error" role="alert">{authError}</p>}
              <button className="submit-button" type="submit" disabled={authLoading}>
                {authLoading
                  ? 'Please wait...'
                  : authMode === 'register'
                    ? 'Register'
                    : 'Log in'}
              </button>
            </form>
          </>
        )}
      </section>

      <section className="marketplace" aria-labelledby="listings-heading">
        {selectedId ? (
          <div className="detail-view">
            <button className="text-button" onClick={() => setSelectedId('')}>
              &larr; Back to listings
            </button>
            {detailLoading && <p role="status">Loading listing...</p>}
            {detailError && <p className="message error" role="alert">{detailError}</p>}
            {selectedListing && (
              <article className="listing-detail">
                {selectedListing.imageUrl && (
                  <img
                    className="detail-image"
                    src={selectedListing.imageUrl}
                    alt={selectedListing.title}
                  />
                )}
                <p className="listing-category">{selectedListing.category}</p>
                <h2>{selectedListing.title}</h2>
                <p className="listing-description">{selectedListing.description}</p>
                <p className="listing-price">
                  ₹{formatPrice(selectedListing.pricePerDay)} <span>/ day</span>
                </p>
                <button
                  className="submit-button"
                  type="button"
                  disabled={
                    !session ||
                    selectedListing.ownerId === session.user.id ||
                    bookingActionId === selectedListing.id
                  }
                  onClick={() => requestBooking(selectedListing.id)}
                >
                  {!session
                    ? 'Log in to request'
                    : selectedListing.ownerId === session.user.id
                      ? 'Your listing'
                      : bookingActionId === selectedListing.id
                        ? 'Sending request...'
                        : 'Request to Rent'}
                </button>
              </article>
            )}
          </div>
        ) : (
          <>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Explore the marketplace</p>
                <h2 id="listings-heading">Available listings</h2>
              </div>
              <button className="text-button" onClick={loadListings} disabled={listingsLoading}>
                Refresh
              </button>
            </div>
            {listingsLoading && <p role="status">Loading listings...</p>}
            {listingsError && (
              <p className="message error" role="alert">
                {listingsError}
              </p>
            )}
            {!listingsLoading && !listingsError && listings.length === 0 && (
              <p className="empty-state">No available listings yet. Be the first to add one.</p>
            )}
            {!listingsLoading && !listingsError && listings.length > 0 && (
              <div className="listing-grid">
                {listings.map((listing) => (
                  <article className="listing-card" key={listing.id}>
                    {listing.imageUrl ? (
                      <img className="listing-image" src={listing.imageUrl} alt="" />
                    ) : (
                      <span className="listing-image image-placeholder">ThaparRent</span>
                    )}
                    <div className="listing-card-body">
                      <span className="listing-category">{listing.category}</span>
                      <button
                        className="listing-title listing-details-button"
                        onClick={() => setSelectedId(listing.id)}
                      >
                        {listing.title}
                      </button>
                      <span className="listing-description">{listing.description}</span>
                      <span className="listing-price">
                        ₹{formatPrice(listing.pricePerDay)} <span>/ day</span>
                      </span>
                      <button
                        className="submit-button"
                        type="button"
                        disabled={
                          !session ||
                          listing.ownerId === session.user.id ||
                          bookingActionId === listing.id
                        }
                        onClick={() => requestBooking(listing.id)}
                      >
                        {!session
                          ? 'Log in to request'
                          : listing.ownerId === session.user.id
                            ? 'Your listing'
                            : bookingActionId === listing.id
                              ? 'Sending request...'
                              : 'Request to Rent'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {session && (
        <section className="bookings-section" aria-labelledby="bookings-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Rental activity</p>
              <h2 id="bookings-heading">My Bookings</h2>
            </div>
            <button
              className="text-button"
              onClick={loadBookings}
              disabled={bookingsLoading}
            >
              Refresh
            </button>
          </div>
          {bookingMessage && <p className="message success" role="status">{bookingMessage}</p>}
          {bookingError && <p className="message error" role="alert">{bookingError}</p>}
          {bookingsError && <p className="message error" role="alert">{bookingsError}</p>}
          {bookingsLoading ? (
            <p role="status">Loading bookings...</p>
          ) : (
            <div className="booking-columns">
              <div>
                <h3>Requests I made</h3>
                {myBookings.length === 0 ? (
                  <p className="empty-state">You have not requested any rentals yet.</p>
                ) : (
                  <div className="booking-list">
                    {myBookings.map((booking) => (
                      <article className="booking-card" key={booking.id}>
                        <div>
                          <h4>{booking.listing.title}</h4>
                          <p>Owner: {booking.listing.owner.name}</p>
                          <p>Status: <strong>{booking.status}</strong></p>
                        </div>
                        <p className="listing-price">
                          ₹{formatPrice(booking.listing.pricePerDay)} <span>/ day</span>
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h3>Requests for my listings</h3>
                {ownerBookings.length === 0 ? (
                  <p className="empty-state">There are no requests for your listings.</p>
                ) : (
                  <div className="booking-list">
                    {ownerBookings.map((booking) => (
                      <article className="booking-card" key={booking.id}>
                        <div>
                          <h4>{booking.listing.title}</h4>
                          <p>From: {booking.renter.name} ({booking.renter.email})</p>
                          <p>Status: <strong>{booking.status}</strong></p>
                        </div>
                        {booking.status === 'PENDING' && (
                          <div className="booking-actions">
                            <button
                              className="submit-button"
                              disabled={bookingActionId === booking.id}
                              onClick={() => updateBookingStatus(booking.id, 'ACCEPTED')}
                            >
                              Accept
                            </button>
                            <button
                              className="reject-button"
                              disabled={bookingActionId === booking.id}
                              onClick={() => updateBookingStatus(booking.id, 'REJECTED')}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      <section className="create-section" aria-labelledby="create-heading">
        <p className="eyebrow">Share with campus</p>
        <h2 id="create-heading">Create a listing</h2>
        {!session && (
          <p className="owner-notice">
            Log in or register to create a listing. Your account will be set as
            the listing owner automatically.
          </p>
        )}
        <form className="listing-form" onSubmit={createListing}>
          <label>
            Title
            <input name="title" value={form.title} onChange={updateForm} required />
          </label>
          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={updateForm}
              rows="4"
              required
            />
          </label>
          <label>
            Category
            <input name="category" value={form.category} onChange={updateForm} required />
          </label>
          <label>
            Price per day (₹)
            <input
              name="pricePerDay"
              type="number"
              min="0.01"
              step="0.01"
              value={form.pricePerDay}
              onChange={updateForm}
              required
            />
          </label>
          <label>
            Image URL (optional)
            <input
              name="imageUrl"
              type="url"
              value={form.imageUrl}
              onChange={updateForm}
            />
          </label>
          {formError && <p className="message error" role="alert">{formError}</p>}
          {formMessage && <p className="message success" role="status">{formMessage}</p>}
          <button className="submit-button" type="submit" disabled={submitting || !session}>
            {!session ? 'Log in to create listing' : submitting ? 'Creating...' : 'Create listing'}
          </button>
        </form>
      </section>

      <footer className="site-footer">
        <span>{appName}</span>
        <span>Built for the TIET community</span>
      </footer>
    </main>
  )
}

export default App
