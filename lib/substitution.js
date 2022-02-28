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
        return false
      }

      return res.json()
    })
    .catch((e) => {
      debug(`failed to fetch ${substitutionUrl}: ${e.message}`)
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
