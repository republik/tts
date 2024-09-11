export const formatForHuebsch = (voice, meta) => (node) => {
  const { text } = node

  return {
    type: 'paragraph',
    attrs: {
      voiceName: voice,
      proofreadPromptName: 'Standard proofread',
    },
    content: [
      {
        type: 'text',
        text,
      },
    ],
  }
}
