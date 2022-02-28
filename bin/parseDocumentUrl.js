#!/usr/bin/env node
import fetch from 'node-fetch'
import _debug from 'debug'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { parse } from '../lib/speakables.js'

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
        return false
      }

      return res.json()
    })
    .catch((e) => {
      debug('failed to fetch %s: %s', argv.apiUrl, e.message)
    })

  if (!response.data?.document?.content) {
    debug(
      'data.document.content in response missing on path "%s": %o',
      argv.path,
      response.data,
    )
    return
  }

  await parse(response.data.document.content).catch((e) => {
    debug('parsing failed: %s', e.message)
  })
}

run()
