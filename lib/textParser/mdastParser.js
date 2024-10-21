import { TextParsingError } from './index.js'
import _debug from 'debug'

// utils
const getBreadcrumb = ({ type, identifier, depth, index, ordered }) => ({
  ...(type && { type }),
  ...(identifier && { identifier }),
  ...(depth >= 0 && { depth }),
  ...(index >= 0 && { index }),
  ...(ordered >= 0 && { ordered }),
})

const walk = (node, path) =>
  node.children.map((node, index) => parseMdast(node, index, [...path]))

const unspeakable = (node) => ({
  unspeakable: true,
  node,
})

const root = {
  match: ({ type }) => type === 'root',
  tokenize: (node, path) =>
    walk(node, path)
      .flat()
      .sort(
        (a, b) => parseInt(a.sequence || 999) - parseInt(b.sequence || 999),
      ),
}

// speakables
const titleZone = {
  match: ({ type, identifier }) => type === 'zone' && identifier === 'TITLE',
  tokenize: walk,
}

const title = {
  match: ({ type, depth }, path) =>
    type === 'heading' &&
    depth === 1 &&
    titleZone.match(path.slice(-2, -1).pop()),
  tokenize: (node, path) => ({
    type: 'title',
    sequence: 300,
    text: walk(node, path).join(''),
  }),
}

const subject = {
  match: ({ type, depth }, path) =>
    type === 'heading' &&
    depth === 2 &&
    titleZone.match(path.slice(-2, -1).pop()),
  tokenize: unspeakable,
}

const lead = {
  match: ({ type }, path) =>
    type === 'paragraph' &&
    path.slice(-1).pop().index === 2 &&
    titleZone.match(path.slice(-2, -1).pop()),
  tokenize: (node, path) => ({
    type: 'lead',
    sequence: 200,
    text: walk(node, path).join(''),
  }),
}

const credits = {
  match: ({ type }, path) =>
    type === 'paragraph' &&
    path.slice(-1).pop().index === 3 &&
    titleZone.match(path.slice(-2, -1).pop()),
  tokenize: (node, path) => ({
    type: 'credits',
    sequence: 100,
    text: walk(node, path).join(''),
  }),
}

// @TODO: temporary, be more specificc
const unspeakableZone = {
  match: ({ type, identifier }) =>
    type === 'zone' &&
    [
      'AUTHOR',
      'NOTE',
      'DYNAMIC_COMPONENT',
      'INFOBOX',
      'SERIES_NAV',
      'ARTICLECOLLECTION',
      'FIGUREGROUP',
      'HTML',
      'BUTTON',
      'TEASER',
    ].includes(identifier),
  tokenize: unspeakable,
}

const centerZone = {
  match: ({ type, identifier }) => type === 'zone' && identifier === 'CENTER',
  tokenize: (node, path) => walk(node, path).flat(),
}

const subtitle = {
  match: ({ type, depth }) => type === 'heading' && depth === 2,
  tokenize: (node, path) => ({
    type: 'subtitle',
    text: walk(node, path).join(''),
  }),
}

const quote = {
  match: ({ type, identifier }) => type === 'zone' && identifier === 'QUOTE',
  tokenize: (node, path) => {
    const nodes = walk(node, path)
      .flat()
      .filter((node) => !!node.text)

    if (!nodes.length) {
      return unspeakable(node)
    }

    // first node gets a caesura, last node gets a preface
    return nodes.map((n, idx) => ({
      ...n,
      preface: idx === 0 && 'Zitat:',
      caesura: { after: idx === nodes.length - 1 },
    }))
  },
}

const blockQuote = {
  match: ({ type, identifier }) =>
    type === 'zone' && identifier === 'BLOCKQUOTE',
  tokenize: quote.tokenize,
}

const list = {
  match: ({ type }) => type === 'list',
  tokenize: (node, path) => walk(node, path).flat(),
}

const listItemOrdered = {
  match: ({ type }, path) => {
    const parent = path.slice(-2, -1).pop()

    return type === 'listItem' && list.match(parent) && parent?.ordered === true
  },
  tokenize: (node, path) => {
    const nodes = walk(node, path).flat()
    return [
      {
        ...nodes[0],
        preface: `${path.slice(-1).pop().index + 1}. Punkt:`,
      },
      ...nodes.slice(1, -1),
    ]
  },
}

const listItemParagraph = {
  match: ({ type }, path) =>
    type === 'paragraph' && path.slice(-2, -1).pop()?.type === 'listItem',
  tokenize: (node, path) => ({
    type: 'paragraph',
    text: walk(node, path).join(''),
  }),
}

// @TODO: FIGURE
// Dedicated wording to figure at beginning?
const figure = {
  match: ({ type, identifier }) => type === 'zone' && identifier === 'FIGURE',
  tokenize: unspeakable,
}

