import { describe, expect, it } from 'vitest'
import { loadThemePreference, saveThemePreference, type PreferenceStorage } from './prefs'

function createStorage(initial: string | null = null): PreferenceStorage {
  let value = initial
  return {
    getItem: () => value,
    setItem: (_key, nextValue) => { value = nextValue },
  }
}

describe('theme preferences', () => {
  it('defaults to system', () => {
    expect(loadThemePreference(createStorage())).toBe('system')
  })

  it('loads only supported preferences', () => {
    expect(loadThemePreference(createStorage('{"theme":"dark"}'))).toBe('dark')
    expect(loadThemePreference(createStorage('{"theme":"sepia"}'))).toBe('system')
    expect(loadThemePreference(createStorage('{bad json'))).toBe('system')
  })

  it('saves the preference separately from app data', () => {
    const storage = createStorage()
    saveThemePreference('light', storage)
    expect(loadThemePreference(storage)).toBe('light')
  })
})
