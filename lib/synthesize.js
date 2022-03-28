import {
  SpeechConfig,
  SpeechSynthesisOutputFormat,
  SpeechSynthesizer,
  CancellationDetails,
  CancellationReason,
} from 'microsoft-cognitiveservices-speech-sdk'
import Promise from 'bluebird'
import crypto from 'crypto'
import _debug from 'debug'

export const voices = {
  alpha: {
    /* Best female voice */ name: 'de-DE-LouisaNeural',
    rate: 1.1,
    pitch: '-0.8',
  },
}

const { AZURE_SUBSCRIPTION_KEY, AZURE_SERVICE_REGION } = process.env

const speechConfig = SpeechConfig.fromSubscription(
  AZURE_SUBSCRIPTION_KEY,
  AZURE_SERVICE_REGION,
)

speechConfig.speechSynthesisOutputFormat =
  SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3

const preface = {
  type: 'preface',
  text: 'Sie hören diesen Beitrag mit Hilfe einer synthetischen Stimme.',
}

export const createRender =
  ({ meta = false, substitutions = false, voice = 'alpha' } = {}) =>
  async (speakables) => {
    const filteredSpeakables = speakables
      .filter(removeUnspeakable)
      .filter(removeTextless)

    if (!filteredSpeakables.length) {
      throw new SynthesizeError('no speakables found to render', { speakables })
    }

    return [preface, ...filteredSpeakables]
      .map(createSubstituteText(substitutions))
      .map((speakable) => {
        const { type, text } = speakable
        const { name, rate = 1, pitch = '+0' } = voices[voice]

        const lexiconTag = ''

        // @TOOD: Escape HTML entities?
        switch (type) {
          case 'preface':
            return {
              ...speakable,
              node: `<voice name="${name}">${lexiconTag}<prosody rate="${rate}" pitch="${pitch}st">${text}</prosody><break time="1.5s" /></voice>`,
            }
          case 'lead':
            return {
              ...speakable,
              node: `<voice name="${name}">${lexiconTag}<prosody rate="${rate}" pitch="${pitch}st">${text}</prosody><break time="1s" /></voice>`,
            }
          case 'title': {
            const title = [meta?.format?.meta?.title, text]
              .filter(Boolean)
              .join(': ')
            return {
              ...speakable,
              node: `<voice name="${name}">${lexiconTag}<prosody rate="${rate}" pitch="${pitch}st">${title}</prosody></voice>`,
            }
          }
          case 'credits':
            return {
              ...speakable,
              node: `<voice name="${name}">${lexiconTag}<prosody rate="${rate}" pitch="${pitch}st">${text}</prosody><break time="2s" /></voice>`,
            }
          case 'subtitle':
            return {
              ...speakable,
              node: `<voice name="${name}">${lexiconTag}<prosody rate="${rate}" pitch="${pitch}st">${text}</prosody></voice>`,
            }
          // @TODO: Parse credits a little better?
          default:
            return {
              ...speakable,
              node: `<voice name="${name}">${lexiconTag}<prosody rate="${rate}" pitch="${pitch}st">${text}</prosody></voice>`,
            }
        }
      })
      .map(appendNodeHash)
      .map(logSpeakable)
  }

export const toSpeech = (ssml) =>
  new Promise((resolve, reject) => {
    const debug = _debug('synthesize:toSpeech')
    const synthesizer = new SpeechSynthesizer(speechConfig)

    // The event synthesis completed signals that the synthesis is completed.
    synthesizer.synthesisCompleted = function (s, e) {
      debug('complete (bytes: %s) %o', e.result.audioData.byteLength, { ssml })
    }

    // The synthesis started event signals that the synthesis is started.
    synthesizer.synthesisStarted = function (s, e) {
      debug('started: %o', { ssml })
    }

    // The event signals that the service has stopped processing speech.
    // This can happen when an error is encountered.
    synthesizer.SynthesisCanceled = function (s, e) {
      const cancellationDetails = CancellationDetails.fromResult(e.result)
      debug(
        'cancelled: %s, (details: %s) %o',
        CancellationReason[cancellationDetails.reason],
        e.result.errorDetails,
        { ssml },
      )

      reject(new SynthesizeError(e.result.errorDetails, { ssml }))
    }

    synthesizer.speakSsmlAsync(
      `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="de-DE">${ssml}</speak>`,
      function (result) {
        synthesizer.close()
        resolve(result)
        // synthesizer = undefined
      },
      function (err) {
        synthesizer.close()
        reject(err)
      },
    )
  })

export const synthesize = (speakables) =>
  Promise.map(
    speakables,
    async (speakable) => {
      const debug = _debug('synthesize')
      if (speakable.audioData) {
        debug('skipping, audioData found: %o', {
          ...speakable,
          audioData: !!speakable.audioData,
        })
        return {
          ...speakable,
          synthesize: false,
        }
      }

      const { audioData } = await toSpeech(speakable.node)
      debug('done: %o', { ...speakable, audioData: !!speakable.audioData })

      return { ...speakable, audioData, synthesize: true }
    },
    { concurrency: 5 },
  )

const removeUnspeakable = (speakable) => !speakable.unspeakable
const removeTextless = (speakable) => !!speakable.text
const createSubstituteText = (substitutions) => {
  if (!substitutions) {
    return (speakable) => speakable
  }

  return (speakable) => ({
    ...speakable,
    text: substitutions.reduce(
      (prev, curr) =>
        prev.replace(new RegExp(curr.string, 'g'), curr.substitut),
      speakable.text,
    ),
  })
}
const appendNodeHash = (speakable) => ({
  ...speakable,
  nodeHash: crypto.createHash('sha256').update(speakable.node).digest('hex'),
})
const logSpeakable = (speakable) => {
  const { type, text, node, nodeHash } = speakable
  _debug('synthesize:render')('speakable %o', {
    type,
    text,
    node,
    nodeHash,
  })

  return speakable
}

export function SynthesizeError(message, payload) {
  this.message = message
  this.name = 'SynthesizeError'
  this.payload = payload
}

SynthesizeError.prototype = Error.prototype
