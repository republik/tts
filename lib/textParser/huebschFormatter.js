export const formatForHuebsch = (voice) => (node) => {
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
