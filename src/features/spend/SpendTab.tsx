import { useState, type ComponentProps } from 'react'
import { today } from '@/domain/dates'
import { formatMoney, formatShortDate } from '@/lib/format'
import type { DailySpend } from '@/domain/types'
import { useAppState } from '@/state/useAppState'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ListGroup } from '@/components/ListGroup'
import { Sheet } from '@/components/Sheet'
import { Keypad } from './Keypad'

type KeypadKey = Parameters<ComponentProps<typeof Keypad>['onKeyPress']>[0]

interface SpendTabProps {
  draftAmount?: string
  onDraftAmountChange?: (amount: string) => void
}

function updateAmount(current: string, key: KeypadKey): string {
  if (key === 'backspace') return current.slice(0, -1)
  if (key === '.') {
    if (current.includes('.') || current.length === 0) return current
    return `${current}.`
  }
  const decimals = current.split('.')[1]
  if (decimals && decimals.length >= 2) return current
  if (current === '0') return key
  return `${current}${key}`
}

function createId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `spend-${Date.now()}`
}

export function SpendTab({ draftAmount, onDraftAmountChange }: SpendTabProps = {}) {
  const { state, dispatch } = useAppState()
  const [localAmount, setLocalAmount] = useState('')
  const amount = draftAmount ?? localAmount
  const [category, setCategory] = useState(state.categories[0]?.id ?? 'cat-other')
  const [date, setDate] = useState(today())
  const [note, setNote] = useState('')
  const [editing, setEditing] = useState<DailySpend | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editNote, setEditNote] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [categoryDeleteId, setCategoryDeleteId] = useState<string | null>(null)
  const numericAmount = Number(amount)
  const currentDate = today()
  const todayTotal = state.dailySpend.filter((item) => item.date === currentDate).reduce((sum, item) => sum + item.amount, 0)
  const monthTotal = state.dailySpend.filter((item) => item.date.startsWith(currentDate.slice(0, 7))).reduce((sum, item) => sum + item.amount, 0)

  function setAmount(next: string | ((current: string) => string)) {
    const nextAmount = typeof next === 'function' ? next(amount) : next
    onDraftAmountChange?.(nextAmount)
    if (!onDraftAmountChange) setLocalAmount(nextAmount)
  }

  function addSpend() {
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return

    dispatch({
      type: 'addDailySpend',
      item: {
        id: createId(),
        amount: numericAmount,
        category,
        date,
        note: note.trim(),
      },
    })
    setAmount('')
    setNote('')
  }

  function openEdit(item: DailySpend) {
    setEditing(item)
    setEditAmount(String(item.amount))
    setEditCategory(item.category)
    setEditDate(item.date)
    setEditNote(item.note)
    setConfirmDelete(false)
  }

  function closeEdit() {
    setEditing(null)
    setConfirmDelete(false)
  }

  function saveEdit() {
    if (!editing) return
    const nextAmount = Number(editAmount)
    if (!Number.isFinite(nextAmount) || nextAmount <= 0 || !editDate) return
    dispatch({
      type: 'updateDailySpend',
      item: {
        ...editing,
        amount: nextAmount,
        category: editCategory,
        date: editDate,
        note: editNote.trim(),
      },
    })
    closeEdit()
  }

  function deleteEdit() {
    if (!editing) return
    dispatch({ type: 'deleteDailySpend', id: editing.id })
    closeEdit()
  }

  function openCategories() {
    setCategoriesOpen(true)
    setCategoryName('')
    setEditingCategoryId(null)
    setCategoryDeleteId(null)
  }

  function saveCategory() {
    const name = categoryName.trim()
    if (!name) return
    if (editingCategoryId) {
      dispatch({ type: 'updateCategory', item: { id: editingCategoryId, name } })
    } else {
      const id = createId()
      dispatch({ type: 'addCategory', item: { id, name } })
      setCategory(id)
    }
    setCategoryName('')
    setEditingCategoryId(null)
  }

  const groupedEntries = [...state.dailySpend]
    .sort((left, right) => right.date.localeCompare(left.date) || right.id.localeCompare(left.id))
    .reduce<Record<string, DailySpend[]>>((groups, item) => {
      groups[item.date] = [...(groups[item.date] ?? []), item]
      return groups
    }, {})

  return (
    <main id="spend-panel" role="tabpanel" aria-labelledby="spend-tab" className="spend-screen mx-auto flex min-h-[calc(100svh-49px)] max-w-[480px] flex-col space-y-6 px-4 pb-32 pt-8">
      <h1 className="text-large-title font-bold tracking-tight">Spend</h1>

      <div className="flex flex-1 flex-col justify-end gap-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-surface p-4">
            <p className="text-footnote text-muted">Today</p>
            <p className="mt-1 text-section font-semibold tabular-nums">{formatMoney(todayTotal)}</p>
          </div>
          <div className="rounded-xl bg-surface p-4">
            <p className="text-footnote text-muted">This month</p>
            <p className="mt-1 text-section font-semibold tabular-nums">{formatMoney(monthTotal)}</p>
          </div>
        </div>

        <div
          role="status"
          aria-label={`Amount KSh ${amount || '0'}`}
          className="spend-amount overflow-hidden text-center text-hero font-semibold tabular-nums"
        >
          <span className="mr-2 text-body font-normal leading-[22px] text-muted">KSh</span>{' '}
          {amount || '0'}
        </div>

        <div aria-label="Categories" className="flex gap-2 overflow-x-auto pb-1">
          {state.categories.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={category === item.id}
              className={`min-h-11 shrink-0 rounded-full px-4 text-subhead transition-colors motion-reduce:transition-none ${
                category === item.id
                  ? 'bg-accent text-white'
                  : 'bg-surface text-foreground'
              }`}
              onClick={() => setCategory(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <button type="button" className="min-h-11 text-left text-subhead text-accent" onClick={openCategories}>Manage categories</button>

        <div className="grid gap-3">
          <label className="flex min-h-12 items-center justify-between rounded-xl bg-surface px-4">
            <span className="text-subhead text-muted">Date</span>
            <input
              aria-label="Spend date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="bg-transparent text-right text-subhead"
            />
          </label>
          <label className="block">
            <span className="sr-only">Note (optional)</span>
            <input
              aria-label="Note (optional)"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add a note (optional)"
              className="min-h-12 w-full rounded-xl bg-surface px-4 text-subhead placeholder:text-muted"
            />
          </label>
        </div>

        <Keypad onKeyPress={(key) => setAmount((current) => updateAmount(current, key))} />

        <button
          type="button"
          className="min-h-12 w-full rounded-xl bg-accent font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!Number.isFinite(numericAmount) || numericAmount <= 0}
          onClick={addSpend}
        >
          Add
        </button>

        <section aria-labelledby="recent-heading" className="space-y-3">
          <h2 id="recent-heading" className="px-1 text-footnote font-medium uppercase tracking-wide text-muted">Recent</h2>
          {Object.keys(groupedEntries).length === 0 ? (
            <p className="rounded-xl bg-surface px-4 py-5 text-subhead text-muted">No spending logged yet.</p>
          ) : (
            Object.entries(groupedEntries).map(([entryDate, entries]) => (
              <ListGroup key={entryDate}>
                <div className="flex items-center justify-between border-b border-separator px-4 py-3">
                  <h3 className="text-subhead font-semibold">{formatShortDate(entryDate)}</h3>
                  <span className="text-subhead tabular-nums text-muted">
                    {formatMoney(entries.reduce((sum, item) => sum + item.amount, 0))}
                  </span>
                </div>
                {entries.map((item) => {
                  const itemCategory = state.categories.find((categoryItem) => categoryItem.id === item.category)?.name ?? 'Other'
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className="flex min-h-14 w-full items-center justify-between border-b border-separator px-4 text-left last:border-b-0"
                      onClick={() => openEdit(item)}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-body">{itemCategory}</span>
                        {item.note && <span className="block truncate text-footnote text-muted">{item.note}</span>}
                      </span>
                      <span className="ml-4 shrink-0 tabular-nums">{formatMoney(item.amount)}</span>
                    </button>
                  )
                })}
              </ListGroup>
            ))
          )}
        </section>
      </div>

      <Sheet open={editing !== null} title="Edit spending" titleId="spend-editor-title" onClose={closeEdit}>
        {editing && (
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); saveEdit() }}>
              <label className="block space-y-1">
                <span className="text-footnote text-muted">Amount</span>
                <input aria-label="Edit amount" required inputMode="decimal" value={editAmount} onChange={(event) => setEditAmount(event.target.value)} className="min-h-11 w-full rounded-lg bg-surface-2 px-3" />
              </label>
              <label className="block space-y-1">
                <span className="text-footnote text-muted">Category</span>
                <select aria-label="Edit category" value={editCategory} onChange={(event) => setEditCategory(event.target.value)} className="min-h-11 w-full rounded-lg bg-surface-2 px-3">
                  {state.categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-footnote text-muted">Date</span>
                <input aria-label="Edit date" type="date" value={editDate} onChange={(event) => setEditDate(event.target.value)} className="min-h-11 w-full rounded-lg bg-surface-2 px-3" />
              </label>
              <label className="block space-y-1">
                <span className="text-footnote text-muted">Note</span>
                <textarea aria-label="Edit note" value={editNote} onChange={(event) => setEditNote(event.target.value)} className="min-h-20 w-full rounded-lg bg-surface-2 px-3 py-2" />
              </label>
              <button type="submit" className="min-h-12 w-full rounded-xl bg-accent font-semibold text-white">Save</button>
              {!confirmDelete ? (
                <button type="button" className="min-h-11 w-full text-bad" onClick={() => setConfirmDelete(true)}>Delete</button>
              ) : (
                <div className="space-y-2 rounded-xl bg-surface-2 p-3" role="alertdialog" aria-label="Confirm spending deletion">
                  <p>Delete this spending entry?</p>
                  <div className="flex gap-2">
                    <button type="button" className="min-h-11 flex-1 rounded-lg bg-surface" onClick={() => setConfirmDelete(false)}>Cancel</button>
                    <button type="button" className="min-h-11 flex-1 rounded-lg bg-bad font-semibold text-white" onClick={deleteEdit}>Delete</button>
                  </div>
                </div>
              )}
            </form>
        )}
      </Sheet>

      <Sheet open={categoriesOpen} title="Categories" titleId="categories-title" onClose={() => setCategoriesOpen(false)}>
            <div className="mb-5 flex justify-end">
              <button type="button" className="text-accent" onClick={() => setCategoriesOpen(false)}>Done</button>
            </div>
            <div className="space-y-2">
              {state.categories.map((item) => (
                <div key={item.id} className="flex min-h-12 items-center gap-2 rounded-xl bg-surface-2 px-3">
                  {editingCategoryId === item.id ? (
                    <input aria-label={`Rename ${item.name}`} autoFocus value={categoryName} onChange={(event) => setCategoryName(event.target.value)} className="min-w-0 flex-1 bg-transparent" />
                  ) : (
                    <span className="min-w-0 flex-1 truncate">{item.name}</span>
                  )}
                  {item.id !== 'cat-other' && (
                    editingCategoryId === item.id ? (
                      <button type="button" className="text-accent" onClick={saveCategory}>Save</button>
                    ) : (
                      <>
                        <button type="button" className="text-accent" onClick={() => { setEditingCategoryId(item.id); setCategoryName(item.name) }}>Rename</button>
                        <button type="button" className="text-bad" onClick={() => setCategoryDeleteId(item.id)}>Delete</button>
                      </>
                    )
                  )}
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <input aria-label="New category" value={editingCategoryId ? '' : categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="New category" className="min-h-11 min-w-0 flex-1 rounded-lg bg-surface-2 px-3" />
                <button type="button" className="min-h-11 rounded-lg bg-accent px-4 font-semibold text-white" onClick={saveCategory}>Add</button>
              </div>
            </div>
      </Sheet>
      <ConfirmDialog
        open={categoryDeleteId !== null}
        title="Delete this category? Its entries will move to Other."
        confirmLabel="Delete"
        onCancel={() => setCategoryDeleteId(null)}
        onConfirm={() => {
          if (!categoryDeleteId) return
          dispatch({ type: 'deleteCategory', id: categoryDeleteId })
          if (category === categoryDeleteId) setCategory('cat-other')
          setCategoryDeleteId(null)
        }}
      />
    </main>
  )
}
