import 'dotenv/config'
import express from 'express'

import { produce, publish } from './lib/pipelines.js'

const { PORT = 5030 } = process.env

const app = express()

app.post('/intake/document', express.json(), async (req, res) => {
  const { body } = req

  res.status(200).json({ ok: true })

  await produce(body)
})

app.post(
  '/webhook/transloadit',
  express.urlencoded({ extended: true }),
  async (req, res) => {
    const { body } = req

    res.sendStatus(204)

    await publish(body)
  },
)

app.get('/', (req, res) => res.status(200).json({ ok: true }))
app.use((req, res) => res.status(404).json({ ok: false }))

app.listen(PORT)
console.log(`Running on port ${PORT}`)
