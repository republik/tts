import crypto from 'crypto'
import _debug from 'debug'

// utils
const getBreadcrumb = ({ type, identifier, depth, index }) => ({
  ...(type && { type }),
  ...(identifier && { identifier }),
  ...(depth >= 0 && { depth }),
  ...(index >= 0 && { index }),
})

const walk = (node, path) =>
  node.children.map((node, index) => tokenize(node, index, [...path]))

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
    sequence: 200,
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
    sequence: 100,
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
    sequence: 300,
    text: walk(node, path).join(''),
  }),
}

// @TODO: temporary, be more specificc
const unreadableZones = {
  match: ({ type, identifier }) =>
    type === 'zone' &&
    [
      'NOTE',
      'DYNAMIC_COMPONENT',
      'INFOBOX',
      'SERIES_NAV',
      'ARTICLECOLLECTION',
      'FIGUREGROUP',
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

const blockQuote = {
  match: ({ type, identifier }) =>
    type === 'zone' && identifier === 'BLOCKQUOTE',
  tokenize: (node, path) => [
    { type: 'paragraph', text: 'Zitat:' },
    ...walk(node, path).flat(),
    // @TODO: Problem, falls 2. Paragraph die Credits-Zeile ist.
    // { type: 'paragraph', text: 'Zitat Ende.' },
  ],
}

const list = {
  match: ({ type }) => type === 'list',
  tokenize: (node, path) => walk(node, path).flat(),
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

// @TODO: EMBEDCOMMENT
const embedComment = {
  match: ({ type, identifier }) =>
    type === 'zone' && identifier === 'EMBEDCOMMENT',
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

const paragraph = {
  match: ({ type }) => type === 'paragraph',
  tokenize: (node, path) => ({
    type: 'paragraph',
    text: walk(node, path).join(''),
  }),
}

// @TODO: Formatting (?)

const text = {
  match: ({ type }) => type === 'text',
  tokenize: (node) =>
    (node.value || node.alt || node.title).replace(/\u00AD/g, ''), // 0x00AD = Soft Hyphen (SHY)
}

const tokenizers = [
  root,
  title,
  subject,
  lead,
  credits,
  unreadableZones,
  centerZone,
  subtitle,
  blockQuote,
  list,
  listItemParagraph,
  figure,
  chart,
  embedComment,
  embedVideo,
  thematicBreak,
  textBreak,
  paragraph,
  text,
]

const tokenize = (node, index = 0, path = []) => {
  const debug = _debug('speakables:tokenize')
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
    debug('tokenizer missing %o', path)
    throw new Error('missing tokenizer')
  }

  debug('tokenizer missing, but continuing %o', path)
  return walk(node, path)
}

export const parse = (content) =>
  new Promise((resolve, reject) => {
    const debug = _debug('speakables:parse')
    debug('begin')
    try {
      const speakables = tokenize(content)
      debug('done')
      resolve(speakables)
    } catch (e) {
      debug('failed: %s', e.message)
      reject(e)
    }
  })

export const getSpeakablesHash = (speakables) =>
  crypto
    .createHash('sha256')
    .update(speakables.map((speakable) => speakable.node).join(''))
    .digest('hex')
