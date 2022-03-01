import _debug from 'debug'
import crypto from 'crypto'
import fetch from 'node-fetch'

export const upload = async (lexiconUrl, pathPrefix, storage) => {
  const debug = _debug('lexicon:upload')
  if (!lexiconUrl) {
    debug('no lexiconUrl defined. skipping.')
    return false
  }

  debug('fetching: %s', lexiconUrl)

  const Body = await fetch(lexiconUrl)
    .then((res) => {
      if (!res.ok) {
        debug('response not ok: %s', res.statusText)
        throw new LexiconError('response not ok', {
          fn: 'fetch',
          status: res.status,
          statusText: res.statusText,
          lexiconUrl,
        })
      }

      return res.arrayBuffer()
    })
    .catch((e) => {
      if (e.name === 'LexiconError') {
        throw e
      }

      debug(`failed to fetch ${lexiconUrl}: ${e.message}`)
      throw new LexiconError(e.message, { fn: 'fetch', lexiconUrl })
    })

  if (!Body) {
    debug('lexiconUrl returned nothing. skipping.')
    return false
  }

  const hash = getLexiconHash(Body)

  debug('hash: %s', hash)

  const Key = `${pathPrefix}/lexicon-${hash}.xml`
  const publicUrl = storage.getUrl({ Key })

  const isAvailable = await storage.head({ Key })
  if (isAvailable) {
    debug('found (skipping upload): %s ', Key)
    return publicUrl
  }

  debug('missing, thus uploading: %s', Key)
  await storage.upload({ Body, Key, ContentType: 'application/xml' })

  debug('uploaded to: %s', publicUrl)
  return publicUrl
}

export const getLexiconHash = (body) =>
  crypto.createHash('sha256').update(Buffer.from(body, 'utf-8')).digest('hex')

export function LexiconError(message, payload) {
  this.message = message
  this.name = 'LexiconError'
  this.payload = payload
}

LexiconError.prototype = Error.prototype
