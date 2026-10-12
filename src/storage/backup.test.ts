import { describe, expect, it } from 'vitest'
import type { AppState } from '@/domain/types'
import { exportBackup, importBackup } from './backup'

const state: AppState = {
  schemaVersion: 3,
  income: 100000,
  recurring: [
    { id: 'recurring-1', name: 'Rent', amount: 30000, dayOfMonth: 5, note: '' },
  ],
  oneOffs: [],
  debts: [],
  dailySpend: [],
  categories: [{ id: 'cat-other', name: 'Other' }],
}

describe('backup', () => {
  it('exports a v3 state as a JSON blob', async () => {
    const backup = exportBackup(state)

    expect(backup.type).toBe('application/json')
    expect(JSON.parse(await backup.text())).toEqual(state)
  })

  it('imports a v1 backup', async () => {
    const imported = await importBackup(new Blob([JSON.stringify({
      income: 100000,
      exp: [{ name: 'Rent', amount: 30000, due: '5th' }],
    })]))

    expect(imported).toMatchObject({
      schemaVersion: 3,
      income: 100000,
      recurring: [{ name: 'Rent', amount: 30000, dayOfMonth: 5 }],
    })
  })

  it('imports a v2 backup with spending and categories', async () => {
    const imported = await importBackup(new Blob([JSON.stringify({
      schemaVersion: 2,
      income: 100000,
      exp: [{ name: 'Rent', amount: 30000, due: 'last day' }],
      dailySpend: [{ id: 'spend-1', amount: 250, category: 'cat-food', date: '2026-10-08', note: 'Lunch' }],
      categories: [{ id: 'cat-food', name: 'Food' }, { id: 'cat-other', name: 'Other' }],
    })]))

    expect(imported).toMatchObject({
      schemaVersion: 3,
      recurring: [{ name: 'Rent', dayOfMonth: 'last' }],
      dailySpend: [{ id: 'spend-1', amount: 250, category: 'cat-food' }],
      categories: [{ id: 'cat-food', name: 'Food' }, { id: 'cat-other', name: 'Other' }],
    })
  })

  it('imports a v3 backup without changing it', async () => {
    await expect(importBackup(exportBackup(state))).resolves.toEqual(state)
  })

  it('rejects malformed backup content', async () => {
    await expect(importBackup(new Blob(['{"income":'])))
      .rejects.toThrow('Backup file is not valid JSON')
  })

  it('rejects a backup with an unsupported schema version', async () => {
    await expect(importBackup(new Blob([JSON.stringify({ schemaVersion: 4 })])))
      .rejects.toThrow('Unsupported schema version: 4')
  })
})
