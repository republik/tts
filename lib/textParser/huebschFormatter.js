import _debug from 'debug'
import { TextParsingError } from './index.js'

// please note: this is sometimes used in a sentence, sometimes as standalone
// hence the absence of punctuation at the end.
const TTS_NOTICE = 'Sie hören einen automatisch vorgelesenen Beitrag'

const pause = (duration = 1.4) => ({
  type: 'pause',
  attrs: {
    pause: duration,
  },
})

const jingle = {
  type: 'sound',
  attrs: {
    soundName: 'Republik: Jingle',
  },
}

const stinger = {
  type: 'sound',
  attrs: {
    soundName: 'Republik: Stinger',
  },
}

// removes anything before von and date
const getAuthors = (byline) => {
  const authorsRe = /^.*?[vV]on (.+?) [0-9]{2}.[0-9]{2}.20[0-9]{2}.*/
  return byline.match(authorsRe)[1]
}

// split the list by "," or "und" (ignoring the chars in parentheses)
const splitAuthors = (text) => {
  const separator = /(?:, (?![^(]*\)))|(?: und (?![^(]*\)))/
  return text.split(separator)
}

const getAuthorRole = (author) => {
  const roleRe = /(.*) \(([^()]*)\)/
  const authorRole = author.match(roleRe)
  if (!authorRole?.length || authorRole.length > 3) {
    return {
      name: author,
      role: 'text',
    }
  }
  return {
    name: authorRole[1],
    role: authorRole[2].toLowerCase(),
  }
}

const keepTextAuthors = (author) => /text|übersetzung/.test(author?.role)

const makeCommaSeparatedString = (array) => {
  const listStart = array.slice(0, -1).join(', ')
  const listEnd = array.slice(-1)
  const conjunction = array.length <= 1 ? '' : ' und '

  return [listStart, listEnd].join(conjunction)
}

// TODO: for the love of all that's holy, we need to parse the credits
//  in the backend PROPERLY and store then in the DB PROPERLY
//  (mea culpa – but hey, I wrote tests)
export const addTtsNotice = (text) => {
  if (!text) {
    return `${TTS_NOTICE}.`
  }
  const debug = _debug('speakableText:addTtsNotice')
  try {
    const authorsText = getAuthors(text)
    const authors = splitAuthors(authorsText)
      .map(getAuthorRole)
      .filter(keepTextAuthors)
      .map((author) => author.name)
      .map((author) => author.replace(/([,]$)/g, ''))

    return `${TTS_NOTICE} von ${makeCommaSeparatedString(authors)}.`
  } catch (e) {
    debug('error parsing credits, falling back on original text: %o', e)
    return `${TTS_NOTICE}. ${text}`
  }
}

// improves the pronunciation of the title
export const addFullStop = (text) => {
  if (!text) return
  const punctuatedEnd = /.*[….?!:;]$/
  return text.match(punctuatedEnd) ? text : text + '.'
}

const formatCredits = (paragraph) => [
  {
    ...paragraph,
    content: [
      {
        type: 'text',
        text: addTtsNotice(paragraph.content[0].text),
      },
    ],
  },
  pause(),
]

export const addAudioFrame = (text) => {
  return [jingle, ...text, stinger]
}

const withPause = (paragraph, pauseDuration1, pauseDuration2) =>
  [
    pauseDuration1 && pause(pauseDuration1),
    paragraph,
    pauseDuration2 && pause(pauseDuration2),
  ].filter(Boolean)

const formatParagraph = (voice, text, preface) => {
  const processedText = addFullStop(text)
  if (!voice) {
    throw new TextParsingError('no synthetic voice defined for:', { text })
  }
  return {
    type: 'paragraph',
    attrs: {
      voiceName: voice,
      proofreadPromptName: 'Republik Sprechkorrektorat',
    },
    content: [
      {
        type: 'text',
        text: preface ? `${preface} ${processedText}` : processedText,
      },
    ],
  }
}

export const formatForHuebsch = (defaultVoice, secondVoice) => (node) => {
  const { text, preface, type, caesura, altVoice } = node

  const paragraph = formatParagraph(
    altVoice ? secondVoice : defaultVoice,
    text,
    preface,
  )

  return type === 'subtitle'
    ? withPause(paragraph, 1.4, 1)
    : type === 'credits'
    ? formatCredits(paragraph)
    : ['lead', 'title'].includes(type)
    ? withPause(paragraph, 0, 1.4)
    : withPause(paragraph, caesura?.before && 1.4, caesura?.after && 1.4)
}
