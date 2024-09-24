import _debug from 'debug'
import { parseMdast } from './mdastParser.js'
import {
  addAudioFrame,
  addPreface,
  formatForHuebsch,
} from './huebschFormatter.js'

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

export function TextParsingError(message, payload) {
  this.message = message
  this.name = 'TextParsingError'
  this.payload = payload
}

TextParsingError.prototype = Error.prototype

export const getSpeakableText = (content, voice = 'huebsch-01150') => {
  const debug = _debug('speakableText:generate')
  debug('begin')
  try {
    const tokens = parseMdast(content)
    const speakableText = filterTokens(tokens).map(trimText)

    const formattedText = addPreface(speakableText).map(formatForHuebsch(voice))
    const outputText = addAudioFrame(formattedText).flat(1)

    debug('done! %o', outputText)
    return outputText
  } catch (e) {
    debug('failed: %s', e.message)
    throw e
  }
}
