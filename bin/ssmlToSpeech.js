#!/usr/bin/env node
import 'dotenv/config'
import { toSpeech } from '../lib/synthesize.js'
import fs from 'fs/promises'

const ssml = `
<voice name="de-DE-LouisaNeural">
  <prosody rate="1.2" pitch="-0.8st">
    Demo-Time!
  </prosody>
</voice>
`

const run = async () => {
  const { audioData } = await toSpeech(ssml)

  console.log(ssml, { audioData })

  await fs.writeFile(
    `./local/ssmlToSpeech-${new Date().getTime()}.mp3`,
    Buffer.from(audioData),
  )
}

run()
