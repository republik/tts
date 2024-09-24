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

const preface = {
  type: 'preface',
  text: 'Dieser Audio-Inhalt wurde digital erzeugt.',
}

export const addPreface = (text) => [preface, ...text]

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
    : node.type === 'credits'
    ? withPauseAfter(paragraph)
    : paragraph
}
