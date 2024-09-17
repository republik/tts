import { getSpeakableText } from '../textParser/index.js'

const simple_document = {
  id: '123',
  type: 'mdast',
  repoId: 'simple-doc',
  content: {
    children: [
      {
        identifier: 'FIGURE',
        data: {},
        children: [
          {
            children: [
              {
                alt: null,
                type: 'image',
                title: null,
                url: 'http://url-image.com',
              },
            ],
            type: 'paragraph',
          },
        ],
        type: 'zone',
      },
      {
        identifier: 'TITLE',
        data: {},
        children: [
          {
            depth: 1,
            children: [
              {
                type: 'text',
                value: 'Turbulenter Test Beitrag',
              },
            ],
            type: 'heading',
          },
          {
            depth: 2,
            children: [],
            type: 'heading',
          },
          {
            children: [
              {
                type: 'text',
                value: 'Lead',
              },
            ],
            type: 'paragraph',
          },
          {
            children: [
              {
                type: 'text',
                value: 'Von ',
              },
              {
                children: [
                  {
                    type: 'text',
                    value: 'Tobias Maier',
                  },
                ],
                type: 'link',
                title: null,
                url: '/~maier',
              },
              {
                type: 'text',
                value: ', 20.01.2024',
              },
            ],
            type: 'paragraph',
          },
        ],
        type: 'zone',
      },
      {
        identifier: 'CENTER',
        data: {},
        children: [
          {
            children: [
              {
                type: 'text',
                value: 'Dies ist ein Test & auf dem Cover, das ist Joschi.',
              },
            ],
            type: 'paragraph',
          },
        ],
        type: 'zone',
      },
    ],
    meta: {
      template: 'article',
      repoId: 'simple-doc',
      publishDate: '2024-01-20T10:49:28.062Z',
      lastPublishedAt: '2024-01-20T10:49:28.062Z',
      description: 'Lead',
      title: 'Turbulenter Test Beitrag',
      feed: true,
      path: '/2024/01/20/simple-doc',
      credits: {
        children: [
          {
            type: 'text',
            value: 'Von ',
          },
          {
            children: [
              {
                type: 'text',
                value: 'Tobias Maier',
              },
            ],
            type: 'link',
            title: null,
            url: '/~tm',
          },
          {
            type: 'text',
            value: ', 20.01.2024',
          },
        ],
        type: 'mdast',
      },
      creditsString: 'Von Tobias Maier, 20.01.2024',
      autoSlug: true,
      contributors: [
        {
          kind: 'Text',
          name: 'Tobias Maier',
          userId: '123414',
        },
      ],
      slug: 'simple-doc',
      gallery: true,
    },
    type: 'root',
  },
}

const simple_huebsch_content = [
  {
    type: 'paragraph',
    attrs: {
      voiceName: 'Default voice',
      proofreadPromptName: 'Republik Sprechkorrektorat',
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
      proofreadPromptName: 'Republik Sprechkorrektorat',
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
      proofreadPromptName: 'Republik Sprechkorrektorat',
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
      proofreadPromptName: 'Republik Sprechkorrektorat',
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
      proofreadPromptName: 'Republik Sprechkorrektorat',
    },
    content: [
      {
        type: 'text',
        text: 'Dies ist ein Test & auf dem Cover, das ist Joschi.',
      },
    ],
  },
]

describe('text processing', () => {
  test('parser should convert mdast into huebsch format', async () => {
    const speakableText = getSpeakableText(simple_document.content)
    expect(speakableText).toEqual(simple_huebsch_content)
  })
})
