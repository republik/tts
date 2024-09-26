import _debug from 'debug'

const pause = (duration = 1) => ({
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
  const authorsRe = /.*[vV]on (.+) [0-9]{2}.[0-9]{2}.20[0-9]{2}/
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
  const debug = _debug('speakableText:addTtsNotice')
  try {
    const authorsText = getAuthors(text)
    const authors = splitAuthors(authorsText)
      .map(getAuthorRole)
      .filter(keepTextAuthors)
      .map((author) => author.name)
      .map((author) => author.replace(/([,]$)/g, ''))

    const ttsPreface = 'Sie hören einen automatisch vorgelesenen Beitrag von '
    return ttsPreface + makeCommaSeparatedString(authors)
  } catch (e) {
    debug('error parsing credits, falling back on original text: %o', e)
    return 'Sie hören einen automatisch vorgelesenen Beitrag. ' + text
  }
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
  pause(1.5),
]

export const addAudioFrame = (text) => [jingle, ...text, stinger]

const withPauseBefore = (paragraph, pauseDuration) => [
  pause(pauseDuration),
  paragraph,
]

const withPauseAfter = (paragraph, pauseDuration) => [
  paragraph,
  pause(pauseDuration),
]

const formatParagraph = (voice, text) => ({
  type: 'paragraph',
  attrs: {
    voiceName: voice,
    proofreadPromptName: 'Republik Sprechkorrektorat',
  },
  content: [
    {
      type: 'text',
      text,
    },
  ],
})

export const formatForHuebsch = (voice) => (node) => {
  const { text, caesura } = node

  const paragraph = formatParagraph(voice, text)

  return node.type === 'subtitle'
    ? withPauseAfter(paragraph, 1.2)
    : node.type === 'title'
    ? withPauseAfter(paragraph, 1.5)
    : node.type === 'lead'
    ? withPauseAfter(paragraph, 1)
    : node.type === 'credits'
    ? formatCredits(paragraph)
    : caesura
    ? withPauseAfter(paragraph, 1.5)
    : paragraph
}
