# Backend and database setup

This directory contains the ThaparRent Express API and its PostgreSQL schema.
The API listens on port `5000` by default. Its health endpoint checks both the
application and its database connection.

## Prerequisites

- Node.js 18.18 or newer (the project was checked with Node.js 22.18).
- PostgreSQL.
- A PostgreSQL database and a database user with permission to create and
  update tables.

### Installing and starting PostgreSQL

If PostgreSQL is not installed, install it from the
[official PostgreSQL downloads page](https://www.postgresql.org/download/).
The Windows installer includes pgAdmin; on macOS or Linux, follow the
instructions for your operating system and PostgreSQL version.

Start the PostgreSQL service if it is stopped:

- **Windows:** Find the service with `Get-Service *postgres*` in PowerShell,
  then start the matching service from Windows Services or an elevated shell.
- **macOS (Homebrew):** Start the installed version, for example
  `brew services start postgresql@16`.
- **Linux (systemd):** Run `sudo systemctl start postgresql`.

Create a database named `thaparrent` using pgAdmin or a PostgreSQL shell and a
role with permission to create databases. If your application role does not
have that permission, ask a PostgreSQL administrator to create the database
and grant the role access:

```sql
CREATE DATABASE thaparrent;
```

PostgreSQL is machine-specific: use the port, database name, username, and
password configured on your computer. The role used for migrations must be
able to create and update tables in the database. During this setup, a
PostgreSQL service was detected listening on port `4000`; the example below
uses the common default port `5432`. If using that detected service, change
`5432` to `4000`. No database credentials or database were created by this
project setup.

## Configure the connection

From this directory, copy the example environment file:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and replace the placeholder username and password with your
PostgreSQL role's credentials. The connection string format is:

```text
postgresql://USER:PASSWORD@localhost:5432/thaparrent?schema=public
```

If the password contains reserved URL characters, percent-encode those
characters before placing it in the connection string.

Set `PORT=5000` in `.env` if you want to explicitly choose the backend port.
Keep real credentials in `.env` only; `.env` is ignored by Git. Do not put
credentials in `.env.example` or commit `.env`.
Set `JWT_SECRET` in `.env` to a long, random value before starting the API.
Keep it private and do not use the example placeholder in a real deployment.

## Initial models

- `User` stores a student's name, unique email, password hash, and timestamps.
  Its `listings` collection represents the one-to-many relationship: one user
  can own many listings.
- `Listing` stores the item details and required `ownerId` foreign key. Its
  `owner` relation points back to the user who owns it. `pricePerDay` is a
  fixed-precision decimal, `imageUrl` is optional, and `status` defaults to
  `AVAILABLE`.

## Install, validate, generate, and migrate

Run these commands from `backend/`:

```powershell
npm install
npm run db:validate
npm run db:generate
npm run db:migrate -- --name init
```

`db:validate` checks the Prisma schema. `db:generate` creates the Prisma client
used by the API. `db:migrate` creates and applies the initial migration to the
configured database; it requires a reachable PostgreSQL server and valid
credentials. A successful schema validation or client generation does not
mean a migration has run.

## Run the applications

Start the backend from `backend/`:

```powershell
npm run dev
```

Start the frontend in a second terminal from `frontend/`:

```powershell
npm install
npm run dev
```

The frontend runs on port `5173` and proxies `/api` requests to the backend on
port `5000`. The health endpoint is `http://localhost:5000/api/health`. When
the database is connected it reports application and database status. If the
database is unavailable, it responds with HTTP `503` without returning
connection credentials or internal error details.

## Student accounts and listing creation

- `POST /api/auth/register` accepts `name`, `email`, and `password`. Passwords
  must be 8 to 72 UTF-8 bytes; the API stores a bcrypt hash and returns a
  one-day JWT with the public user details.
- `POST /api/auth/login` accepts `email` and `password` and returns the same
  token and public user shape.
- Send the token as `Authorization: Bearer <token>` when calling
  `POST /api/listings`. The API derives `ownerId` from the authenticated user;
  the request body must not be used to select an owner.
- `GET /api/listings` and `GET /api/listings/:id` remain public.

## Bookings

- `POST /api/bookings` requires a bearer token and a `listingId`; the renter is
  derived from the token. Only available listings can be requested, and owners
  cannot request their own listings.
- `GET /api/bookings/mine` lists the authenticated student's rental requests.
- `GET /api/bookings/owner` lists requests for the authenticated student's
  listings.
- `PATCH /api/bookings/:id/status` accepts `ACCEPTED` or `REJECTED`. Only the
  listing owner can change a pending request.
- Booking statuses are `PENDING`, `ACCEPTED`, `REJECTED`, and `CANCELLED`.
  Duplicate pending requests by one renter for the same listing are rejected.
