#!/usr/bin/env node
import 'dotenv/config'
import fetch from 'node-fetch'
import _debug from 'debug'
import yargs from 'yargs'
import fs from 'fs/promises'
import { hideBin } from 'yargs/helpers'
import Promise from 'bluebird'
import { exec } from 'child_process'

import { parse } from '../lib/speakables.js'
import { get as getSubstitutions } from '../lib/substitution.js'
import { createRender, synthesize } from '../lib/synthesize.js'
import { ScriptError } from '../lib/utils.js'

const { argv } = yargs(hideBin(process.argv))
  .option('path', { require: true })
  .option('api-url', { default: 'http://localhost:5010/graphql' })
  .option('substitution-url', {
    default: 'http://localhost:5010/publikator/syntheticReadAloud/substitution',
  })

const run = async () => {
  const debug = _debug('renderDocumentUrl')

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

  const substitutions = await getSubstitutions(argv.substitutionUrl)

  const render = createRender({ substitutions })
  const speakables = await parse(response.data.document.content).then(render)

  const synthesized = await synthesize(speakables).then(store).then(concat)

  console.log(JSON.stringify(synthesized, null, 2))
}

const store = async (speakables) => {
  return Promise.map(speakables, async (speakable) => {
    const file = `./local/speakables-${
      speakable.hash || new Date().getTime()
    }.mp3`

    await fs.writeFile(file, Buffer.from(speakable.audioData))

    return { ...speakables, file }
  })
}

const concat = (speakables) => {
  return new Promise((resolve, reject) => {
    const destination = `./local/production-${new Date().getTime()}.mp3`
    const files = speakables.map((speakable) => speakable.file).join('|')

    exec(
      `ffmpeg -i "concat:${files}" -acodec copy ${destination}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`)
          reject(error)
        }
        console.log(`stdout: ${stdout}`)
        console.error(`stderr: ${stderr}`)

        resolve()
      },
    )
  })
}

run().catch(console.error)
