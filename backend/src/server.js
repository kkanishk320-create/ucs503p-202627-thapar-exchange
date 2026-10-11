import express from 'express'

const app = express()
const port = process.env.PORT || 3000

app.get('/api/health', (request, response) => {
  response.json({ status: 'ok' })
})

app.listen(port, () => {
  console.log(`ThaparRent API listening at http://localhost:${port}`)
})