// @TODO: CHART
const chart = {
  match: ({ type, identifier }) => type === 'zone' && identifier === 'CHART',
  tokenize: unspeakable,
}

const ifClause = {
  match: ({ type, identifier }) => type === 'zone' && identifier === 'IF',
  tokenize: (node, path) => {
    const filterChildren =
      node.data?.present === 'hasAccess'
        ? (child) => child.identifier !== 'ELSE' // remove ELSE children
        : (child) => child.identifier === 'ELSE' // only keep ELSE children

    const children = node.children.filter(filterChildren)

    if (!children.length) {
      return unspeakable(node, path)
    }

    return walk({ ...node, children }, path).flat()
  },
}

const embedComment = {
  match: ({ type, identifier }) =>
    type === 'zone' && identifier === 'EMBEDCOMMENT',
  tokenize: (node, path) => {
    if (!node?.data?.content?.children?.length) {
      return unspeakable(node)
    }
    const nodes = node.data.content.children
      .map((node, index) => parseMdast(node, index, [...path]))
      .flat()
      .filter((node) => !!node.text)

    if (!nodes.length) {
      return unspeakable(node)
    }

    // first and last nodes gets a caesura
    return nodes.map((n, idx) => ({
      ...n,
      caesura: { before: idx === 0, after: idx === nodes.length - 1 },
    }))
  },
}

// @TODO: EMBEDTWITTER
const embedTwitter = {
  match: ({ type, identifier }) =>
    type === 'zone' && identifier === 'EMBEDTWITTER',
  tokenize: unspeakable,
}

// @TODO: EMBEDVIDEO
const embedVideo = {
  match: ({ type, identifier }) =>
    type === 'zone' && identifier === 'EMBEDVIDEO',
  tokenize: unspeakable,
}

// @TODO: Thematic Break
const thematicBreak = {
  match: ({ type }) => type === 'thematicBreak',
  tokenize: unspeakable,
}

const textBreak = {
  match: ({ type }) => type === 'break',
  tokenize: () => '\n',
}

const variable = {
  match: ({ type, data }) => type === 'span' && !!data?.variable,
  tokenize: walk,
}

const memo = {
  match: ({ type, data }) => type === 'span' && data?.type === 'MEMO',
  tokenize: walk,
}

const interviewAnswer = {
  match: ({ type, identifier }) =>
    type === 'zone' && identifier === 'INTERVIEWANSWER',
  tokenize: (node, path) => {
    const nodes = walk(node, path).flat()
    return nodes.map((n) => ({ ...n, altVoice: true }))
  },
}

const paragraph = {
  match: ({ type }) => type === 'paragraph',
  tokenize: (node, path) => {
    const text = walk(node, path).join('')

    // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Unicode_Property_Escapes#general_categories
    // \p{L} = All letters in a text (per unicode)
    const hasSpeakableCharacters =
      text.trim().replace(/[^\p{L}]/gu, '').length > 0

    if (!hasSpeakableCharacters) {
      return unspeakable(node)
    }

    return {
      type: 'paragraph',
      text,
    }
  },
}

// @TODO: Formatting (?)

const text = {
  match: ({ type }) => type === 'text',
  tokenize: (node) =>
    // 0x00AD = Soft Hyphen (SHY)
    // 0x2063 = Invisible Separator
    (node.value || node.alt || node.title)?.replace(/[\u00AD\u2063]/g, '') ||
    '',
}

const tokenizers = [
  root,
  titleZone,
  title,
  subject,
  lead,
  credits,
  unspeakableZone,
  centerZone,
  subtitle,
  quote,
  blockQuote,
  list,
  listItemOrdered,
  listItemParagraph,
  figure,
  chart,
  ifClause,
  embedComment,
  embedTwitter,
  embedVideo,
  thematicBreak,
  textBreak,
  variable,
  memo,
  paragraph,
  interviewAnswer,
  text,
]

export const parseMdast = (node, index = 0, path = []) => {
  const debug = _debug('speakables:parseMdast')
  path.push(getBreadcrumb({ ...node, index }))

  const tokenizer = tokenizers.find((token) => {
    return token.match(node, path)
  })

  if (tokenizer) {
    debug('tokenizer found %o', path)

    return tokenizer.tokenize(node, path)
  }

  // Fail only on ones with missing children
  if (
    !node.children?.length ||
    (node.data && !!Object.keys(node.data).length)
  ) {
    throw new TextParsingError('missing tokenizer', {
      'node.type': node.type,
      'node.identifier': node.identifier,
      'node.data': node.data,
      node,
      index,
      path,
    })
  }

  debug('tokenizer missing, but continuing %o', path)
  return walk(node, path)
}
