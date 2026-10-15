import { migrateState } from '@/domain/migrate'
import type { AppState } from '@/domain/types'

export const STORAGE_KEY = 'salary-planner-v1'
export const PRE_MIGRATION_BACKUP_KEY = 'salary-planner-v1-pre-v3-backup'

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export type LoadResult =
  | { ok: true; state: AppState }
  | { ok: false; error: Error; raw: string | null }

export type SaveResult = { ok: true } | { ok: false; error: Error }

function defaultStorage(): StorageLike {
  return window.localStorage
}

function asError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

export function loadState(storage: StorageLike = defaultStorage()): LoadResult {
  let raw: string | null

  try {
    raw = storage.getItem(STORAGE_KEY)
  } catch (error) {
    return { ok: false, error: asError(error), raw: null }
  }

  if (raw === null) {
    try {
      return { ok: true, state: migrateState(null) }
    } catch (error) {
      return { ok: false, error: asError(error), raw: null }
    }
  }

  try {
    if (storage.getItem(PRE_MIGRATION_BACKUP_KEY) === null) {
      storage.setItem(PRE_MIGRATION_BACKUP_KEY, raw)
    }

    const parsed: unknown = JSON.parse(raw)
    return { ok: true, state: migrateState(parsed) }
  } catch (error) {
    return { ok: false, error: asError(error), raw }
  }
}

export function saveState(state: AppState, storage: StorageLike = defaultStorage()): SaveResult {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
    return { ok: true }
  } catch (error) {
    return { ok: false, error: asError(error) }
  }
}
