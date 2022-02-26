import _debug from 'debug'

import { parse, getSpeakablesHash } from './speakables.js'
import { render, synthesize } from './synthesize.js'
import {
  createTransloaditConcat,
  get,
  validateSignature,
} from './transloadit.js'
import {
  createInstance,
  createProductionUploader,
  createSpeakablesDownloader,
  createSpeakablesUploader,
} from './s3.js'
import { notify } from './notify.js'

export const produce = async (body) => {
  const debug = _debug('pipelines:produce')

  const { document, derivativeId, webhookUrl } = body
  const { id, content } = document

  /* org, name, commitId, versioName */
  const [org, name] = Buffer.from(id, 'base64').toString('utf-8').split('/')

  const pathPrefix = ['tts', org, name, 'speakables'].join('/')

  debug('begin: %o', { org, name, derivativeId, webhookUrl, pathPrefix })

  const storage = createInstance()
  const download = createSpeakablesDownloader(pathPrefix, storage)

  const speakables = await parse(content)
    .then(render)
    .then(download)
    .catch((e) => {
      debug(
        'error occured, aborting pipeline before synthesizing: %s',
        e.message,
      )

      return false
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
  const concat = createTransloaditConcat({
    documentId: document.id,
    speakablesHash,
    derivativeId,
    webhookUrl,
  })

  debug('speakablesHash', speakablesHash)

  await synthesize(speakables)
    .then(upload)
    .then(concat)
    .catch((e) => {
      debug(
        'error occured, aborting pipeline while synthesizing: %s',
        e.message,
      )
    })

  debug('done: %o', { org, name, derivativeId, webhookUrl, pathPrefix })
}

export const publish = async (response) => {
  const debug = _debug('pipelines:publish')
  debug('begin: %o', response)

  const storage = createInstance()
  const upload = createProductionUploader(storage)

  await validateSignature(response).then(get).then(upload).then(notify)

  debug('done: %o', response)
}
