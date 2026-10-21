import { describe, expect, it } from 'vitest'
import { greetings } from './greetings'

describe('greetings', () => {
  it('keeps the greeting languages in order', () => {
    expect(greetings).toEqual([
      { language: 'English', text: 'Hello, Michael' },
      { language: 'Spanish', text: 'Hola, Michael' },
    ])
  })
})
