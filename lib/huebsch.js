import _debug from 'debug'

const { HUEBSCH_API_URL, HUEBSCH_API_KEY } = process.env

const huebschIntake = `${HUEBSCH_API_URL}/intake/production/${HUEBSCH_API_KEY}`

export const uploadToHuebsch = async (
  speakableContent,
  derivativeId,
  meta,
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
            // TODO: include this data in Republik API post request
            title: meta.title,
            slug: `/${meta.slug}`,
            //webhook: `${PUBLIC_URL}/webhook/huebsch/${derivativeId}`,
            webhook:
              'https://webhook.site/f819662d-d9a3-496f-a9c5-13db8ba4dd59',
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

  const audioFile = await fetch(audioUrl)
    .then((res) => {
      debug('res %o', res)
      if (!res.ok) {
        return false
      }
      return res.arrayBuffer()
    })
    .catch((e) => {
      debug(`failed to fetch ${audioUrl}: ${e.message}`)
    })

  debug(audioFile)

  return {
    ...body.val,
    audioFile,
  }
}

function HuebschError(message, payload) {
  this.message = message
  this.name = 'InterfaceWithHuebschError'
  this.payload = payload
}

HuebschError.prototype = Error.prototype