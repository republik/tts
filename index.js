import 'dotenv/config'
import express from 'express'

import { add } from './lib/queue.js'
import { produce, publish } from './lib/pipelines.js'

import * as Sentry from '@sentry/node'
import { ProfilingIntegration } from '@sentry/profiling-node'

const { PORT = 5030 } = process.env

const app = express()

Sentry.init({
  dsn: 'https://339907934a8fd86af5632cd534a24e8e@o4505721260212224.ingest.sentry.io/4505958164135936',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({ app }),
    new ProfilingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
})

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler())

// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler())

// Accepts a document and produces a read aloud version of it
app.post('/intake/document', express.json({ limit: '1.5mb' }), (req, res) => {
  const { body } = req

  res.status(200).json({ ok: true })

  add(() => produce(body))
})

// Accepts a webhook from TransloadIt, signaling a finished pipeline
app.post(
  '/webhook/transloadit',
  express.urlencoded({ limit: '1.5mb' }),
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
