import { describe, expect, it } from 'vitest'
import { PRE_MIGRATION_BACKUP_KEY, STORAGE_KEY, loadState, saveState } from './storage'

class FakeStorage {
  private readonly values = new Map<string, string>()

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }
}

describe('storage', () => {
  it('loads missing data as a default state', () => {
    const storage = new FakeStorage()

    const result = loadState(storage)

    expect(result).toEqual({
      ok: true,
      state: expect.objectContaining({ schemaVersion: 3, income: 0 }),
    })
    expect(storage.getItem(PRE_MIGRATION_BACKUP_KEY)).toBeNull()
  })

  it('backs up raw legacy data once before migration', () => {
    const storage = new FakeStorage()
    const firstRaw = JSON.stringify({ income: 100, exp: [] })
    storage.setItem(STORAGE_KEY, firstRaw)

    const first = loadState(storage)
    storage.setItem(STORAGE_KEY, JSON.stringify({ income: 200, exp: [] }))
    const second = loadState(storage)

    expect(first.ok).toBe(true)
    expect(second.ok).toBe(true)
    expect(storage.getItem(PRE_MIGRATION_BACKUP_KEY)).toBe(firstRaw)
  })

  it('returns corrupt JSON errors without overwriting the stored value', () => {
    const storage = new FakeStorage()
    const corrupt = '{"income":'
    storage.setItem(STORAGE_KEY, corrupt)

    const result = loadState(storage)

    expect(result).toMatchObject({ ok: false, raw: corrupt })
    expect(storage.getItem(STORAGE_KEY)).toBe(corrupt)
  })

  it('returns migration errors without overwriting the stored value', () => {
    const storage = new FakeStorage()
    const futureState = JSON.stringify({ schemaVersion: 4 })
    storage.setItem(STORAGE_KEY, futureState)

    const result = loadState(storage)

    expect(result).toMatchObject({ ok: false, raw: futureState })
    expect(storage.getItem(STORAGE_KEY)).toBe(futureState)
  })

  it('saves state as JSON', () => {
    const storage = new FakeStorage()
    const state = loadState(new FakeStorage())

    if (!state.ok) throw state.error
    expect(saveState(state.state, storage)).toEqual({ ok: true })
    expect(JSON.parse(storage.getItem(STORAGE_KEY) ?? '')).toEqual(state.state)
  })
})
