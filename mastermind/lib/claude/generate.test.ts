import { extractJSON } from './generate'

describe('extractJSON', () => {
  it('returns plain text as-is', () => {
    const input = '{"title":"test","content":"hello"}'
    expect(extractJSON(input)).toBe(input)
  })

  it('extracts from ```json fence', () => {
    const input = '```json\n{"title":"test","content":"hello"}\n```'
    expect(extractJSON(input)).toBe('{"title":"test","content":"hello"}')
  })

  it('extracts from plain ``` fence', () => {
    const input = '```\n{"title":"test"}\n```'
    expect(extractJSON(input)).toBe('{"title":"test"}')
  })

  it('trims surrounding whitespace', () => {
    const input = '  {"title":"test"}  '
    expect(extractJSON(input)).toBe('{"title":"test"}')
  })
})
