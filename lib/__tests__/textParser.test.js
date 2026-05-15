import { getSpeakableText } from '../textParser/index.js'

describe('text processing: parser should', () => {
  test('convert simple mdast into huebsch format', async () => {
    const speakableText = getSpeakableText(simple_document.content)
    expect(speakableText).toEqual(simple_huebsch_content)
  })

  test('convert mdast with list/quote into huebsch format', async () => {
    const speakableText = getSpeakableText(tricky_document.content)
    expect(speakableText).toEqual(tricky_huebsch_content)
  })

  test('handle embedded comments', async () => {
    const speakableText = getSpeakableText(embedCommentInput)
    expect(speakableText).toEqual(embedCommentOutput)
  })

  test('convert newsletter mdast into huebsch format', async () => {
    const speakableText = getSpeakableText(newsletterInput)
    expect(speakableText).toEqual(newsletterOutput)
  })
})

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
          {
            type: 'heading',
            depth: 2,
            children: [
              {
                type: 'text',
                value: 'Und dann passiert was',
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                value:
                  'Er hat den Knaben wohl in dem Arm, er faßt ihn sicher, er hält ihn warm.',
              },
            ],
          },
        ],
        type: 'zone',
      },
    ],
    meta: {
      syntheticVoice: 'test voice',
    },
    type: 'root',
  },
}

