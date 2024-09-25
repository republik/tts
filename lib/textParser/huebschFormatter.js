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
  return text
}

const formatCredits = (paragraph) => ({
  ...paragraph,
  content: [
    {
      ...paragraph.content,
      text: addTtsNotice(paragraph.text),
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
    : node.type === 'lead'
    ? withPauseAfter(paragraph)
    : node.type === 'credits'
    ? formatCredits(paragraph)
    : paragraph
}
