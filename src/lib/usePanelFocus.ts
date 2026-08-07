import { useEffect, useRef, type KeyboardEvent } from 'react'

/**
 * Shared open/close focus behavior for the toolbar's non-modal disclosure
 * panels (D2Settings, IconBrowser, Cheatsheet): move focus onto the panel's
 * own heading when it mounts — mirroring the same tabIndex={-1} pattern
 * already used for the "Skip to editor" target in App.tsx — announcing the
 * panel to screen-reader users without landing on an arbitrary (sometimes
 * destructive, e.g. "Reset to defaults") first control; return focus to
 * whatever opened it when it unmounts; and close on Escape while focus is
 * inside it.
 */
export function usePanelFocus(onClose: () => void) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null
    headingRef.current?.focus()
    return () => trigger?.focus()
  }, [])

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
    }
  }

  return { headingRef, onKeyDown }
}
