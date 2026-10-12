import { migrateState } from '@/domain/migrate'
import type { AppState } from '@/domain/types'

const BACKUP_MIME_TYPE = 'application/json'

export class InvalidBackupError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidBackupError'
  }
}

export function exportBackup(state: AppState): Blob {
  return new Blob([JSON.stringify(state, null, 2)], { type: BACKUP_MIME_TYPE })
}

export async function importBackup(file: Blob): Promise<AppState> {
  let text: string

  try {
    text = await file.text()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new InvalidBackupError(`Could not read backup file: ${message}`)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new InvalidBackupError('Backup file is not valid JSON')
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new InvalidBackupError('Backup file must contain a JSON object')
  }

  return migrateState(parsed)
}
