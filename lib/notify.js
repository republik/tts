import fetch from 'node-fetch'
import _debug from 'debug'

const post = (url, body) => {
  const debug = _debug('notify:post')
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
    .then(async (res) => {
      if (!res.ok) {
        debug('response not ok: %s', res.statusText)
        throw new NotifyError('response not ok', {
          fn: 'post',
          status: res.status,
          statusText: res.statusText,
          url,
          body,
        })
      }

      const json = await res.json()

      debug('done. response body: %o', json)

      return json
    })
    .catch((e) => {
      if (e.name === 'NotifyError') {
        throw e
      }

      debug(`failed to fetch ${url}: ${e.message}`)
      throw NotifyError(e.message, { fn: 'post', url, body })
    })
}

export const notifyProduction = async (production) => {
  const debug = _debug('notify:production')

  const { webhookUrl, audioData } = production
  if (!webhookUrl) {
    debug('missing webhookUrl %o', production)
    return production
  }

  debug('notifying: %s %o', webhookUrl, {
    ...production,
    audioData: !!audioData,
  })

  await post(webhookUrl, production).catch(console.error)

  debug('done.')

  return production
}

export const notifyFailure = (body) => async (error) => {
  const debug = _debug('notify:failure')

  const { webhookUrl, derivativeId } = body
  if (!webhookUrl) {
    debug('missing webhookUrl %o', body)
    return
  }

  if (!derivativeId) {
    debug('missing derivativeId %o', body)
    return
  }

  const message = {
    derivativeId,
    error,
  }

  debug('notifying: %s %o', webhookUrl, message)

  await post(webhookUrl, message)

  debug('done.')
}

export function NotifyError(message, payload) {
  this.message = message
  this.name = 'NotifyError'
  this.payload = payload
}

NotifyError.prototype = Error.prototype
