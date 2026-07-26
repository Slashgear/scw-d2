import { useEffect, useRef, useState } from 'react'

interface PreviewProps {
  svg: string | null
  error: string | null
}

const MIN_SCALE = 0.2
const MAX_SCALE = 4

export function Preview({ svg, error }: PreviewProps) {
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragState = useRef<{ startX: number; startY: number; origin: { x: number; y: number } } | null>(
    null,
  )
  const viewportRef = useRef<HTMLDivElement | null>(null)

  function resetView() {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }

  function zoomBy(factor: number) {
    setScale((prev) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev * factor)))
  }

  // React's onWheel is registered as a passive listener, so preventDefault()
  // there is a no-op (and logs a console warning). Attach a native listener
  // instead so scrolling the diagram doesn't also scroll the page.
  useEffect(() => {
    const node = viewportRef.current
    if (!node) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      zoomBy(e.deltaY > 0 ? 0.9 : 1.1)
    }
    node.addEventListener('wheel', onWheel, { passive: false })
    return () => node.removeEventListener('wheel', onWheel)
  }, [])

  function handlePointerDown(e: React.PointerEvent) {
    dragState.current = { startX: e.clientX, startY: e.clientY, origin: offset }
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragState.current) return
    const { startX, startY, origin } = dragState.current
    setOffset({ x: origin.x + (e.clientX - startX), y: origin.y + (e.clientY - startY) })
  }

  function handlePointerUp() {
    dragState.current = null
  }

  return (
    <div className="relative flex h-full w-full flex-col bg-white dark:bg-[#151a2d]">
      <div
        ref={viewportRef}
        className="flex-1 cursor-grab overflow-hidden active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {svg && (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transformOrigin: 'center center',
            }}
            // D2 output is rendered locally, never from remote/user-uploaded HTML
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </div>

      {error && (
        <div className="absolute inset-x-4 bottom-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <p className="font-medium">Diagram error</p>
          <pre className="mt-1 whitespace-pre-wrap font-mono text-xs">{error}</pre>
        </div>
      )}

      <div className="absolute top-3 right-3 flex gap-1 rounded-lg border border-slate-200 bg-white/90 p-1 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
        <button
          type="button"
          onClick={() => zoomBy(1.2)}
          className="h-8 w-8 rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => zoomBy(0.8)}
          className="h-8 w-8 rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Zoom out"
        >
          −
        </button>
        <button
          type="button"
          onClick={resetView}
          className="h-8 w-8 rounded-md text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Reset view"
        >
          ⟲
        </button>
      </div>
    </div>
  )
}
