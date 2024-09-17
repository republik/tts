import crypto from 'crypto'
import createDebug from 'debug'
import dayjs from 'dayjs'

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

export function ScriptError(message, payload) {
  this.message = message
  this.name = 'ScriptError'
  this.payload = payload
}

ScriptError.prototype = Error.prototype