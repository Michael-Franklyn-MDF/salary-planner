import type { ReactNode } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
  children?: ReactNode
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5" role="presentation">
      <section role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" className="w-full max-w-sm rounded-2xl bg-surface p-5">
        <h2 id="confirm-dialog-title" className="text-section font-semibold">{title}</h2>
        {description && <p className="mt-2 text-subhead text-muted">{description}</p>}
        {children}
        <div className="mt-5 flex gap-2">
          <button type="button" className="min-h-11 flex-1 rounded-lg bg-surface-2" onClick={onCancel}>Cancel</button>
          <button type="button" className="min-h-11 flex-1 rounded-lg bg-bad font-semibold text-white" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </section>
    </div>
  )
}
