#!/usr/bin/env node
import fetch from 'node-fetch'
import _debug from 'debug'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { parse } from '../lib/speakables.js'
import { ScriptError } from '../lib/utils.js'

const { argv } = yargs(hideBin(process.argv))
  .option('path', { require: true })
  .option('api-url', { default: 'http://localhost:5010/graphql' })

const run = async () => {
  const debug = _debug('parseDocumentUrl')

  const response = await fetch(argv.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query:
        'query ($path: String!) {\n  document(path: $path) {\n    content\n  }\n}',
      variables: { path: argv.path },
    }),
  })
    .then((res) => {
      if (!res.ok) {
        debug('response not ok: %s', res.statusText)
        throw new ScriptError('response not ok', {
          status: res.status,
          statusText: res.statusText,
          path: argv.path,
          apiUrl: argv.apiUrl,
        })
      }

      return res.json()
    })
    .catch((e) => {
      if (e.name === 'ScriptError') {
        throw e
      }

      debug('failed to fetch %s: %s', argv.apiUrl, e.message)
      throw new ScriptError(e.message, {
        path: argv.path,
        apiUrl: argv.apiUrl,
      })
    })

  if (!response.data?.document?.content) {
    debug('data.document.content missing on "%s": %o', argv.path, response.data)
    throw new ScriptError('data.document.content missing', {
      data: !!response.data,
      document: !!response.data.document,
      path: argv.path,
      apiUrl: argv.apiUrl,
    })
  }

  await parse(response.data.document.content)
}

run().catch(console.error)
