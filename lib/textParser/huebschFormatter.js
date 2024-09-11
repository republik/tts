// TODO: this will become simpler with the Huebsch API (no more xml)
export const convertToXml = (voice, meta) => (token) => {
  const { type, node, caesura } = token
  const { name, rate = 1, pitch = '+0' } = voice

  switch (type) {
    case 'preface':
      return {
        ...token,
        ssml: `<voice name="${name}"><prosody rate="${rate}" pitch="${pitch}st">${node}</prosody><break time="1s" /></voice>`,
      }
    case 'lead':
      return {
        ...token,
        ssml: `<voice name="${name}"><prosody rate="${rate}" pitch="${pitch}st">${node}</prosody><break time="1s" /></voice>`,
      }
    case 'title': {
      const title = [meta?.format?.meta?.title, node].filter(Boolean).join(': ')
      return {
        ...token,
        ssml: `<voice name="${name}"><prosody rate="${rate}" pitch="${pitch}st">${title}</prosody></voice>`,
      }
    }
    case 'credits':
      return {
        ...token,
        ssml: `<voice name="${name}"><prosody rate="${rate}" pitch="${pitch}st">${node}</prosody><break time="1.5s" /></voice>`,
      }
    case 'subtitle':
      return {
        ...token,
        ssml: `<voice name="${name}"><break time="1s" /><prosody rate="${rate}" pitch="${pitch}st">${node}</prosody><break time="1.2s" /></voice>`,
      }
    // @TODO: Parse credits a little better?
    default: {
      return {
        ...token,
        ssml: [
          `<voice name="${name}">`,
          `<prosody rate="${rate}" pitch="${pitch}st">${node}</prosody>`,
          !!caesura?.after && `<break time="1.5s" />`,
          `</voice>`,
        ]
          .filter(Boolean)
          .join(''),
      }
    }
  }
}
