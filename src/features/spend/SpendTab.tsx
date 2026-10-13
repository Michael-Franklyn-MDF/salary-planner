import { useState, type ComponentProps } from 'react'
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

export function SpendTab() {
  const [amount, setAmount] = useState('')
  const numericAmount = Number(amount)

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

        <Keypad onKeyPress={(key) => setAmount((current) => updateAmount(current, key))} />

        <button
          type="button"
          className="min-h-12 w-full rounded-xl bg-[color:var(--accent)] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!Number.isFinite(numericAmount) || numericAmount <= 0}
        >
          Add
        </button>
      </div>
    </main>
  )
}
