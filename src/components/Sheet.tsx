import type { MouseEvent, ReactNode } from 'react'

interface SheetProps {
  open: boolean
  title: string
  titleId: string
  onClose: () => void
  children: ReactNode
}

export function Sheet({ open, title, titleId, onClose, children }: SheetProps) {
  if (!open) return null

  function handleBackdropMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" role="presentation" onMouseDown={handleBackdropMouseDown}>
      <section role="dialog" aria-modal="true" aria-labelledby={titleId} className="w-full rounded-t-2xl bg-surface p-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-separator" />
        <div className="mb-5 flex items-center justify-between">
          <h2 id={titleId} className="text-section font-semibold">{title}</h2>
          <button type="button" className="text-accent" onClick={onClose}>Cancel</button>
        </div>
        {children}
      </section>
    </div>
  )
}
