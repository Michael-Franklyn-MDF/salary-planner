import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import type { AppState, Debt, OneOffCost, RecurringExpense } from '@/domain/types'
import { formatMoney, formatShortDate } from '@/lib/format'
import { useAppState } from '@/state/useAppState'
import { exportBackup, importBackup } from '@/storage/backup'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ListGroup } from '@/components/ListGroup'
import { Sheet } from '@/components/Sheet'

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
      <h2 id={`${kind}-heading`} aria-label={title} className="px-4 text-footnote font-medium text-muted">
        <span>{title}</span>
        <span className="ml-2 normal-case">{items.length} · {formatMoney(items.reduce((sum, item) => sum + item.amount, 0))}</span>
      </h2>
      <ListGroup>
        {items.map((item) => {
          const date = itemDate(item)
          return (
            <button
              key={item.id}
              type="button"
              className="flex min-h-16 w-full items-center justify-between border-b border-separator px-4 text-left last:border-b-0"
              onClick={() => onEdit(kind, item.id)}
            >
              <span className="min-w-0">
                <span className="block truncate text-body">{item.name || 'Unnamed'}</span>
                <span className="block text-footnote text-muted">
                  {date
                    ? (kind === 'oneOff' ? formatShortDate(date) : `Day ${date}`)
                    : kind === 'oneOff'
                      ? 'No date'
                      : <span className="text-accent">Add day</span>}
                </span>
              </span>
              <span className="ml-4 flex shrink-0 items-center gap-2 tabular-nums">{formatMoney(item.amount)}<ChevronRight size={18} aria-hidden /></span>
            </button>
          )
        })}
        <button
          type="button"
          className="min-h-12 w-full px-4 text-left text-accent"
          onClick={() => onAdd(kind)}
        >
          Add {kind === 'recurring' ? 'recurring expense' : kind === 'oneOff' ? 'one-off cost' : 'debt'}
        </button>
      </ListGroup>
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
      <h1 className="text-large-title font-bold tracking-tight">Plan</h1>

      <section aria-labelledby="income-heading" className="space-y-2">
        <h2 id="income-heading" className="px-4 text-footnote font-medium text-muted">Income</h2>
        <ListGroup>
          <button type="button" className="flex min-h-16 w-full items-center justify-between px-4 text-left" onClick={() => openEditor({ kind: 'income' })}>
            <span className="text-body">Monthly take-home</span>
            <span className="flex items-center gap-2 tabular-nums">{formatMoney(state.income)}<ChevronRight size={18} aria-hidden /></span>
          </button>
        </ListGroup>
      </section>

      <PlanGroup title="Recurring expenses" items={state.recurring} kind="recurring" onAdd={(kind) => openEditor({ kind })} onEdit={(kind, id) => openEditor({ kind, id })} />
      <PlanGroup title="Upcoming costs" items={state.oneOffs} kind="oneOff" onAdd={(kind) => openEditor({ kind })} onEdit={(kind, id) => openEditor({ kind, id })} />
      <PlanGroup title="Debts" items={state.debts} kind="debt" onAdd={(kind) => openEditor({ kind })} onEdit={(kind, id) => openEditor({ kind, id })} />

      <section aria-labelledby="data-heading" className="space-y-2">
        <h2 id="data-heading" className="px-4 text-footnote font-medium text-muted">Data</h2>
        <ListGroup>
          <button type="button" className="flex min-h-16 w-full items-center justify-between border-b border-separator px-4 text-left" onClick={downloadBackup}>
            <span><span className="block text-accent">Export backup</span><span className="block text-footnote text-muted">Save a copy of your data to this device.</span></span>
            <ChevronRight size={18} aria-hidden />
          </button>
          <label className="flex min-h-16 cursor-pointer items-center justify-between border-b border-separator px-4">
            <span><span className="block text-accent">Import backup</span><span className="block text-footnote text-muted">Replace your current data from a JSON file.</span></span>
            <ChevronRight size={18} aria-hidden />
            <input
              aria-label="Import backup"
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
        </ListGroup>
        {importError && <p role="alert" className="px-4 text-footnote text-bad">{importError}</p>}
      </section>
      <section aria-label="Destructive actions">
        <ListGroup>
          <button type="button" className="min-h-12 w-full px-4 text-left text-bad" onClick={() => setConfirmClear(true)}>Clear all data</button>
        </ListGroup>
      </section>

      <ConfirmDialog
        open={confirmClear}
        title="Clear all data?"
        description="This cannot be undone. Export a backup first if you may need this data."
        confirmLabel="Clear all data"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => { dispatch({ type: 'clear' }); setConfirmClear(false) }}
      />

      <Sheet open={editor !== null} title={editor?.kind === 'income' ? 'Income' : editor?.id ? 'Edit item' : 'Add item'} titleId="editor-title" onClose={closeEditor}>
        {editor && (
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); save() }}>
              {editor.kind !== 'income' && (
                <label className="block space-y-1">
                  <span className="text-footnote text-muted">Name</span>
                  <input required value={form.name} onChange={(event) => updateForm('name', event.target.value)} className="min-h-11 w-full rounded-lg border border-separator bg-surface-2 px-3" />
                </label>
              )}
              <label className="block space-y-1">
                <span className="text-footnote text-muted">Amount</span>
                <input required inputMode="decimal" type="number" step="0.01" min="0" value={form.amount} onChange={(event) => updateForm('amount', event.target.value)} className="min-h-11 w-full rounded-lg border border-separator bg-surface-2 px-3" />
              </label>
              {editor.kind === 'oneOff' && (
                <label className="block space-y-1">
                  <span className="text-footnote text-muted">Date</span>
                  <input type="date" value={form.date} onChange={(event) => updateForm('date', event.target.value)} className="min-h-11 w-full rounded-lg border border-separator bg-surface-2 px-3" />
                </label>
              )}
              {(editor.kind === 'recurring' || editor.kind === 'debt') && (
                <label className="block space-y-1">
                  <span className="text-footnote text-muted">Day of month</span>
                  <input inputMode="numeric" placeholder="1-31 or last" value={form.day} onChange={(event) => updateForm('day', event.target.value)} className="min-h-11 w-full rounded-lg border border-separator bg-surface-2 px-3" />
                </label>
              )}
              {editor.kind === 'debt' && (
                <label className="block space-y-1">
                  <span className="text-footnote text-muted">End date</span>
                  <input type="date" value={form.endDate} onChange={(event) => updateForm('endDate', event.target.value)} className="min-h-11 w-full rounded-lg border border-separator bg-surface-2 px-3" />
                </label>
              )}
              {editor.kind !== 'income' && (
                <label className="block space-y-1">
                  <span className="text-footnote text-muted">Note</span>
                  <textarea value={form.note} onChange={(event) => updateForm('note', event.target.value)} className="min-h-20 w-full rounded-lg border border-separator bg-surface-2 px-3 py-2" />
                </label>
              )}
              <button type="submit" className="min-h-12 w-full rounded-xl bg-accent font-semibold text-accent-foreground">{editor.kind === 'income' || ('id' in editor && editor.id) ? 'Save' : 'Add'}</button>
              {editor.kind !== 'income' && editor.id && !confirmDelete && (
                <button type="button" className="min-h-11 w-full text-bad" onClick={() => setConfirmDelete(true)}>Delete</button>
              )}
              {confirmDelete && (
                <div className="space-y-2 rounded-xl bg-surface-2 p-3" role="alertdialog" aria-label="Confirm deletion">
                  <p>Delete this item?</p>
                  <div className="flex gap-2">
                    <button type="button" className="min-h-11 flex-1 rounded-lg bg-surface" onClick={() => setConfirmDelete(false)}>Cancel</button>
                    <button type="button" className="min-h-11 flex-1 rounded-lg bg-bad font-semibold text-danger-foreground" onClick={deleteItem}>Delete</button>
                  </div>
                </div>
              )}
            </form>
        )}
      </Sheet>
    </main>
  )
}
