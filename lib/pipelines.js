import _debug from 'debug'

import { createInstance, createProductionUploader } from './s3.js'
import { notifyFailure, notifyProduction } from './notify.js'
import { getSpeakableText } from './textParser/index.js'

const { HUEBSCH_API_URL, HUEBSCH_API_KEY } = process.env

export const produce = async (body) => {
  const debug = _debug('pipelines:produce')

  try {
    const { document, derivativeId, webhookUrl } = body
    // TODO: uncomment before release
    //  await validateSignature(body)
    const { id, content, meta } = document
    const { slug, title } = meta

    debug('begin: %o', {
      id,
      slug,
      title,
      derivativeId,
      webhookUrl,
    })

    const speakableContent = getSpeakableText(content)

    if (!speakableContent?.length) {
      debug('exit early')
      return
    }

    const huebschIntake = `${HUEBSCH_API_URL}/intake/production/${HUEBSCH_API_KEY}`
    const response = await fetch(huebschIntake, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'article',
            attrs: {
              // TODO: include this data in Republik API post request
              title,
              slug: `/${slug}`,
              // webhook: `${PUBLIC_URL}/webhook/huebsch/`,
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
        await notifyFailure(e, body)
      })

    if (!response.ok) {
      debug('error: %o', response.val)
      await notifyFailure(response.val, body)
    }
  } catch (e) {
    debug(e)
    await notifyFailure(e, body)
  }
}

export const publish = async (documentId, response) => {
  const debug = _debug('pipelines:publish')
  debug('begin: %o', response)

  const storage = createInstance()
  const upload = createProductionUploader(storage)

  await upload(documentId, response.val)
  /* .then(notifyProduction)
    .catch(async (e) => {
      debug(e)
      await notifyFailure(e, e.payload)
    }) */

  debug('done: %o', response)
}
