import { getSpeakableText } from '../textParser/index.js'

describe('text processing', () => {
  test('parser should convert simple mdast into huebsch format', async () => {
    const speakableText = getSpeakableText(simple_document.content)
    expect(speakableText).toEqual(simple_huebsch_content)
  })

  test('parser should convert mdast with list/quote into huebsch format', async () => {
    const speakableText = getSpeakableText(tricky_document.content)
    expect(speakableText).toEqual(tricky_huebsch_content)
  })

  test('parser should handle embedded comments', async () => {
    const speakableText = getSpeakableText(embedCommentInput)
    expect(speakableText).toEqual(embedCommentOutput)
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
    },
    content: [
      {
        type: 'text',
        text: 'Sie hören einen automatisch vorgelesenen Beitrag von Tobias Maier.',
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
                    value: 'Und auch noch ein Zitat. Warte mal.',
                  },
                ],
                type: 'paragraph',
              },
            ],
          },
          {
            identifier: 'QUOTE',
            data: {},
            children: [
              {
                identifier: 'FIGURE',
                data: {
                  excludeFromGallery: false,
                },
                children: [
                  {
                    children: [
                      {
                        alt: null,
                        type: 'image',
                        title: null,
                        url: 'test.com',
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
                    value:
                      '«Wenn ich als Einzelperson etwas ansprechen möchte, dann muss sich mein Gegenüber damit auseinander­setzen.»',
                  },
                ],
                type: 'paragraph',
              },
              {
                children: [
                  {
                    type: 'text',
                    value: 'Dominik Cavalli',
                  },
                ],
                type: 'paragraph',
              },
            ],
            type: 'zone',
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
    },
    content: [
      {
        type: 'text',
        text: 'Sie hören einen automatisch vorgelesenen Beitrag von Anna Traussnig.',
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
    },
    content: [
      {
        type: 'text',
        text: 'Und auch noch ein Zitat. Warte mal.',
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
        text: 'Zitat: Die Hoffnung ist der Regenbogen über den herabstürzenden jähen Bach des Lebens.',
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
        text: 'Und mehr.',
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
    },
    content: [
      {
        type: 'text',
        text: 'Sie hören einen automatisch vorgelesenen Beitrag von Anna Traussnig.',
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
