import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
  /**
   * Fires from the dialog's native `close` event — i.e. strictly after the
   * browser's own close() has already run (and, with it, its own attempt to
   * restore focus to whatever triggered showModal()). Everything outside an
   * open <dialog> is inert, so a caller-side `.focus()` issued synchronously
   * from onConfirm/onCancel is a silent no-op — this is the first point
   * where the rest of the page is interactive again, making it the only
   * reliable place to do custom focus restoration.
   */
  onClosed?: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive,
  onConfirm,
  onCancel,
  onClosed,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  // <dialog>.showModal()/.close() rather than conditional rendering: native
  // dialog semantics give us a focus trap, Escape-to-cancel (the 'cancel'
  // event below), and returning focus to the trigger on close, all for free.
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    // The ::backdrop pseudo-element isn't a real node, so a click on it still
    // dispatches on <dialog> itself with the dialog as e.target — whereas a
    // click on any real child (the title, a button, ...) has that child as
    // e.target. This is why a coordinate-rect check is the wrong tool here:
    // a keyboard-activated click (Enter/Space on a focused button) carries
    // clientX/clientY of 0,0, which a rect check reads as "outside" and
    // double-fires onCancel for every keyboard user — e.target doesn't have
    // that problem since it reflects the actual DOM target regardless of
    // how the click was triggered.
    if (e.target === ref.current) onCancel()
  }

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault()
        onCancel()
      }}
      onClose={onClosed}
      onClick={handleBackdropClick}
      // Tailwind's Preflight resets margin to 0 on every element, which quietly
      // defeats the native <dialog> UA stylesheet's `margin: auto` centering —
      // restore it explicitly instead of the dialog opening pinned to the corner.
      className="m-auto max-w-sm rounded-lg border border-slate-500 bg-white p-4 text-slate-900 shadow-2xl backdrop:bg-slate-950/50 dark:border-slate-400 dark:bg-slate-900 dark:text-slate-100 dark:backdrop:bg-black/70"
    >
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">{description}</p>
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-500 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-400 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`rounded-md border px-3 py-1.5 text-xs font-medium text-white ${
            destructive
              ? 'border-red-700 bg-red-600 hover:bg-red-700'
              : 'border-purple-700 bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
