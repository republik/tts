import _debug from 'debug'

import { createInstance, createProductionUploader } from './s3.js'
import { notifyFailure, notifyProduction } from './notify.js'
import { getSpeakableText } from './textParser/index.js'
import { getFromHuebsch, uploadToHuebsch } from './huebsch.js'
import { validateSignature } from './utils.js'

export const produce = async (body) => {
  const debug = _debug('pipelines:produce')
  const notifyProduceFailure = notifyFailure(body)

  try {
    const { document, derivativeId } = body
    await validateSignature(body)

    const { id, repoId, content } = document
    const { meta } = content

    debug('begin: %o', {
      id,
      derivativeId,
    })

    const speakableContent = getSpeakableText(content)

    if (!speakableContent?.length) {
      debug('exit early')
      return
    }

    await uploadToHuebsch(
      speakableContent,
      derivativeId,
      repoId,
      meta.title,
      notifyProduceFailure,
    )
  } catch (e) {
    debug(e)
    await notifyProduceFailure(e)
  }
}

export const publish = async (derivativeId, response) => {
  const debug = _debug('pipelines:publish')
  debug('begin')

  const storage = createInstance()
  const upload = createProductionUploader(storage, derivativeId)

  await getFromHuebsch(response)
    .then(upload)
    .then(notifyProduction)
    .catch(async (e) => {
      debug(e)
      await notifyFailure(e, e.payload)
    })

  debug('done: %o', response.val.asset)
}
