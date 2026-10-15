# Week 3 - Listing API Development

## Objective
The objective was to implement rental listing APIs and connect them to the React frontend.

## Work Completed
- Added API routes to retrieve available listings and retrieve one listing by its ID.
- Added listing creation with validation for required fields and price.
- Connected the frontend to the API through the existing Vite proxy.
- Displayed listing cards and details, and added loading, empty, and error states.
- Added a form for creating listings with an optional image URL.

## Challenges / Observations
Listing creation depended on an existing user because each listing required an owner. The API therefore needed to report invalid input and missing records clearly.

## Learning
I learned how the frontend sent requests to an Express API and how Prisma performed database operations without writing raw SQL.

## Week Outcome
Students could view listings and listing details, and the frontend could submit listing data to the backend.
