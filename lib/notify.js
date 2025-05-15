import fetch from 'node-fetch'
import _debug from 'debug'

const { API_BASE_URL, NOTIFY_PATH } = process.env

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

  const { audioFile } = production
  const webhookUrl = `${API_BASE_URL}${NOTIFY_PATH}`

  debug('notifying: %s %o', webhookUrl, {
    ...production,
    audioData: !!audioFile,
  })

  await post(webhookUrl, production).catch(console.error)

  debug('done.')

  return production
}

export const notifyFailure = async (error, derivativeId) => {
  const debug = _debug('notify:failure')

  if (!derivativeId) {
    debug('missing derivativeId %o', derivativeId)
    return
  }

  const message = {
    derivativeId,
    error,
  }

  debug('notifying: %s %o', message)

  const webhookUrl = `${API_BASE_URL}${NOTIFY_PATH}`
  await post(webhookUrl, message)

  debug('done.')
}

export function NotifyError(message, payload) {
  this.message = message
  this.name = 'NotifyError'
  this.payload = payload
}

NotifyError.prototype = Error.prototype
