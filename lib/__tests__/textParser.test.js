import { getSpeakableText } from '../textParser/index.js'
import { simple_document } from './data.js'

describe('mdast processing', () => {
  test('parser should work as expected', async () => {
    const speakableText = getSpeakableText(simple_document.content)
    expect(speakableText).toEqual([
      {
        type: 'paragraph',
        attrs: {
          voiceName: 'Default voice',
          proofreadPromptName: 'Standard proofread',
        },
        content: [
          {
            type: 'text',
            text: 'Sie hören diesen Beitrag mit Hilfe einer synthetischen Stimme.',
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          voiceName: 'Default voice',
          proofreadPromptName: 'Standard proofread',
        },
        content: [
          {
            type: 'text',
            text: 'Lead',
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          voiceName: 'Default voice',
          proofreadPromptName: 'Standard proofread',
        },
        content: [
          {
            type: 'text',
            text: 'Turbulenter Test Beitrag',
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          voiceName: 'Default voice',
          proofreadPromptName: 'Standard proofread',
        },
        content: [
          {
            type: 'text',
            text: 'Von Tobias Maier, 20.01.2024',
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          voiceName: 'Default voice',
          proofreadPromptName: 'Standard proofread',
        },
        content: [
          {
            type: 'text',
            text: 'Von Tobias Maier, 20.01.2024',
          },
        ],
      }
    ])
  })
})
