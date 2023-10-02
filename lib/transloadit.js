import Transloadit from 'transloadit'
import fetch from 'node-fetch'
import _debug from 'debug'
import crypto from 'crypto'

const { PUBLIC_URL, TRANSLOADIT_AUTH_KEY, TRANSLOADIT_AUTH_SECRET } =
  process.env

export const createTransloaditConcat = (fields) => {
  if (!TRANSLOADIT_AUTH_KEY) {
    throw new TransloaditError('TRANSLOADIT_AUTH_KEY is not defined.')
  }

  if (!TRANSLOADIT_AUTH_SECRET) {
    throw new TransloaditError('TRANSLOADIT_AUTH_SECRET is not defined.')
  }

  return async (speakables) => {
    const debug = _debug('transloadit:concat')
    const tl = new Transloadit({
      authKey: TRANSLOADIT_AUTH_KEY,
      authSecret: TRANSLOADIT_AUTH_SECRET,
    })

    const use = { steps: [] }
    const steps = {}

    speakables.forEach((speakable, index) => {
      const { audioUrl } = speakable
      if (!audioUrl) {
        return
      }

      const as = `s${String(index).padStart(3, 0)}`

      steps[as] = {
        robot: '/http/import',
        url: audioUrl,
        force_name: as,
      }

      use.steps.push({ name: as, as })
    })

    const options = {
      params: {
        fields,
        steps: {
          ...steps,
          concat: {
            robot: '/audio/concat',
            bitrate: 48000,
            sample_rate: 24000,
            use,
            ffmpeg_stack: "v5.0.0",
          },
        },
        ...(PUBLIC_URL && { notify_url: `${PUBLIC_URL}/webhook/transloadit` }),
      },
    }
    debug('options: %o', options)

    const status = await tl.createAssembly(options).catch((e) => {
      throw new TransloaditError(e.message, { ...fields, steps })
    })

    debug('status: %o', status)

    return speakables
  }
}

export const get = async (body) => {
  const debug = _debug('transloadit:get')

  try {
    const { transloadit } = body
    const { ok, error, fields, results } = JSON.parse(transloadit)

    if (!ok) {
      throw new TransloaditError(error, fields)
    }

    const documentId = fields?.documentId
    const speakablesHash = fields?.speakablesHash
    const derivativeId = fields?.derivativeId
    const webhookUrl = fields?.webhookUrl
    const audioUrl = results?.concat?.[0]?.ssl_url
    const audioDuration = results?.concat?.[0]?.meta.duration

    const audioData = await fetch(audioUrl)
      .then((res) => {
        if (!res.ok) {
          return false
        }

        return res.arrayBuffer()
      })
      .catch((e) => {
        debug(`failed to fetch ${audioUrl}: ${e.message}`)
      })

    return {
      documentId,
      speakablesHash,
      derivativeId,
      webhookUrl,
      audioDuration,
      audioData,
    }
  } catch (e) {
    debug(`failed: ${e.message}`)
    throw e
  }
}

export const validateSignature = async (body) => {
  const debug = _debug('transloadit:validateSignature')

  const { transloadit, signature } = body

  if (!signature) {
    debug('signature missing')
    throw new Error('signature missing')
  }

  const expectedSignature = crypto
    .createHmac('sha1', TRANSLOADIT_AUTH_SECRET)
    .update(Buffer.from(transloadit, 'utf-8'))
    .digest('hex')

  if (expectedSignature !== signature) {
    debug('signature invalid: %o', { expectedSignature, signature })
    throw new Error('signature invalid')
  }

  debug('signature valid')
  return body
}

export function TransloaditError(message, payload) {
  this.message = message
  this.name = 'TransloaditError'
  this.payload = payload
}

TransloaditError.prototype = Error.prototype
