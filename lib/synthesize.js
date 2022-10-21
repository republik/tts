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

const {
  AZURE_SUBSCRIPTION_KEY,
  AZURE_SERVICE_REGION,
  AZURE_REQUEST_CONCURRENCY = 5,
} = process.env

const speechConfig = SpeechConfig.fromSubscription(
  AZURE_SUBSCRIPTION_KEY,
  AZURE_SERVICE_REGION,
)

speechConfig.speechSynthesisOutputFormat =
  SpeechSynthesisOutputFormat.Audio48Khz192KBitRateMonoMp3

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
      .map(trimText)
      .map(createSubstituteText(substitutions))
      .map((speakable) => {
        const { type, node, caesura } = speakable
        const { name, rate = 1, pitch = '+0' } = voices[voice]

        // @TOOD: Escape HTML entities?
        switch (type) {
          case 'preface':
            return {
              ...speakable,
              ssml: `<voice name="${name}"><prosody rate="${rate}" pitch="${pitch}st">${node}</prosody><break time="1s" /></voice>`,
            }
          case 'lead':
            return {
              ...speakable,
              ssml: `<voice name="${name}"><prosody rate="${rate}" pitch="${pitch}st">${node}</prosody><break time="1s" /></voice>`,
            }
          case 'title': {
            const title = [meta?.format?.meta?.title, node]
              .filter(Boolean)
              .join(': ')
            return {
              ...speakable,
              ssml: `<voice name="${name}"><prosody rate="${rate}" pitch="${pitch}st">${title}</prosody></voice>`,
            }
          }
          case 'credits':
            return {
              ...speakable,
              ssml: `<voice name="${name}"><prosody rate="${rate}" pitch="${pitch}st">${node}</prosody><break time="1.5s" /></voice>`,
            }
          case 'subtitle':
            return {
              ...speakable,
              ssml: `<voice name="${name}"><break time="1s" /><prosody rate="${rate}" pitch="${pitch}st">${node}</prosody><break time="1.2s" /></voice>`,
            }
          // @TODO: Parse credits a little better?
          default: {
            return {
              ...speakable,
              ssml: [
                `<voice name="${name}">`,
                `<prosody rate="${rate}" pitch="${pitch}st">${node}</prosody>`,
                !!caesura?.after && `<break time="1.5s" />`,
                `</voice>`,
              ]
                .filter(Boolean)
                .join(''),
            }
          }
        }
      })
      .map(appendHash)
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

      const { audioData } = await toSpeech(speakable.ssml)
      debug('done: %o', { ...speakable, audioData: !!speakable.audioData })

      return { ...speakable, audioData, synthesize: true }
    },
    { concurrency: AZURE_REQUEST_CONCURRENCY },
  )

const removeUnspeakable = (speakable) => !speakable.unspeakable
const removeTextless = (speakable) => !!speakable.text
const trimText = (speakable) => ({ ...speakable, text: speakable.text.trim() })
const createSubstituteText = (substitutions) => {
  if (!substitutions) {
    return (speakable) => speakable
  }

  return (speakable) => {
    const substitutes = substitutions
      .filter(({ regex, substitut }) => !!regex && !!substitut)
      .filter(({ regex }) => new RegExp(regex, 'g').test(speakable.text))

    const substituteStrings = (text) =>
      substitutes.reduce(
        (prev, { regex, substitut }) =>
          prev.replace(new RegExp(regex, 'g'), substitut),
        text,
      )

    const phonemes = substitutions
      .filter(({ regex, phoneme }) => !!regex && !!phoneme)
      .filter(({ regex }) => new RegExp(regex, 'g').test(speakable.text))

    const wrapPhonemes = (text) =>
      phonemes.reduce(
        (prev, { regex, phoneme }) =>
          prev.replace(
            new RegExp(regex, 'g'),
            `<phoneme alphabet="ipa" ph="${phoneme}">$&</phoneme>`,
          ),
        text,
      )

    return {
      ...speakable,
      substitutes,
      phonemes,
      node: wrapPhonemes(substituteStrings(speakable.text)),
    }
  }
}
const appendHash = (speakable) => ({
  ...speakable,
  hash: crypto.createHash('sha256').update(speakable.ssml).digest('hex'),
})
const logSpeakable = (speakable) => {
  const { type, text, node, hash } = speakable
  _debug('synthesize:render')('speakable %o', {
    type,
    text,
    node,
    hash,
  })

  return speakable
}

export function SynthesizeError(message, payload) {
  this.message = message
  this.name = 'SynthesizeError'
  this.payload = payload
}

SynthesizeError.prototype = Error.prototype
