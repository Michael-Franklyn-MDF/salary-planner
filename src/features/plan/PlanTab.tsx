import { useState } from 'react'
import type { AppState, Debt, OneOffCost, RecurringExpense } from '@/domain/types'
import { useAppState } from '@/state/useAppState'
import { exportBackup, importBackup } from '@/storage/backup'

type ItemKind = 'recurring' | 'oneOff' | 'debt'
type Editor = { kind: 'income' } | { kind: ItemKind; id?: string }

interface FormState {
  name: string
  amount: string
  day: string
  date: string
  endDate: string
  note: string
}

const emptyForm: FormState = { name: '', amount: '', day: '', date: '', endDate: '', note: '' }

function formatAmount(amount: number): string {
  return `KSh ${amount.toLocaleString('en-KE', { maximumFractionDigits: 2 })}`
}

function itemDate(item: RecurringExpense | OneOffCost | Debt): string | null {
  if ('date' in item) return item.date
  if (item.dayOfMonth === 'last') return 'Last day'
  return item.dayOfMonth === null ? null : `${item.dayOfMonth}`
}

function createId(prefix: string): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `${prefix}-${Date.now()}`
}

function initialForm(state: AppState, editor: Editor): FormState {
  if (editor.kind === 'income') return { ...emptyForm, amount: String(state.income || '') }
  if (editor.kind === 'recurring') {
    const item = state.recurring.find((entry) => entry.id === editor.id)
    return item
      ? { name: item.name, amount: String(item.amount), day: item.dayOfMonth === null ? '' : String(item.dayOfMonth), date: '', endDate: '', note: item.note }
      : emptyForm
  }
  if (editor.kind === 'oneOff') {
    const item = state.oneOffs.find((entry) => entry.id === editor.id)
    return item
      ? { name: item.name, amount: String(item.amount), day: '', date: item.date ?? '', endDate: '', note: item.note }
      : emptyForm
  }
  const item = state.debts.find((entry) => entry.id === editor.id)
  return item
    ? { name: item.name, amount: String(item.amount), day: item.dayOfMonth === null ? '' : String(item.dayOfMonth), date: '', endDate: item.endDate ?? '', note: item.note }
    : emptyForm
}

function PlanGroup<T extends RecurringExpense | OneOffCost | Debt>({
  title,
  items,
  kind,
  onAdd,
  onEdit,
}: {
  title: string
  items: T[]
  kind: ItemKind
  onAdd: (kind: ItemKind) => void
  onEdit: (kind: ItemKind, id: string) => void
}) {
  return (
    <section aria-labelledby={`${kind}-heading`} className="space-y-2">
      <h2 id={`${kind}-heading`} className="px-4 text-[13px] font-medium uppercase tracking-wide text-[color:var(--text-muted)]">
        {title}
      </h2>
      <div className="overflow-hidden rounded-xl bg-[color:var(--surface)]">
        {items.map((item) => {
          const date = itemDate(item)
          return (
            <button
              key={item.id}
              type="button"
              className="flex min-h-16 w-full items-center justify-between border-b border-[color:var(--separator)] px-4 text-left last:border-b-0"
              onClick={() => onEdit(kind, item.id)}
            >
              <span className="min-w-0">
                <span className="block truncate text-[17px] leading-[22px]">{item.name || 'Unnamed'}</span>
                <span className="block text-[13px] leading-[18px] text-[color:var(--text-muted)]">
                  {date ? (kind === 'oneOff' ? date : `Day ${date}`) : 'No date'}
                </span>
              </span>
              <span className="ml-4 shrink-0 tabular-nums">{formatAmount(item.amount)}</span>
            </button>
          )
        })}
        <button
          type="button"
          className="min-h-12 w-full px-4 text-left text-[color:var(--accent)]"
          onClick={() => onAdd(kind)}
        >
          Add {kind === 'recurring' ? 'recurring expense' : kind === 'oneOff' ? 'one-off cost' : 'debt'}
        </button>
      </div>
    </section>
  )
}

