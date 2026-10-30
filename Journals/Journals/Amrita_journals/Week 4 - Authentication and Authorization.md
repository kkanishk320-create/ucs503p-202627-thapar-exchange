# Week 4 - Authentication and Authorization

## Objective
The objective was to add student registration and login and protect listing creation.

## Work Completed
- Added registration and login endpoints using student name, email, and password.
- Used bcrypt to hash passwords before storing them.
- Used JWTs to authenticate requests and added middleware to verify them.
- Added matching registration and login forms to the frontend.
- Protected listing creation and derived the listing owner from the authenticated user.

## Challenges / Observations
The API had to reject duplicate email registrations and avoid exposing password hashes. Listing ownership could not be trusted from data submitted by the frontend.

## Learning
I learned how password hashing differed from storing a password directly and how JWT middleware could identify an authenticated user on protected routes.

## Week Outcome
Students could register and log in, and only an authenticated student could create a listing under their own account.
