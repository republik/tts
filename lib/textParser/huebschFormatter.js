const pause = {
  type: 'pause',
  attrs: {
    pause: 1.5,
  },
}

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

export const addTtsNotice = (text) => {
  // removes anything before von and date
  const authorsRe = /.*[vV]on (.+) [0-9]{2}.[0-9]{2}.20[0-9]{2}/
  const authors = text.match(authorsRe)[1]
  // removes trailing comma and paratheses
  const sanitisedAuthors = authors
    .replace(/\([^()]*\)/g, '')
    .replace(/ {2,}/g, ' ')
    .replace(/([,]$)/g, '')
    .trim()
  const ttsPreface = 'Sie hören einen automatisch vorgelesenen Beitrag von '
  return ttsPreface + sanitisedAuthors
}

const formatCredits = (paragraph) => ({
  ...paragraph,
  content: [
    {
      type: 'text',
      text: addTtsNotice(paragraph.content[0].text),
    },
  ],
})

export const addAudioFrame = (text) => [jingle, ...text, stinger]

const withPauseBefore = (paragraph) => [pause, paragraph]

const withPauseAfter = (paragraph) => [paragraph, pause]

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
  const { text } = node

  const paragraph = formatParagraph(voice, text)

  return node.type === 'subtitle'
    ? withPauseBefore(paragraph)
    : node.type === 'title'
    ? withPauseAfter(paragraph)
    : node.type === 'credits'
    ? formatCredits(paragraph)
    : paragraph
}