export function PlanTab() {
  const { state, dispatch } = useAppState()
  const [editor, setEditor] = useState<Editor | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  function openEditor(nextEditor: Editor) {
    setEditor(nextEditor)
    setForm(initialForm(state, nextEditor))
    setConfirmDelete(false)
  }

  function closeEditor() {
    setEditor(null)
    setConfirmDelete(false)
  }

  function updateForm(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function save() {
    if (!editor) return
    const amount = Number(form.amount)
    if (editor.kind === 'income') {
      dispatch({ type: 'setIncome', income: Number.isFinite(amount) ? amount : 0 })
      closeEditor()
      return
    }

    const id = editor.id ?? createId(editor.kind)
    const dayOfMonth = form.day === 'last'
      ? 'last' as const
      : Number.isInteger(Number(form.day)) && Number(form.day) >= 1 && Number(form.day) <= 31
        ? Number(form.day)
        : null
    const common = {
      id,
      name: form.name.trim(),
      amount: Number.isFinite(amount) ? amount : 0,
      note: form.note.trim(),
    }

    if (editor.kind === 'recurring') {
      dispatch({
        type: editor.id ? 'updateRecurring' : 'addRecurring',
        item: { ...common, dayOfMonth },
      })
    } else if (editor.kind === 'oneOff') {
      dispatch({
        type: editor.id ? 'updateOneOff' : 'addOneOff',
        item: { ...common, date: form.date || null },
      })
    } else {
      dispatch({
        type: editor.id ? 'updateDebt' : 'addDebt',
        item: { ...common, dayOfMonth, endDate: form.endDate || null },
      })
    }
    closeEditor()
  }

  function deleteItem() {
    if (!editor || editor.kind === 'income' || !editor.id) return
    const action = editor.kind === 'recurring' ? 'deleteRecurring'
      : editor.kind === 'oneOff' ? 'deleteOneOff' : 'deleteDebt'
    dispatch({ type: action, id: editor.id })
    closeEditor()
  }

  function downloadBackup() {
    const url = URL.createObjectURL(exportBackup(state))
    const link = document.createElement('a')
    link.href = url
    link.download = 'salary-planner-backup.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport(file: Blob | undefined) {
    if (!file) return
    try {
      const imported = await importBackup(file)
      dispatch({ type: 'replaceAll', state: imported })
      setImportError(null)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <main className="mx-auto max-w-[480px] space-y-7 px-4 pb-32 pt-8">
      <h1 className="text-[34px] font-bold leading-[41px] tracking-tight">Plan</h1>

      <section aria-labelledby="income-heading" className="space-y-2">
        <h2 id="income-heading" className="px-4 text-[13px] font-medium uppercase tracking-wide text-[color:var(--text-muted)]">Income</h2>
        <div className="overflow-hidden rounded-xl bg-[color:var(--surface)]">
          <button type="button" className="flex min-h-16 w-full items-center justify-between px-4 text-left" onClick={() => openEditor({ kind: 'income' })}>
            <span className="text-[17px] leading-[22px]">Monthly take-home</span>
            <span className="tabular-nums">{formatAmount(state.income)}</span>
          </button>
        </div>
      </section>

      <PlanGroup title="Recurring expenses" items={state.recurring} kind="recurring" onAdd={(kind) => openEditor({ kind })} onEdit={(kind, id) => openEditor({ kind, id })} />
      <PlanGroup title="Upcoming costs" items={state.oneOffs} kind="oneOff" onAdd={(kind) => openEditor({ kind })} onEdit={(kind, id) => openEditor({ kind, id })} />
      <PlanGroup title="Debts" items={state.debts} kind="debt" onAdd={(kind) => openEditor({ kind })} onEdit={(kind, id) => openEditor({ kind, id })} />

      <section aria-labelledby="data-heading" className="space-y-2">
        <h2 id="data-heading" className="px-4 text-[13px] font-medium uppercase tracking-wide text-[color:var(--text-muted)]">Data</h2>
        <div className="overflow-hidden rounded-xl bg-[color:var(--surface)]">
          <button type="button" className="min-h-12 w-full border-b border-[color:var(--separator)] px-4 text-left text-[color:var(--accent)]" onClick={downloadBackup}>Export backup</button>
          <label className="block min-h-12 cursor-pointer border-b border-[color:var(--separator)] px-4 leading-[48px] text-[color:var(--accent)]">
            Import backup
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0]
                void handleImport(file)
                event.target.value = ''
              }}
            />
          </label>
          <button type="button" className="min-h-12 w-full px-4 text-left text-[color:var(--bad)]" onClick={() => setConfirmClear(true)}>Clear all data</button>
        </div>
        {importError && <p role="alert" className="px-4 text-[13px] text-[color:var(--bad)]">{importError}</p>}
      </section>

      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5" role="presentation">
          <section role="alertdialog" aria-modal="true" aria-labelledby="clear-title" className="w-full max-w-sm rounded-2xl bg-[color:var(--surface)] p-5">
            <h2 id="clear-title" className="text-[20px] font-semibold">Clear all data?</h2>
            <p className="mt-2 text-[15px] text-[color:var(--text-muted)]">This cannot be undone. Export a backup first if you may need this data.</p>
            <div className="mt-5 flex gap-2">
              <button type="button" className="min-h-11 flex-1 rounded-lg bg-[color:var(--surface-2)]" onClick={() => setConfirmClear(false)}>Cancel</button>
              <button type="button" className="min-h-11 flex-1 rounded-lg bg-[color:var(--bad)] font-semibold text-white" onClick={() => { dispatch({ type: 'clear' }); setConfirmClear(false) }}>Clear all data</button>
            </div>
          </section>
        </div>
      )}

      {editor && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeEditor()
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="editor-title" className="w-full rounded-t-2xl bg-[color:var(--surface)] p-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
            <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-[color:var(--separator)]" />
            <div className="mb-5 flex items-center justify-between">
              <h2 id="editor-title" className="text-[20px] font-semibold">{editor.kind === 'income' ? 'Income' : editor.id ? 'Edit item' : 'Add item'}</h2>
              <button type="button" className="text-[color:var(--accent)]" onClick={closeEditor}>Cancel</button>
            </div>
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); save() }}>
              {editor.kind !== 'income' && (
                <label className="block space-y-1">
                  <span className="text-[13px] text-[color:var(--text-muted)]">Name</span>
                  <input required value={form.name} onChange={(event) => updateForm('name', event.target.value)} className="min-h-11 w-full rounded-lg border border-[color:var(--separator)] bg-[color:var(--surface-2)] px-3" />
                </label>
              )}
              <label className="block space-y-1">
                <span className="text-[13px] text-[color:var(--text-muted)]">Amount</span>
                <input required inputMode="decimal" type="number" step="0.01" min="0" value={form.amount} onChange={(event) => updateForm('amount', event.target.value)} className="min-h-11 w-full rounded-lg border border-[color:var(--separator)] bg-[color:var(--surface-2)] px-3" />
              </label>
              {editor.kind === 'oneOff' && (
                <label className="block space-y-1">
                  <span className="text-[13px] text-[color:var(--text-muted)]">Date</span>
                  <input type="date" value={form.date} onChange={(event) => updateForm('date', event.target.value)} className="min-h-11 w-full rounded-lg border border-[color:var(--separator)] bg-[color:var(--surface-2)] px-3" />
                </label>
              )}
              {(editor.kind === 'recurring' || editor.kind === 'debt') && (
                <label className="block space-y-1">
                  <span className="text-[13px] text-[color:var(--text-muted)]">Day of month</span>
                  <input inputMode="numeric" placeholder="1-31 or last" value={form.day} onChange={(event) => updateForm('day', event.target.value)} className="min-h-11 w-full rounded-lg border border-[color:var(--separator)] bg-[color:var(--surface-2)] px-3" />
                </label>
              )}
              {editor.kind === 'debt' && (
                <label className="block space-y-1">
                  <span className="text-[13px] text-[color:var(--text-muted)]">End date</span>
                  <input type="date" value={form.endDate} onChange={(event) => updateForm('endDate', event.target.value)} className="min-h-11 w-full rounded-lg border border-[color:var(--separator)] bg-[color:var(--surface-2)] px-3" />
                </label>
              )}
              {editor.kind !== 'income' && (
                <label className="block space-y-1">
                  <span className="text-[13px] text-[color:var(--text-muted)]">Note</span>
                  <textarea value={form.note} onChange={(event) => updateForm('note', event.target.value)} className="min-h-20 w-full rounded-lg border border-[color:var(--separator)] bg-[color:var(--surface-2)] px-3 py-2" />
                </label>
              )}
              <button type="submit" className="min-h-12 w-full rounded-xl bg-[color:var(--accent)] font-semibold text-white">{editor.kind === 'income' || ('id' in editor && editor.id) ? 'Save' : 'Add'}</button>
              {editor.kind !== 'income' && editor.id && !confirmDelete && (
                <button type="button" className="min-h-11 w-full text-[color:var(--bad)]" onClick={() => setConfirmDelete(true)}>Delete</button>
              )}
              {confirmDelete && (
                <div className="space-y-2 rounded-xl bg-[color:var(--surface-2)] p-3" role="alertdialog" aria-label="Confirm deletion">
                  <p>Delete this item?</p>
                  <div className="flex gap-2">
                    <button type="button" className="min-h-11 flex-1 rounded-lg bg-[color:var(--surface)]" onClick={() => setConfirmDelete(false)}>Cancel</button>
                    <button type="button" className="min-h-11 flex-1 rounded-lg bg-[color:var(--bad)] font-semibold text-white" onClick={deleteItem}>Delete</button>
                  </div>
                </div>
              )}
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
