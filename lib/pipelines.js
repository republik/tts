import _debug from 'debug'

import { createInstance, createProductionUploader } from './s3.js'
import { notifyFailure, notifyProduction } from './notify.js'
import { getSpeakableText } from './textParser/index.js'
import { getFromHuebsch, uploadToHuebsch } from './huebsch.js'
import { validateSignature, getAudioDurationMs } from './utils.js'

export const produce = async (body) => {
  const debug = _debug('pipelines:produce')
  const notifyProduceFailure = notifyFailure(body)

  try {
    const { document, derivativeId, webhookUrl } = body
    // TODO: uncomment before release
    await validateSignature(body)
    const { id, content } = document
    const { meta } = content

    debug('begin: %o', {
      id,
      derivativeId,
      webhookUrl,
    })

    const speakableContent = getSpeakableText(content, meta.syntheticVoice)

    if (!speakableContent?.length) {
      debug('exit early')
      return
    }

    await uploadToHuebsch(speakableContent, meta, notifyProduceFailure)
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
    .then(getAudioDurationMs)
    .then(notifyProduction)
    .catch(async (e) => {
      debug(e)
      await notifyFailure(e, e.payload)
    })

  debug('done: %o', response.val.asset)
}
