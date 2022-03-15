import _debug from 'debug'
import fetch from 'node-fetch'

export const get = async (substitutionUrl) => {
  const debug = _debug('substitution:fetch')
  if (!substitutionUrl) {
    debug('no substitutionUrl defined. skipping.')
    return false
  }

  debug('fetching: %s', substitutionUrl)

  const substitutions = await fetch(substitutionUrl)
    .then((res) => {
      if (!res.ok) {
        debug('response not ok: %s', res.statusText)
        throw new SubstitutionError('response not ok', {
          status: res.status,
          statusText: res.statusText,
          substitutionUrl,
        })
      }

      return res.json()
    })
    .catch((e) => {
      if (e.name === 'SubstitutionError') {
        throw e
      }

      debug(`failed to fetch ${substitutionUrl}: ${e.message}`)
      throw new SubstitutionError(e.message, { substitutionUrl })
    })

  if (!substitutions) {
    debug('substitutionUrl returned nothing. skipping.')
    return false
  }

  if (!substitutions.length) {
    debug('no substitutions found. skipping.')
    return false
  }

  debug('substitutions: %i', substitutions?.length)
  return substitutions
}

export function SubstitutionError(message, payload) {
  this.message = message
  this.name = 'SubstitutionError'
  this.payload = payload
}

SubstitutionError.prototype = Error.prototype
