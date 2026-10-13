import { Delete } from 'lucide-react'

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'] as const

interface KeypadProps {
  onKeyPress: (key: (typeof keys)[number]) => void
}

export function Keypad({ onKeyPress }: KeypadProps) {
  return (
    <div aria-label="Amount keypad" className="grid grid-cols-3 gap-1">
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          aria-label={key === '.' ? 'decimal point' : key === 'backspace' ? 'Backspace' : key}
          className="flex h-16 items-center justify-center rounded-xl text-[32px] leading-none transition-opacity active:opacity-50 motion-reduce:transition-none"
          onClick={() => onKeyPress(key)}
        >
          {key === 'backspace' ? <Delete size={28} strokeWidth={1.8} aria-hidden /> : key}
        </button>
      ))}
    </div>
  )
}
