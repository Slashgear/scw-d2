import { useState } from 'react'
import { SCW_ICON_NAMES, scwIconUrl } from '../lib/scwIcons'
import { usePanelFocus } from '../lib/usePanelFocus'

interface IconBrowserProps {
  onClose: () => void
}

export function IconBrowser({ onClose }: IconBrowserProps) {
  const [filter, setFilter] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const { headingRef, onKeyDown } = usePanelFocus(onClose)

  const names = SCW_ICON_NAMES.filter((name) => name.includes(filter.trim().toLowerCase()))

  async function handleCopy(name: string) {
    await navigator.clipboard.writeText(`scw:${name}`)
    setCopied(name)
    setTimeout(() => setCopied(null), 1200)
  }

  return (
    <div className="border-t border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900" onKeyDown={onKeyDown}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-xs font-semibold tracking-wide text-slate-600 uppercase dark:text-slate-400"
        >
          Scaleway icons
        </h2>
        <div className="flex flex-1 items-center justify-end gap-3">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter…"
            aria-label="Filter icons"
            className="w-40 rounded border border-slate-500 bg-white px-2 py-1 text-xs text-slate-800 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close icon browser"
            className="flex h-6 w-6 items-center justify-center rounded text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
          >
            ✕
          </button>
        </div>
      </div>

      <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
        Click an icon to copy its <code>scw:name</code> reference. Full syntax reference:{' '}
        <a
          href="https://d2lang.com/tour/icons"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-700 underline hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-100"
        >
          D2 icons docs ↗
        </a>
      </p>

      <div className="grid max-h-48 grid-cols-4 gap-1 overflow-y-auto sm:grid-cols-6 md:grid-cols-8">
        {names.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => handleCopy(name)}
            title={`scw:${name}`}
            className="flex flex-col items-center gap-1 rounded p-1.5 text-center hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <img src={scwIconUrl(name)} alt="" className="h-6 w-6" />
            <span className="w-full truncate text-[10px] text-slate-600 dark:text-slate-300">
              {copied === name ? 'Copied!' : name}
            </span>
          </button>
        ))}
        {names.length === 0 && (
          <p className="col-span-full py-2 text-center text-xs text-slate-500 dark:text-slate-400">
            No icons match "{filter}"
          </p>
        )}
      </div>
    </div>
  )
}
