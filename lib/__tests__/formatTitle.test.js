import { addFullStop } from '../textParser/huebschFormatter.js'

describe('format title', () => {
  test('should add a full stop at the end', async () => {
    const input = 'Chronologie der Schweizer Medienkonzentration'
    const output = addFullStop(input)
    expect(output).toEqual('Chronologie der Schweizer Medienkonzentration.')
  })

  test('should not add full stop when the title has punctuation at the end', async () => {
    const input1 = 'Raus! Raus! Raus!'
    const output1 = addFullStop(input1)
    expect(output1).toEqual('Raus! Raus! Raus!')

    const input2 = 'Stell dir vor, es ist Klimastreik und …'
    const output2 = addFullStop(input2)
    expect(output2).toEqual('Stell dir vor, es ist Klimastreik und …')

    const input3 = 'Hopfen und Malz verloren?'
    const output3 = addFullStop(input3)
    expect(output3).toEqual('Hopfen und Malz verloren?')
  })

  test('should add a full stop at the end – punctuation present in the middle of the title', async () => {
    const input =
      'Das ist rechtlich heikel und nützt wenig – eine Analyse. Zudem: Das Briefing aus Bern'
    const output = addFullStop(input)
    expect(output).toEqual(
      'Das ist rechtlich heikel und nützt wenig – eine Analyse. Zudem: Das Briefing aus Bern.',
    )
  })
})
