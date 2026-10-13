import { useState, type ComponentProps } from 'react'
import { today } from '@/domain/dates'
import { useAppState } from '@/state/useAppState'
import { Keypad } from './Keypad'

type KeypadKey = Parameters<ComponentProps<typeof Keypad>['onKeyPress']>[0]

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

export function SpendTab() {
  const { state, dispatch } = useAppState()
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(state.categories[0]?.id ?? 'cat-other')
  const [date, setDate] = useState(today())
  const [note, setNote] = useState('')
  const numericAmount = Number(amount)

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

  return (
    <main id="spend-panel" role="tabpanel" aria-labelledby="spend-tab" className="mx-auto flex min-h-[calc(100svh-49px)] max-w-[480px] flex-col space-y-6 px-4 pb-32 pt-8">
      <h1 className="text-[34px] font-bold leading-[41px] tracking-tight">Spend</h1>

      <div className="flex flex-1 flex-col justify-end gap-6">
        <div
          role="status"
          aria-label={`Amount KSh ${amount || '0'}`}
          className="overflow-hidden text-center text-[52px] font-semibold leading-[56px] tabular-nums"
        >
          <span className="mr-2 text-[17px] font-normal leading-[22px] text-[color:var(--text-muted)]">KSh</span>{' '}
          {amount || '0'}
        </div>

        <div aria-label="Categories" className="flex gap-2 overflow-x-auto pb-1">
          {state.categories.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={category === item.id}
              className={`min-h-11 shrink-0 rounded-full px-4 text-[15px] transition-colors motion-reduce:transition-none ${
                category === item.id
                  ? 'bg-[color:var(--accent)] text-white'
                  : 'bg-[color:var(--surface)] text-[color:var(--text)]'
              }`}
              onClick={() => setCategory(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="grid gap-3">
          <label className="flex min-h-12 items-center justify-between rounded-xl bg-[color:var(--surface)] px-4">
            <span className="text-[15px] text-[color:var(--text-muted)]">Date</span>
            <input
              aria-label="Spend date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="bg-transparent text-right text-[15px]"
            />
          </label>
          <label className="block">
            <span className="sr-only">Note (optional)</span>
            <input
              aria-label="Note (optional)"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add a note (optional)"
              className="min-h-12 w-full rounded-xl bg-[color:var(--surface)] px-4 text-[15px] placeholder:text-[color:var(--text-muted)]"
            />
          </label>
        </div>

        <Keypad onKeyPress={(key) => setAmount((current) => updateAmount(current, key))} />

        <button
          type="button"
          className="min-h-12 w-full rounded-xl bg-[color:var(--accent)] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!Number.isFinite(numericAmount) || numericAmount <= 0}
          onClick={addSpend}
        >
          Add
        </button>
      </div>
    </main>
  )
}
