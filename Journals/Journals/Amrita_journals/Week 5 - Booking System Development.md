# Week 5 - Booking System Development

## Objective
The objective was to let students request available rentals and let listing owners respond to booking requests.

## Work Completed
- Added a Prisma `Booking` model related to listings and renter accounts.
- Added the `PENDING`, `ACCEPTED`, `REJECTED`, and `CANCELLED` booking statuses.
- Added authenticated APIs to request a booking and view renter and owner booking lists.
- Prevented self-booking and duplicate pending requests for the same listing and renter.
- Allowed listing owners to accept or reject pending requests.
- Added a “Request to Rent” action, a “My Bookings” section, and owner response controls to the frontend.

## Challenges / Observations
Booking authorization depended on the authenticated user, not user IDs supplied by the frontend. A status update also had to be limited to the owner and to pending requests.

## Learning
I learned how related database records and status values supported a basic request-and-response workflow.

## Week Outcome
Students could submit booking requests, review their requests, and accept or reject requests for listings they owned.
