import 'dotenv/config'
import express from 'express'

import { add } from './lib/queue.js'
import { produce, publish } from './lib/pipelines.js'

const { PORT = 5030 } = process.env

const app = express()

// Accepts a document and produces a read aloud version of it
app.post('/intake/document', express.json({ limit: '1mb' }), (req, res) => {
  const { body } = req

  res.status(200).json({ ok: true })

  add(() => produce(body))
})

// Accepts a webhook from TransloadIt, signaling a finished pipeline
app.post(
  '/webhook/transloadit',
  express.urlencoded({ limit: '1mb' }),
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
