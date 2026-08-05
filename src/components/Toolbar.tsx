import { useState } from 'react'
import type { D2Config } from '../lib/d2Config'
import { exportPng, exportSvg } from '../lib/export'
import { buildShareUrl } from '../lib/share'
import type { Theme } from '../lib/theme'

export type ToolbarPanel = 'layout' | 'icons' | 'cheatsheet' | null

interface ToolbarProps {
  code: string
  svg: string | null
  theme: Theme
  config: D2Config
  activePanel: ToolbarPanel
  onTogglePanel: (panel: 'layout' | 'icons' | 'cheatsheet') => void
}

type Feedback = { label: string; key: number } | null

export function Toolbar({ code, svg, theme, config, activePanel, onTogglePanel }: ToolbarProps) {
  const [feedback, setFeedback] = useState<Feedback>(null)

  function flash(label: string) {
    setFeedback({ label, key: Date.now() })
    setTimeout(() => setFeedback(null), 1500)
  }

  async function handleCopyCode() {
    await navigator.clipboard.writeText(code)
    flash('Code copied')
  }

  async function handleCopyShareLink() {
    await navigator.clipboard.writeText(buildShareUrl(code, theme, config))
    flash('Link copied')
  }

  async function handleExportSvg() {
    if (!svg) return
    await exportSvg(svg)
    flash('SVG exported')
  }

  async function handleExportPng() {
    if (!svg) return
    await exportPng(svg)
    flash('PNG exported')
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
      <ToolbarButton onClick={handleCopyCode} label="Copy code" />
      <ToolbarButton onClick={handleCopyShareLink} label="Share" />
      <ToolbarButton onClick={handleExportSvg} label="Export SVG" disabled={!svg} />
      <ToolbarButton onClick={handleExportPng} label="Export PNG" disabled={!svg} />
      <ToolbarButton onClick={() => onTogglePanel('icons')} label="Icons" active={activePanel === 'icons'} />
      <ToolbarButton
        onClick={() => onTogglePanel('cheatsheet')}
        label="Cheatsheet"
        active={activePanel === 'cheatsheet'}
      />
      <ToolbarButton onClick={() => onTogglePanel('layout')} label="Layout" active={activePanel === 'layout'} />
      <a
        href="https://d2lang.com/tour/intro"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 text-xs font-medium text-slate-500 underline hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        D2 docs ↗
      </a>
      <span
        className={`text-xs text-slate-500 transition-opacity duration-300 dark:text-slate-400 ${
          feedback ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {feedback?.label}
      </span>
    </div>
  )
}

function ToolbarButton({
  onClick,
  label,
  disabled,
  active,
}: {
  onClick: () => void
  label: string
  disabled?: boolean
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`shrink-0 rounded-md border px-3 py-1.5 text-sm font-medium whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'border-purple-300 bg-purple-100 text-purple-800 dark:border-purple-700 dark:bg-purple-900/50 dark:text-purple-200'
          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  )
}
