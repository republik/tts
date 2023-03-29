import _debug from 'debug'

import { parse, getSpeakablesHash } from './speakables.js'
import { createRender, synthesize } from './synthesize.js'
import {
  createTransloaditConcat,
  get,
  validateSignature as transloaditValidateSignature,
} from './transloadit.js'
import {
  createInstance,
  createProductionUploader,
  createSpeakablesDownloader,
  createSpeakablesUploader,
} from './s3.js'
import { notifyProduction, notifyFailure } from './notify.js'
import { validateSignature } from './utils.js'
import { get as getSubstitutions } from './substitution.js'

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

    const substitutions = await getSubstitutions(substitutionUrl)

    const storage = createInstance()

    const render = createRender({
      meta: null,
      substitutions,
      voice: 'alpha',
    })

    const download = createSpeakablesDownloader(pathPrefix, storage)
    const speakables = await parse(content)
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

    const speakablesHash = getSpeakablesHash(speakables)
    debug('speakablesHash', speakablesHash)

    const concat = createTransloaditConcat({
      documentId: document.id,
      speakablesHash,
      derivativeId,
      webhookUrl,
    })

    await synthesize(speakables)
      .then(upload)
      .then(concat)
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

  await transloaditValidateSignature(response)
    .then(get)
    .then(upload)
    .then(notifyProduction)
    .catch(async (e) => {
      console.error(e)
      await notifyFailure(e, e.payload)
    })

  debug('done: %o', response)
}
