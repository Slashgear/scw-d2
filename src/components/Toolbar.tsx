import type { D2Config } from '../lib/d2Config'
import { exportPng, exportSvg } from '../lib/export'
import { buildShareUrl } from '../lib/share'
import { useToast } from '../lib/toast'
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

export function Toolbar({ code, svg, theme, config, activePanel, onTogglePanel }: ToolbarProps) {
  const { show } = useToast()

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(code)
      show('Code copied')
    } catch {
      show('Failed to copy code', 'error')
    }
  }

  async function handleCopyShareLink() {
    try {
      await navigator.clipboard.writeText(buildShareUrl(code, theme, config))
      show('Link copied')
    } catch {
      show('Failed to copy link', 'error')
    }
  }

  async function handleExportSvg() {
    if (!svg) return
    try {
      await exportSvg(svg)
      show('SVG exported')
    } catch {
      show('Failed to export SVG', 'error')
    }
  }

  async function handleExportPng() {
    if (!svg) return
    try {
      await exportPng(svg)
      show('PNG exported')
    } catch {
      show('Failed to export PNG', 'error')
    }
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
      aria-expanded={active}
      className={`shrink-0 rounded-md border px-3 py-1.5 text-sm font-medium whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'border-purple-300 bg-purple-100 text-purple-800 dark:border-purple-700 dark:bg-purple-900/50 dark:text-purple-200'
          : 'border-slate-500 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  )
}