const simple_huebsch_content = [
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
      meta: {
        role: 'lead',
      },
    },
    content: [
      {
        type: 'text',
        text: 'Lead.',
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
      meta: {
        role: 'title',
      },
    },
    content: [
      {
        type: 'text',
        text: 'Turbulenter Test Beitrag.',
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
      meta: {
        role: 'credits',
        authors: ['Tobias Maier'],
      },
    },
    content: [
      {
        type: 'text',
        text: 'Ein Beitrag von Tobias Maier, vorgelesen von einer synthetischen Stimme.',
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
      meta: {
        role: 'paragraph',
      },
    },
    content: [
      {
        type: 'text',
        text: 'Dies ist ein Test & auf dem Cover, das ist Joschi.',
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
      meta: {
        role: 'subtitle',
      },
    },
    content: [
      {
        type: 'text',
        text: 'Und dann passiert was.',
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
      meta: {
        role: 'paragraph',
      },
    },
    content: [
      {
        type: 'text',
        text: 'Er hat den Knaben wohl in dem Arm, er faßt ihn sicher, er hält ihn warm.',
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

const tricky_document = {
  id: '123',
  type: 'mdast',
  repoId: 'tricky-doc',
  content: {
    children: [
      {
        identifier: 'TITLE',
        data: {},
        children: [
          {
            depth: 1,
            children: [
              {
                type: 'text',
                value: 'Ich teste den Parser',
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
                value: 'Ich verwende Listen, Aufzählungen, Zitate, etc.',
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
                    value: 'Anna Traussnig',
                  },
                ],
                type: 'link',
                title: null,
                url: '/~7136e370-112f-4353-bf49-ae06b8985f36',
              },
              {
                type: 'text',
                value: ', 26.09.2024',
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
                value: 'Ich habe 2 Sache zu sagen:',
              },
            ],
            type: 'paragraph',
          },
          {
            ordered: true,
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        type: 'text',
                        value: 'Nur die ergangenen Gedanken haben Wert.',
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
                loose: false,
                checked: null,
                type: 'listItem',
              },
              {
                children: [
                  {
                    children: [
                      {
                        type: 'text',
                        value: 'Wer ein Warum hat, dem ist kein Wie zu schwer.',
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
                loose: false,
                checked: null,
                type: 'listItem',
              },
            ],
            loose: false,
            start: 1,
            type: 'list',
          },
          {
            identifier: 'INTERVIEWANSWER',
            type: 'zone',
            data: {},
            children: [
              {
                children: [
                  {
                    type: 'text',
                    value: 'And another voice!',
                  },
                ],
                type: 'paragraph',
              },
            ],
          },
          {
            identifier: 'WEBONLY',
            type: 'zone',
            data: {},
            children: [
              {
                children: [
                  {
                    type: 'text',
                    value: 'Part only for web (kept by the parser).',
                  },
                ],
                type: 'paragraph',
              },
              {
                type: 'list',
                loose: true,
                ordered: false,
                start: 1,
                children: [
                  {
                    type: 'listItem',
                    loose: true,
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            type: 'text',
                            value: 'Item 1',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'listItem',
                    loose: true,
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            type: 'text',
                            value: 'Item 2',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            identifier: 'EMAILONLY',
            type: 'zone',
            data: {},
            children: [
              {
                children: [
                  {
                    type: 'text',
                    value: 'Part only for email (skipped by the parser).',
                  },
                ],
                type: 'paragraph',
              },
            ],
          },
          {
            identifier: 'BLOCKQUOTE',
            data: {},
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        type: 'text',
                        value:
                          'Die Hoffnung ist der Regenbogen über den herabstürzenden jähen Bach des Lebens.',
                      },
                    ],
                    type: 'paragraph',
                  },
                  {
                    children: [
                      {
                        type: 'text',
                        value: 'Und mehr.',
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
                type: 'blockquote',
              },
              {
                children: [
                  {
                    type: 'text',
                    value: 'F. Nietzsche',
                  },
                ],
                type: 'paragraph',
              },
            ],
            type: 'zone',
          },
          {
            children: [
              {
                type: 'text',
                value: 'Ich habe noch mehr.',
              },
            ],
            type: 'paragraph',
          },
          {
            identifier: 'BLOCKQUOTE',
            data: {},
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        type: 'text',
                        value:
                          'Die Hoffnung ist der Regenbogen über den herabstürzenden jähen Bach des Lebens.',
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
                type: 'blockquote',
              },
            ],
            type: 'zone',
          },
          {
            children: [
              {
                type: 'text',
                value: 'Und nichts anderes.',
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
      syntheticVoice2: 'second test voice',
    },
    type: 'root',
  },
}

const tricky_huebsch_content = [
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
      meta: {
        role: 'lead',
      },
    },
    content: [
      {
        type: 'text',
        text: 'Ich verwende Listen, Aufzählungen, Zitate, etc.',
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
      meta: {
        role: 'title',
      },
    },
    content: [
      {
        type: 'text',
        text: 'Ich teste den Parser.',
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
      meta: {
        role: 'credits',
        authors: ['Anna Traussnig'],
      },
    },
    content: [
      {
        type: 'text',
        text: 'Ein Beitrag von Anna Traussnig, vorgelesen von einer synthetischen Stimme.',
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
      meta: {
        role: 'paragraph',
      },
    },
    content: [
      {
        type: 'text',
        text: 'Ich habe 2 Sache zu sagen:',
      },
    ],
  },
  {
    type: 'paragraph',
    attrs: {
      voiceName: 'test voice',
      proofreadPromptName: 'Republik Sprechkorrektorat',
      meta: {
        role: 'list',
      },
    },
    content: [
      {
        type: 'text',
        text: '1. Punkt: Nur die ergangenen Gedanken haben Wert.',
      },
    ],
  },
  {
    type: 'paragraph',
    attrs: {
      voiceName: 'test voice',
      proofreadPromptName: 'Republik Sprechkorrektorat',
      meta: {
        role: 'list',
      },
    },
    content: [
      {
        type: 'text',
        text: '2. Punkt: Wer ein Warum hat, dem ist kein Wie zu schwer.',
      },
    ],
  },
  {
    type: 'paragraph',
    attrs: {
      voiceName: 'second test voice',
      proofreadPromptName: 'Republik Sprechkorrektorat',
      meta: {
        role: 'interview answer',
      },
    },
    content: [
      {
        type: 'text',
        text: 'And another voice!',
      },
    ],
  },
  {
    type: 'paragraph',
    attrs: {
      voiceName: 'test voice',
      proofreadPromptName: 'Republik Sprechkorrektorat',
      meta: {
        role: 'paragraph',
      },
    },
    content: [
      {
        type: 'text',
        text: 'Part only for web (kept by the parser).',
      },
    ],
  },
  {
    type: 'paragraph',
    attrs: {
      voiceName: 'test voice',
      proofreadPromptName: 'Republik Sprechkorrektorat',
      meta: {
        role: 'list',
      },
    },
    content: [
      {
        type: 'text',
        text: 'Item 1.',
      },
    ],
  },
  {
    type: 'paragraph',
    attrs: {
      voiceName: 'test voice',
      proofreadPromptName: 'Republik Sprechkorrektorat',
      meta: {
        role: 'list',
      },
    },
    content: [
      {
        type: 'text',
        text: 'Item 2.',
      },
    ],
  },
  {
    type: 'paragraph',
    attrs: {
      voiceName: 'test voice',
      proofreadPromptName: 'Republik Sprechkorrektorat',
      meta: {
        role: 'quote',
      },
    },
    content: [
      {
        type: 'text',
        text: 'Zitat: Die Hoffnung ist der Regenbogen über den herabstürzenden jähen Bach des Lebens.',
      },
    ],
  },
  {
    type: 'paragraph',
    attrs: {
      voiceName: 'test voice',
      proofreadPromptName: 'Republik Sprechkorrektorat',
      meta: {
        role: 'quote',
      },
    },
    content: [
      {
        type: 'text',
        text: 'Und mehr.',
      },
    ],
  },
  {
    type: 'paragraph',
    attrs: {
      voiceName: 'test voice',
      proofreadPromptName: 'Republik Sprechkorrektorat',
      meta: {
        role: 'quote',
      },
    },
    content: [
      {
        type: 'text',
        text: 'F. Nietzsche.',
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
      meta: {
        role: 'paragraph',
      },
    },
    content: [
      {
        type: 'text',
        text: 'Ich habe noch mehr.',
      },
    ],
  },
  {
    type: 'paragraph',
    attrs: {
      voiceName: 'test voice',
      proofreadPromptName: 'Republik Sprechkorrektorat',
      meta: {
        role: 'quote',
      },
    },
    content: [
      {
        type: 'text',
        text: 'Zitat: Die Hoffnung ist der Regenbogen über den herabstürzenden jähen Bach des Lebens.',
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
      meta: {
        role: 'paragraph',
      },
    },
    content: [
      {
        type: 'text',
        text: 'Und nichts anderes.',
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

const embedCommentInput = {
  children: [
    {
      identifier: 'TITLE',
      data: {},
      children: [
        {
          depth: 1,
          children: [
            {
              type: 'text',
              value: 'Mein mini Beitrag',
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
              value: 'Klein aber fein',
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
                  value: 'Anna Traussnig',
                },
              ],
              type: 'link',
              title: null,
              url: '/~7136e370-112f-4353-bf49-ae06b8985f36',
            },
            {
              type: 'text',
              value: ', 01.10.2024',
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
              children: [
                {
                  type: 'text',
                  value: 'Hallo!',
                },
              ],
              type: 'strong',
            },
          ],
          type: 'paragraph',
        },
        {
          identifier: 'EMBEDCOMMENT',
          data: {
            createdAt: '2024-10-02T14:30:01.470Z',
            __typename: 'Comment',
            parentIds: [],
            id: '296b57cb-51eb-4899-bda0-ef4432cb76d6',
            discussion: {
              path: '/2024/09/26/ich-teste-den-parser',
              __typename: 'Discussion',
              id: '42f64ae9-27ea-40ff-835b-94d68a4c27c9',
              title: 'Ich teste den Parser',
            },
            content: {
              children: [
                {
                  children: [
                    {
                      type: 'text',
                      value:
                        '(...) Das war das beste Artikel des Jahres! (...) Danke dafür',
                    },
                  ],
                  type: 'paragraph',
                },
              ],
              meta: {},
              type: 'root',
            },
            tags: [],
            updatedAt: '2024-10-02T14:30:01.470Z',
          },
          children: [
            {
              children: [
                {
                  children: [
                    {
                      type: 'text',
                      value:
                        'http://localhost:3010/dialog?t=article&id=42f64ae9-27ea-40ff-835b-94d68a4c27c9&focus=296b57cb-51eb-4899-bda0-ef4432cb76d6',
                    },
                  ],
                  type: 'link',
                  title: null,
                  url: 'http://localhost:3010/dialog?t=article&id=42f64ae9-27ea-40ff-835b-94d68a4c27c9&focus=296b57cb-51eb-4899-bda0-ef4432cb76d6',
                },
              ],
              type: 'paragraph',
            },
          ],
          type: 'zone',
        },
        {
          identifier: 'EMBEDCOMMENT',
          data: {
            createdAt: '2024-10-02T15:10:50.040Z',
            __typename: 'Comment',
            parentIds: [],
            id: '9f18223b-4b6f-410c-b3b1-668e95415857',
            discussion: {
              path: '/2024/09/26/ich-teste-den-parser',
              __typename: 'Discussion',
              id: '42f64ae9-27ea-40ff-835b-94d68a4c27c9',
              title: 'Ich teste den Parser',
            },
            content: {
              children: [
                {
                  children: [
                    {
                      type: 'text',
                      value: 'Jetzt',
                    },
                  ],
                  type: 'paragraph',
                },
                {
                  children: [
                    {
                      type: 'text',
                      value: 'Und (...) dann',
                    },
                  ],
                  type: 'paragraph',
                },
              ],
              meta: {},
              type: 'root',
            },
            tags: [],
            updatedAt: '2024-10-02T15:11:00.627Z',
          },
          children: [
            {
              children: [
                {
                  children: [
                    {
                      type: 'text',
                      value:
                        'http://localhost:3010/dialog?t=article&id=42f64ae9-27ea-40ff-835b-94d68a4c27c9&focus=9f18223b-4b6f-410c-b3b1-668e95415857',
                    },
                  ],
                  type: 'link',
                  title: null,
                  url: 'http://localhost:3010/dialog?t=article&id=42f64ae9-27ea-40ff-835b-94d68a4c27c9&focus=9f18223b-4b6f-410c-b3b1-668e95415857',
                },
              ],
              type: 'paragraph',
            },
          ],
          type: 'zone',
        },
        {
          children: [
            {
              type: 'text',
              value: 'So gut.',
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

const embedCommentOutput = [
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
      meta: {
        role: 'lead',
      },
    },
    content: [
      {
        type: 'text',
        text: 'Klein aber fein.',
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
      meta: {
        role: 'title',
      },
    },
    content: [
      {
        type: 'text',
        text: 'Mein mini Beitrag.',
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
      meta: {
        role: 'credits',
        authors: ['Anna Traussnig'],
      },
    },
    content: [
      {
        type: 'text',
        text: 'Ein Beitrag von Anna Traussnig, vorgelesen von einer synthetischen Stimme.',
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
      meta: {
        role: 'paragraph',
      },
    },
    content: [
      {
        type: 'text',
        text: 'Hallo!',
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
      meta: {
        role: 'comment',
      },
    },
    content: [
      {
        type: 'text',
        text: 'Das war das beste Artikel des Jahres!  Danke dafür.',
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
      meta: {
        role: 'comment',
      },
    },
    content: [
      {
        type: 'text',
        text: 'Jetzt.',
      },
    ],
  },
  {
    type: 'paragraph',
    attrs: {
      voiceName: 'test voice',
      proofreadPromptName: 'Republik Sprechkorrektorat',
      meta: {
        role: 'comment',
      },
    },
    content: [
      {
        type: 'text',
        text: 'Und  dann.',
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
      meta: {
        role: 'paragraph',
      },
    },
    content: [
      {
        type: 'text',
        text: 'So gut.',
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

const newsletterInput = {
  children: [
    {
      type: 'zone',
      identifier: 'TITLE',
      data: {},
      children: [
        {
          type: 'heading',
          depth: 1,
          children: [
            {
              type: 'text',
              value: 'Wie Google seine Macht missbraucht – einmal mehr',
            },
          ],
        },
        {
          type: 'heading',
          depth: 2,
          children: [
            {
              type: 'text',
              value: '',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value:
                'Der amerikanische IT-Konzern schikaniert mit neuen Richtlinien die Open-Source-Community und datenschutzbewusste Internetnutzerinnen.',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'Von ',
            },
            {
              type: 'link',
              title: 'Adrienne Fichter',
              url: '/~6ae2733e-1562-47b3-881c-88e9d3d28da9',
              children: [
                {
                  type: 'text',
                  value: 'Adrienne Fichter',
                },
              ],
            },
            {
              type: 'text',
              value: ', 11.05.2026',
            },
          ],
        },
      ],
    },
    {
      type: 'zone',
      identifier: 'CENTER',
      children: [
        {
          type: 'zone',
          identifier: 'IF',
          data: {
            present: 'lastName',
          },
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  value: 'Guten Tag ',
                },
                {
                  type: 'span',
                  data: {
                    variable: 'firstName',
                  },
                  children: [],
                },
                {
                  type: 'text',
                  value: ' ',
                },
                {
                  type: 'span',
                  data: {
                    variable: 'lastName',
                  },
                  children: [],
                },
                {
                  type: 'text',
                  value: '',
                },
              ],
            },
            {
              type: 'zone',
              identifier: 'ELSE',
              data: {},
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      value: 'Guten Tag',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value:
                'Seit einigen Jahren habe ich ein Pixel-Smartphone, auf dem GrapheneOS installiert ist. Das ist ein datenschutzorientiertes und alternatives Android-Betriebssystem, das ohne vorinstallierte Google-Dienste auskommt. ',
            },
          ],
        },
        {
          type: 'zone',
          identifier: 'IF',
          data: {
            present: 'hasAccess',
          },
          children: [
            {
              type: 'zone',
              identifier: 'ELSE',
              data: {},
              children: [
                {
                  type: 'thematicBreak',
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      value: '📣 ',
                    },
                    {
                      type: 'strong',
                      children: [
                        {
                          type: 'text',
                          value:
                            'Dieser Newsletter ist ein kostenloser Service der Republik. Mehr als 35’000 Abonnentinnen sorgen dafür. Unterstützen Sie die Arbeit der Republik ebenfalls mit einer reduzierten Jahresmitgliedschaft.',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'zone',
                  identifier: 'BUTTON',
                  data: {
                    primary: true,
                  },
                  children: [
                    {
                      type: 'paragraph',
                      children: [
                        {
                          type: 'link',
                          url: 'https://shop.republik.ch/mitgliedschaft?promo_code=EINSTIEG&utm_medium=email&utm_source=newsletter&utm_campaign=einstiegsangebot&utm_content=tech-nl',
                          title: 'Mitgliedschaft für 222.-',
                          children: [
                            {
                              type: 'text',
                              value: 'Mitgliedschaft für 222.– statt 240.–',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'thematicBreak',
                },
              ],
            },
          ],
        },
        {
          type: 'zone',
          identifier: 'EMAILONLY',
          data: {},
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  value:
                    'Liebe Grüsse und bis bald. Bleiben Sie neugierig und kritisch!',
                },
              ],
            },
          ],
        },
        {
          type: 'zone',
          identifier: 'AUTHOR',
          children: [],
          data: {
            isLarge: false,
            authorId: '6ae2733e-1562-47b3-881c-88e9d3d28da9',
            greeting: 'Liebe Grüsse',
            resolvedAuthor: {
              name: 'Adrienne Fichter',
              slug: 'adriennefichter',
              portrait:
                'https://cdn.repub.ch/s3/republik-assets/portraits/a84b38bf6c2a711a4362e1e9d759416a.jpeg?size=5736x3816&resize=384x384&bw=1&format=auto',
              credentials: [
                {
                  isListed: true,
                  verified: true,
                  __typename: 'Credential',
                  description: 'Tech-Reporterin @ Republik',
                },
              ],
            },
          },
        },
        {
          type: 'zone',
          identifier: 'EMAILONLY',
          data: {},
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  value: '',
                },
              ],
            },
            {
              type: 'thematicBreak',
            },
          ],
        },
        {
          type: 'zone',
          identifier: 'EMAILONLY',
          data: {},
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'strong',
                  children: [
                    {
                      type: 'text',
                      value: 'CTRL',
                    },
                  ],
                },
                {
                  type: 'text',
                  value: ' – Technologie ist politisch. Wir schauen genau hin.',
                },
                {
                  type: 'break',
                },
                {
                  type: 'text',
                  value: '📄 ',
                },
                {
                  type: 'link',
                  title: 'CTRL',
                  url: 'https://github.com/republik/format-ctrl?autoSlug',
                  children: [
                    {
                      type: 'text',
                      value: 'Frühere Ausgaben des Newsletters',
                    },
                  ],
                },
                {
                  type: 'text',
                  value: '',
                },
              ],
            },
          ],
        },
        {
          type: 'zone',
          identifier: 'IF',
          data: {
            present: 'hasAccess',
          },
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  value:
                    'Dieser Newsletter kann auch ohne Abo gelesen werden. Wir freuen uns, wenn Sie ihn weiterempfehlen und damit Menschen auf die Republik aufmerksam machen. Teilen Sie ',
                },
                {
                  type: 'link',
                  title: 'CTRL',
                  url: 'https://github.com/republik/format-ctrl?autoSlug',
                  children: [
                    {
                      type: 'text',
                      value: 'republik.ch/ctrl',
                    },
                  ],
                },
                {
                  type: 'text',
                  value:
                    ' mit Freunden, auf Social Media, im Gruppenchat. Oder klicken Sie hier, um ',
                },
                {
                  type: 'link',
                  title: '',
                  url: 'mailto:?subject=Eine%20Empfehlung&body=Ich%20glaube%2C%20dieser%20Newsletter%20k%C3%B6nnte%20dir%20gefallen%3A%20%0Ahttps%3A%2F%2Fwww.republik.ch%2Fctrl%0A%0ACTRL%20%E2%80%93%20Technologie%20ist%20politisch.%20Wir%20schauen%20genau%20hin.',
                  children: [
                    {
                      type: 'text',
                      value: 'ein vorformuliertes E-Mail zu öffnen',
                    },
                  ],
                },
                {
                  type: 'text',
                  value: '.',
                },
              ],
            },
            {
              type: 'zone',
              identifier: 'ELSE',
              data: {},
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      value:
                        'Dieser Newsletter ist ein kostenloses Angebot der Republik. Sie lesen es dank der grosszügigen Unter­stützung unserer zahlenden Mitglieder. Die Republik ist ausschliesslich von ihren Leserinnen finanziert und damit komplett werbefrei und unabhängig. ',
                    },
                  ],
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      value:
                        'Die Republik ist ein digitales Magazin für Politik, Wirtschaft, Gesellschaft und Kultur, das Zusammenhänge offenlegt und den Mächtigen auf die Finger schaut. Ist Ihnen das wichtig? Dann kommen Sie an Bord und unterstützen Sie unsere Arbeit mit einem Monatsabonnement oder einer Jahresmitgliedschaft.',
                    },
                  ],
                },
                {
                  type: 'zone',
                  identifier: 'BUTTON',
                  data: {
                    block: true,
                    primary: true,
                  },
                  children: [
                    {
                      type: 'paragraph',
                      children: [
                        {
                          type: 'link',
                          url: 'https://shop.republik.ch/mitgliedschaft?promo_code=EINSTIEG&utm_medium=email&utm_source=newsletter&utm_campaign=einstiegsangebot&utm_content=tech-nl',
                          title: 'Jetzt Mitglied werden.',
                          children: [
                            {
                              type: 'text',
                              value: 'Jetzt Mitglied werden',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
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
      meta: {
        role: 'lead',
      },
    },
    content: [
      {
        type: 'text',
        text: 'Der amerikanische IT-Konzern schikaniert mit neuen Richtlinien die Open-Source-Community und datenschutzbewusste Internetnutzerinnen.',
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
      meta: {
        role: 'title',
      },
    },
    content: [
      {
        type: 'text',
        text: 'Wie Google seine Macht missbraucht – einmal mehr.',
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
      meta: {
        role: 'credits',
        authors: ['Adrienne Fichter'],
      },
    },
    content: [
      {
        type: 'text',
        text: 'Ein Beitrag von Adrienne Fichter, vorgelesen von einer synthetischen Stimme.',
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
      meta: {
        role: 'paragraph',
      },
    },
    content: [
      {
        type: 'text',
        text: 'Seit einigen Jahren habe ich ein Pixel-Smartphone, auf dem GrapheneOS installiert ist. Das ist ein datenschutzorientiertes und alternatives Android-Betriebssystem, das ohne vorinstallierte Google-Dienste auskommt.',
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
