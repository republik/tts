import _debug from 'debug'

const { HUEBSCH_API_URL, HUEBSCH_API_KEY, PUBLIC_URL } = process.env

const huebschIntake = `${HUEBSCH_API_URL}/intake/production/${HUEBSCH_API_KEY}`

export const uploadToHuebsch = async (
  speakableContent,
  derivativeId,
  repoId,
  title,
  notifyFailure,
) => {
  const debug = _debug('huebsch:upload')
  const response = await fetch(huebschIntake, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // if the Huebsch intake API changes this is
    // the part you probably need to adapt:
    body: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'article',
          attrs: {
            title,
            slug: `/${repoId}`,
            webhook: `${PUBLIC_URL}/webhook/huebsch/${derivativeId}`,
            // webhook: 'https://webhook.site/478ab0f1-8086-4f61-b025-99e01ec37976',
          },
          content: speakableContent,
        },
      ],
    }),
  })
    .then((res) => res.json())
    .catch(async (e) => {
      debug(e)
      await notifyFailure(e)
    })

  if (!response.ok) {
    debug('error: %o', response.val)
    await notifyFailure(response.val)
  }
}

export const getFromHuebsch = async (body) => {
  const debug = _debug('huebsch:get')

  const audioUrl = body?.val?.asset

  if (!audioUrl) {
    throw new HuebschError('unable to find url to asset file', { body })
  }

  const audioFile = await fetchWithRetry(audioUrl, debug)
    .then((res) => {
      debug('res %o', res)
      if (!res.ok) {
        return false
      }
      return res.arrayBuffer()
    })
    .catch((e) => {
      debug(`failed to fetch ${audioUrl}: ${e.message}`)
      throw e
    })

  debug(audioFile)

  return {
    ...body.val,
    audioFile,
  }
}

const fetchWithRetry = async (url, debug, retries = 3, waitForMs = 1000) => {
  let error
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) {
        debug(res.body)
        throw new Error(
          `Response not ok with status ${res.status}, retrying...`,
        )
      }
      return res
    } catch (e) {
      debug(
        `Fetching ${url} failed, retrying, tries left = ${retries - attempt}`,
      )
      error = e
      await new Promise((resolve) => setTimeout(resolve, waitForMs))
    }
  }
  throw new HuebschError(
    `failed to fetch ${retries} times with error: ${error}`,
    error,
  )
}

function HuebschError(message, payload) {
  this.message = message
  this.name = 'InterfaceWithHuebschError'
  this.payload = payload
}

HuebschError.prototype = Error.prototype
