import fetch from 'node-fetch'
import _debug from 'debug'

export const notify = async (production) => {
  const debug = _debug('notify')

  const { webhookUrl, audioData } = production
  if (!webhookUrl) {
    debug('missing webhookUrl %o', production)
    return production
  }

  debug('notifiying: %s %o', webhookUrl, {
    ...production,
    audioData: !!audioData,
  })

  await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(production),
  })
    .then(async (res) => {
      if (!res.ok) {
        return false
      }

      const json = await res.json()

      debug('done. response body: %o', json)

      return json
    })
    .catch((e) => {
      debug('failed. message: %s', e.message)
      console.error(`failed to fetch ${webhookUrl}: ${e.message}`)
    })

  return production
}
