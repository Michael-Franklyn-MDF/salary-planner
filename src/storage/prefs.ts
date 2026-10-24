export const PREFS_KEY = 'salary-planner-prefs'

export type ThemePreference = 'system' | 'light' | 'dark'

interface Preferences {
  theme: ThemePreference
}

export interface PreferenceStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

function defaultStorage(): PreferenceStorage {
  return window.localStorage
}

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark'
}

export function loadThemePreference(storage: PreferenceStorage = defaultStorage()): ThemePreference {
  try {
    const raw = storage.getItem(PREFS_KEY)
    if (!raw) return 'system'
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || !('theme' in parsed)) return 'system'
    return isThemePreference(parsed.theme) ? parsed.theme : 'system'
  } catch {
    return 'system'
  }
}

export function saveThemePreference(
  theme: ThemePreference,
  storage: PreferenceStorage = defaultStorage(),
): void {
  const preferences: Preferences = { theme }
  storage.setItem(PREFS_KEY, JSON.stringify(preferences))
}
