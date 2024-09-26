import { addTtsNotice } from '../textParser/huebschFormatter.js'

describe('format credits', () => {
  test('should add notice about synthetic voice and remove date', async () => {
    const input = 'Von Markus Schärli, 25.09.2024'
    const output = addTtsNotice(input)
    expect(output).toEqual(
      'Sie hören einen automatisch vorgelesenen Beitrag von Markus Schärli',
    )
  })

  test('should handle multiple authors', async () => {
    const input =
      'Von Lesha Berezovskiy (Text und Bilder) und Annette Keller (Übersetzung), 18.09.2024'
    const output = addTtsNotice(input)
    expect(output).toEqual(
      'Sie hören einen automatisch vorgelesenen Beitrag von Lesha Berezovskiy und Annette Keller',
    )
  })

  test('should filter out illustrators etc.', async () => {
    const input =
      'Von Philipp Albrecht, Timo Kollbrunner (Text) und Lina Müller (Illustration), 23.09.2024'
    const output = addTtsNotice(input)
    expect(output).toEqual(
      'Sie hören einen automatisch vorgelesenen Beitrag von Philipp Albrecht und Timo Kollbrunner',
    )
  })

  test('should handle interview, kommentar, etc.', async () => {
    const input = 'Ein Kommentar von Priscilla Imboden, 23.09.2024'
    const output = addTtsNotice(input)
    expect(output).toEqual(
      'Sie hören einen automatisch vorgelesenen Beitrag von Priscilla Imboden',
    )
  })

  test('should handle faulty capitalisation', async () => {
    const input = 'von Markus Schärli, 25.09.2024'
    const output = addTtsNotice(input)
    expect(output).toEqual(
      'Sie hören einen automatisch vorgelesenen Beitrag von Markus Schärli',
    )
  })

  test('should handle missing comma', async () => {
    const input = 'Von Markus Schärli 25.09.2024'
    const output = addTtsNotice(input)
    expect(output).toEqual(
      'Sie hören einen automatisch vorgelesenen Beitrag von Markus Schärli',
    )
  })

  test('should fall back on the original credit string if it is unparsable', async () => {
    const input = "C'est Anna qui a écrit ça."
    const output = addTtsNotice(input)
    expect(output).toEqual(
      "Sie hören einen automatisch vorgelesenen Beitrag. C'est Anna qui a écrit ça.",
    )
  })
})
