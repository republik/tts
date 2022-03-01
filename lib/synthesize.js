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
    rate: 1.2,
    pitch: '-0.8',
  },
  beta: {
    name: 'de-DE-ConradNeural',
    rate: 1,
    pitch: '-0.2',
  },
  gamma: {
    name: 'de-DE-ChristophNeural',
    rate: 1.01,
    pitch: '-0.3',
  },
  delta: {
    name: 'de-DE-GiselaNeural',
    rate: 1.1,
    pitch: '+0',
  },
  epsilon: {
    /** Best male voice */ name: 'de-DE-KillianNeural',
    rate: 1.01,
    pitch: '-0.3',
  },
  A: { name: 'de-DE-AmalaNeural' },
  B: { name: 'de-DE-KillianNeural' },
  C: { name: 'de-DE-ElkeNeural' },
  D: { name: 'de-DE-ConradNeural' },
  E: { name: 'de-DE-KlarissaNeural' },
  F: { name: 'de-DE-RalfNeural' },
  G: { name: 'de-DE-KatjaNeural' },
  H: { name: 'de-DE-ChristophNeural' },
  I: { name: 'de-DE-LouisaNeural' },
  J: { name: 'de-DE-KlausNeural' },
}

const { AZURE_SUBSCRIPTION_KEY, AZURE_SERVICE_REGION } = process.env

const speechConfig = SpeechConfig.fromSubscription(
  AZURE_SUBSCRIPTION_KEY,
  AZURE_SERVICE_REGION,
)

// see https://aka.ms/speech/tts-languages for available languages and voices
// speechConfig.speechSynthesisLanguage = settings.locale
// speechConfig.speechSynthesisVoiceName = 'de-DE-AmalaNeural'
/**
   * output formats (only Mp3 ones listed)
      Audio16Khz32KBitRateMonoMp3 = 3,
      Audio16Khz128KBitRateMonoMp3 = 4,
      Audio16Khz64KBitRateMonoMp3 = 5,
      Audio24Khz48KBitRateMonoMp3 = 6,
      Audio24Khz96KBitRateMonoMp3 = 7,
      Audio24Khz160KBitRateMonoMp3 = 8,
      Audio48Khz96KBitRateMonoMp3 = 21,
      Audio48Khz192KBitRateMonoMp3 = 22,
   */

speechConfig.speechSynthesisOutputFormat =
  SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3
// speechConfig.speechSynthesisOutputFormat = SpeechSynthesisOutputFormat.Audio48Khz96KBitRateMonoMp3

// const CHARS_PER_PORTION = 5678

const preface = {
  type: 'preface',
  text: 'Sie hören diesen Beitrag mit Hilfe einer synthetischen Stimme.',
}

export const createRender =
  ({ meta, substitutions, lexiconUrl, voice = 'alpha' }) =>
  async (speakables) =>
    [preface, ...speakables]
      .filter(removeUnspeakable)
      .filter(removeTextless)
      .map(createSubstituteText(substitutions))
      .map((speakable) => {
        const { type, text } = speakable
        const { name, rate = 1, pitch = '+0' } = voices[voice]

        const lexiconTag = lexiconUrl ? `<lexicon uri="${lexiconUrl}" />` : ''

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
            const reducedRate = (rate * 10 - 1) / 10
            return {
              ...speakable,
              node: `<voice name="${name}">${lexiconTag}<prosody rate="${reducedRate}" pitch="${pitch}st">${title}</prosody></voice>`,
            }
          }
          case 'credits':
            return {
              ...speakable,
              node: `<voice name="${name}">${lexiconTag}<prosody rate="${rate}" pitch="${pitch}st">${text}</prosody><break time="2s" /></voice>`,
            }
          case 'subtitle': {
            const reducedRate = (rate * 10 - 1) / 10
            return {
              ...speakable,
              node: `<voice name="${name}">${lexiconTag}<prosody rate="${reducedRate}" pitch="${pitch}st">${text}</prosody></voice>`,
            }
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

/* export const portion = (parts) => {
  const portions = []

  parts.forEach((part) => {
    if (!part.text?.length) {
      return
    }

    const portionIndex = portions.findIndex(
      (portion) =>
        portion.reduce((prev, curr) => prev + curr.text.length || 0, 0) <
        CHARS_PER_PORTION,
    )

    if (portionIndex < 0) {
      return portions.push([part])
    }

    portions[portionIndex].push(part)
  })

  return portions
} */

export const toSpeech = (ssml) =>
  new Promise((resolve, reject) => {
    const debug = _debug('synthesize:toSpeech')
    // const audioConfig = AudioConfig.fromAudioFileOutput(file)
    const synthesizer = new SpeechSynthesizer(speechConfig /*, audioConfig */)

    // Before beginning speech synthesis, setup the callbacks to be invoked when an event occurs.

    // The event synthesizing signals that a synthesized audio chunk is received.
    // You will receive one or more synthesizing events as a speech phrase is synthesized.
    // You can use this callback to streaming receive the synthesized audio.
    /* synthesizer.synthesizing = function (s, e) {
      var str =
        '(synthesizing) Reason: ' +
        ResultReason[e.result.reason] +
        ' Audio chunk length: ' +
        e.result.audioData.byteLength
      console.log(str)
    } */

    // The event visemeReceived signals that a viseme is detected.
    // a viseme is the visual description of a phoneme in spoken language. It defines the position of the face and mouth when speaking a word.
    /* synthesizer.visemeReceived = function (s, e) {
    var str =
      '(viseme) : Viseme event received. Audio offset: ' +
      e.audioOffset / 10000 +
      'ms, viseme id: ' +
      e.visemeId
    console.log(str)
  } */

    // The event synthesis completed signals that the synthesis is completed.
    synthesizer.synthesisCompleted = function (s, e) {
      debug('complete (bytes: %s) %o', e.result.audioData.byteLength, { ssml })
    }

    // The synthesis started event signals that the synthesis is started.
    synthesizer.synthesisStarted = function (s, e) {
      debug('started: %o', { ssml })
    }

    // const bookmarks = []

    /* synthesizer.bookmarkReached = function (s, e) {
      bookmarks.push(e)

      console.log(
        '(bookmark), Text: ' +
          e.text +
          ', Audio offset: ' +
          Math.round(e.audioOffset / 10000) +
          'ms.',
        Math.round(e.audioOffset / 10000 / 1000) + 's.',
        e,
      )
    } */

    // This event signals that word boundary is received. This indicates the audio boundary of each word.
    // The unit of e.audioOffset is tick (1 tick = 100 nanoseconds), divide by 10,000 to convert to milliseconds.
    /* synthesizer.wordBoundary = function (s, e) {
      console.log(
        '(WordBoundary), Text: ' +
          e.text +
          ', Audio offset: ' +
          Math.round(e.audioOffset / 10000) +
          'ms.',
        Math.round(e.audioOffset / 10000 / 1000) + 's.',
      )
    } */

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

    /**
   * voices:
      de-DE-KatjaNeural
      de-DE-ConradNeural
      de-DE-AmalaNeural
      de-DE-ChristophNeural
      de-DE-BerndNeural
      de-DE-ElkeNeural
      de-DE-GiselaNeural
      de-DE-KasperNeural xx
      de-DE-KillianNeural
      de-DE-KlarissaNeural
      de-DE-KlausNeural
      de-DE-LouisaNeural
      de-DE-MajaNeural
      de-DE-RalfNeural
      de-DE-TanjaNeural
   */

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
