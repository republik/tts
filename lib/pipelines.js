import _debug from 'debug'

import { parseMdast } from './textParser/mdastParser.js'
import { createRender, synthesize } from './synthesize.js'
import {
  createInstance,
  createProductionUploader,
  createSpeakablesDownloader,
  createSpeakablesUploader,
} from './s3.js'
import { notifyProduction, notifyFailure } from './notify.js'
import { validateSignature } from './utils.js'

export const produce = async (body) => {
  const debug = _debug('pipelines:produce')

  try {
    const { document, derivativeId, webhookUrl, substitutionUrl } =
      await validateSignature(body)
    const { id, content } = document

    /* org, name, commitId, versioName */
    const [org, name] = Buffer.from(id, 'base64').toString('utf-8').split('/')

    const pathPrefix = ['tts', org, name, 'speakables'].join('/')

    debug('begin: %o', {
      org,
      name,
      derivativeId,
      webhookUrl,
      substitutionUrl,
      pathPrefix,
    })

    const storage = createInstance()

    const render = createRender({
      meta: null,
      voice: 'alpha',
    })

    const download = createSpeakablesDownloader(pathPrefix, storage)
    const speakables = parseMdast(content)
      .then(render)
      .then(download)
      .catch((e) => {
        debug(
          'error occured, aborting pipeline before synthesizing: %s',
          e.message,
        )

        throw e
      })

    if (!speakables?.length) {
      debug('exit early')
      return
    }

    debug(
      'speakables: %d (downloaded: %s)',
      speakables.length,
      speakables.filter((s) => !!s.downloaded).length,
    )

    const upload = createSpeakablesUploader(pathPrefix, storage)

    await synthesize(speakables)
      .then(upload)
      .catch((e) => {
        debug(
          'error occured, aborting pipeline while synthesizing: %s',
          e.message,
        )

        throw e
      })

    debug('done: %o', { org, name, derivativeId, webhookUrl, pathPrefix })
  } catch (e) {
    console.error(e)
    await notifyFailure(e, body)
  }
}

export const publish = async (response) => {
  const debug = _debug('pipelines:publish')
  debug('begin: %o', response)

  const storage = createInstance()
  const upload = createProductionUploader(storage)

  await upload(response)
    .then(notifyProduction)
    .catch(async (e) => {
      console.error(e)
      await notifyFailure(e, e.payload)
    })

  debug('done: %o', response)
}
