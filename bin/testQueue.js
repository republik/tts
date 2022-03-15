import sleep from 'await-sleep'

import { add } from '../lib/queue.js'

const run = async () => {
  add(() => console.log('Job 1'))
  add(() => console.log('Job 2'))
  add(async () => {
    console.log('Job 3.1')
    await sleep(1000)
    console.log('Job 3.2')
  })
  add(async () => {
    throw new Error('Ein Fehler! Job 4')
  })

  await sleep(500)

  add(() => console.log('Job 5'))
  add(() => console.log('Job 6'))

  await sleep(2000)

  add(() => console.log('Job 7'))
}

run()
