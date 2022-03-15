import _debug from 'debug'
import { v4 } from 'uuid'

const debug = _debug('queue')

const queue = [] // volatile queues; vanishes when crashed
const state = { current: null }

export const add = (fn) => {
  const pushDebug = debug.extend('push')
  const id = v4()

  pushDebug('add (id: %s)', id)
  queue.push({ id, fn })

  pushDebug('call run')
  run()
}

const run = () => {
  const runDebug = debug.extend('run')

  if (state.current) {
    runDebug('quit run: other job in progress (id: %s)', state.current)
    return
  }

  if (!queue.length) {
    runDebug('quit run: queue empty')
    return
  }

  const job = queue.shift()
  state.current = job.id
  runDebug('run job (id: %s)', state.current)
  setImmediate(createRun(job), 0)
}

const createRun = (job) => {
  job.debug = debug.extend(job.id)

  return async () => {
    try {
      job.debug('call fn')
      await job.fn()
      job.debug('done')
    } catch (e) {
      job.debug('failure: %s', e.message)
    } finally {
      job.debug('reset')
      state.current = null
      run()
    }
  }
}
