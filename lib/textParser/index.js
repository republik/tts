import _debug from 'debug'
import { tokenizeMdast } from './mdastTokenizer.js'
import { convertToXml } from './huebschFormatter.js'
import config from '../config.js'

export const voices = {
  alpha: {
    /* Best female voice */ name: 'de-DE-LouisaNeural',
    rate: 1.1,
    pitch: '-0.8',
  },
}

const removeUnspeakable = (token) => !token.unspeakable

const removeTextless = (token) => !!token.text

const trimText = (token) => ({ ...token, text: token.text.trim() })

const filterTokens = (tokens) => {
  const filtered = tokens.filter(removeUnspeakable).filter(removeTextless)

  if (!filtered.length) {
    throw new TextParsingError('no speakable text found', { tokens })
  }

  return filtered
}

const addPreface = (speakableText) => {
  return [
    {
      type: 'preface',
      text: config.preface,
    },
    ...speakableText,
  ]
}

export function TextParsingError(message, payload) {
  this.message = message
  this.name = 'TextParsingError'
  this.payload = payload
}

TextParsingError.prototype = Error.prototype

export const getSpeakableText = (content, voice = 'alpha', meta = false) => {
  const debug = _debug('speakableText:parse')
  debug('begin')
  try {
    const tokens = tokenizeMdast(content)
    const speakableText = filterTokens(tokens)
    return addPreface(speakableText)
      .map(trimText)
      .map(convertToXml(voices[voice], meta))
  } catch (e) {
    debug('failed: %s', e.message)
    throw e
  }
}
