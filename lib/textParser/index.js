import _debug from 'debug'
import { parseMdast } from './mdastParser.js'
import { formatForHuebsch } from './huebschFormatter.js'
import config from '../config.js'

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

export const getSpeakableText = (
  content,
  // TODO: get voice name from metadata
  voice = 'Default voice',
  meta = false,
) => {
  const debug = _debug('speakableText:parse')
  debug('begin')
  try {
    const tokens = parseMdast(content)
    const speakableText = filterTokens(tokens)
    return addPreface(speakableText)
      .map(trimText)
      .map(formatForHuebsch(voice, meta))
  } catch (e) {
    debug('failed: %s', e.message)
    throw e
  }
}
