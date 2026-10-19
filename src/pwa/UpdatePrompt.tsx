import { useEffect, useState } from 'react'
import { updateAvailableEventName } from './register'

interface UpdatePromptProps {
  onUpdate: () => Promise<void>
}

export function UpdatePrompt({ onUpdate }: UpdatePromptProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const show = () => setVisible(true)
    window.addEventListener(updateAvailableEventName(), show)
    return () => window.removeEventListener(updateAvailableEventName(), show)
  }, [])

  if (!visible) return null

  return (
    <aside
      role="status"
      className="fixed inset-x-4 bottom-[calc(108px+env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-[448px] items-center justify-between gap-4 rounded-2xl bg-surface p-4 shadow-lg ring-1 ring-separator"
    >
      <p className="text-subhead">A new version is ready.</p>
      <button
        type="button"
        className="min-h-11 shrink-0 rounded-xl bg-accent px-4 font-semibold text-white"
        onClick={() => void onUpdate()}
      >
        Update
      </button>
    </aside>
  )
}
