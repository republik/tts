export const formatForHuebsch = (voice, meta) => (node) => {
  const { text } = node

  return {
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
  }
}
