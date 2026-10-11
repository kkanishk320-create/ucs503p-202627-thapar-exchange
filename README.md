# ThaparRent

ThaparRent is a campus rental marketplace project for TIET students. This
initial setup contains a React + Vite welcome page and a small Express API
health check. Marketplace features will be added in later phases.

## Prerequisites

- Node.js 22.12 or newer
- npm (included with Node.js)

## Install

From the project root, open two terminals and install each app's dependencies:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
```

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

The `.env` files are local settings; the example files are safe templates.

## Run the applications

In the frontend terminal:

```powershell
cd frontend
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

In the backend terminal:

```powershell
cd backend
npm run dev
```

The API listens on `http://localhost:3000`. Check its health endpoint at
`http://localhost:3000/api/health`; it returns `{"status":"ok"}`.

The Vite development server forwards requests whose paths start with `/api` to
the Express server on port 3000.
