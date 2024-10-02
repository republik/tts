import { addTtsNotice } from '../textParser/huebschFormatter.js'
import { getSpeakableText } from '../textParser/index.js'

describe('format credits', () => {
  test('should add notice about synthetic voice and remove date', async () => {
    const input = 'Von Markus Schärli, 25.09.2024'
    const output = addTtsNotice(input)
    expect(output).toEqual(
      'Sie hören einen automatisch vorgelesenen Beitrag von Markus Schärli.',
    )
  })

  test('should handle multiple authors', async () => {
    const input =
      'Von Lesha Berezovskiy (Text und Bilder) und Annette Keller (Übersetzung), 18.09.2024'
    const output = addTtsNotice(input)
    expect(output).toEqual(
      'Sie hören einen automatisch vorgelesenen Beitrag von Lesha Berezovskiy und Annette Keller.',
    )
  })

  test('should filter out illustrators etc.', async () => {
    const input =
      'Von Philipp Albrecht, Timo Kollbrunner (Text) und Lina Müller (Illustration), 23.09.2024'
    const output = addTtsNotice(input)
    expect(output).toEqual(
      'Sie hören einen automatisch vorgelesenen Beitrag von Philipp Albrecht und Timo Kollbrunner.',
    )
  })

  test('should handle interview, kommentar, etc.', async () => {
    const input = 'Ein Kommentar von Priscilla Imboden, 23.09.2024'
    const output = addTtsNotice(input)
    expect(output).toEqual(
      'Sie hören einen automatisch vorgelesenen Beitrag von Priscilla Imboden.',
    )
  })

  test('should handle faulty capitalisation', async () => {
    const input = 'von Markus Schärli, 25.09.2024'
    const output = addTtsNotice(input)
    expect(output).toEqual(
      'Sie hören einen automatisch vorgelesenen Beitrag von Markus Schärli.',
    )
  })

  test('should handle missing comma', async () => {
    const input = 'Von Markus Schärli 25.09.2024'
    const output = addTtsNotice(input)
    expect(output).toEqual(
      'Sie hören einen automatisch vorgelesenen Beitrag von Markus Schärli.',
    )
  })

  test('should fall back on the original credit string if it is unparsable', async () => {
    const input = "C'est Anna qui a écrit ça."
    const output = addTtsNotice(input)
    expect(output).toEqual(
      "Sie hören einen automatisch vorgelesenen Beitrag. C'est Anna qui a écrit ça.",
    )
  })

  test('should handle updated texts', async () => {
    const input = 'Von David Bauer, 04.09.2024, letztes Update 01.10.2024'
    const output = addTtsNotice(input)
    expect(output).toEqual(
      'Sie hören einen automatisch vorgelesenen Beitrag von David Bauer.',
    )
  })

  test('should add preface even if there is no credit line', async () => {
    const speakableText = getSpeakableText(newsletterInput)
    expect(speakableText).toEqual(newsletterOutput)
  })
})

const newsletterInput = {
  children: [
    {
      identifier: 'CENTER',
      data: {},
      children: [
        {
          children: [
            {
              type: 'text',
              value: 'Guten Tag ',
            },
          ],
          type: 'paragraph',
        },
        {
          children: [
            {
              type: 'text',
              value: 'Das haben wir heute für Sie.',
            },
          ],
          type: 'paragraph',
        },
      ],
      type: 'zone',
    },
  ],
  meta: {
    syntheticVoice: 'test voice',
  },
  type: 'root',
}

const newsletterOutput = [
  {
    type: 'sound',
    attrs: {
      soundName: 'Republik: Jingle',
    },
  },
  {
    type: 'paragraph',
    attrs: {
      voiceName: 'test voice',
      proofreadPromptName: 'Republik Sprechkorrektorat',
    },
    content: [
      {
        type: 'text',
        text: 'Sie hören einen automatisch vorgelesenen Beitrag.',
      },
    ],
  },
  {
    type: 'pause',
    attrs: {
      pause: 1.4,
    },
  },
  {
    type: 'paragraph',
    attrs: {
      voiceName: 'test voice',
      proofreadPromptName: 'Republik Sprechkorrektorat',
    },
    content: [
      {
        type: 'text',
        text: 'Guten Tag.',
      },
    ],
  },
  {
    type: 'paragraph',
    attrs: {
      voiceName: 'test voice',
      proofreadPromptName: 'Republik Sprechkorrektorat',
    },
    content: [
      {
        type: 'text',
        text: 'Das haben wir heute für Sie.',
      },
    ],
  },
  {
    type: 'sound',
    attrs: {
      soundName: 'Republik: Stinger',
    },
  },
]
