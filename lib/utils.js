import crypto from 'crypto'
import createDebug from 'debug'
import dayjs from 'dayjs'
import measureDuration from '@rocka/mp3-duration'

const { SIGNATURE_SECRET } = process.env

const _debug = createDebug('signature')

export const validateSignature = async (_body) => {
  const debug = _debug.extend('validateSignature')
  debug('body: %o', _body)

  const { signature, ...body } = _body
  if (!signature) {
    debug('signature missing')
    throw Error('signature missing')
  }

  const { expireAt } = body
  if (!expireAt) {
    debug('expireAt missing')
    throw Error('expireAt missing')
  }

  if (dayjs(expireAt).diff() <= 0) {
    debug('expireAt expired')
    throw Error('expireAt expired')
  }

  const expectedSignature = crypto
    .createHmac('sha256', SIGNATURE_SECRET)
    .update(Buffer.from(JSON.stringify(body), 'utf-8'))
    .digest('hex')

  if (expectedSignature !== signature) {
    debug('signature invalid: %o', { expectedSignature, signature })
    throw new Error('signature invalid')
  }

  debug('signature valid')
  return body
}

export const getAudioDurationMs = async (body) => {
  // TODO: get rid of fetch?
  const audioDuration = await fetch(body.asset)
    .then(resToArrayBuffer)
    .then(Buffer.from)
    .then(measureDuration)
    .then(checkSeconds)
    .then(toMiliseconds)
    .catch((e) => {
      console.error(e, body)
      throw e
    })

  return {
    ...body,
    audioDuration,
  }
}

const resToArrayBuffer = (res) => {
  if (!res.ok) {
    throw Error('unable to fetch audio source')
  }

  return res.arrayBuffer()
}

const checkSeconds = (seconds) => {
  if (seconds === 0) {
    throw new Error('unable to measure audio source duration')
  }

  return seconds
}

const toMiliseconds = (seconds) => Math.round(seconds * 1000)

export function ScriptError(message, payload) {
  this.message = message
  this.name = 'ScriptError'
  this.payload = payload
}

ScriptError.prototype = Error.prototype
