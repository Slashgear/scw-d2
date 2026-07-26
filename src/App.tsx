import { useEffect, useRef, useState } from 'react'
import { D2Settings } from './components/D2Settings'
import { Editor } from './components/Editor'
import { IconBrowser } from './components/IconBrowser'
import { Preview } from './components/Preview'
import { Toolbar, type ToolbarPanel } from './components/Toolbar'
import { buildConfigPrelude, type D2Config } from './lib/d2Config'
import { D2_BUILTIN_THEMES } from './lib/d2Themes'
import { EXAMPLES } from './lib/examples'
import { renderD2 } from './lib/renderD2'
import { readStateFromUrl, writeStateToUrl } from './lib/share'
import { useTheme } from './lib/theme'
import { useDebouncedValue } from './lib/useDebouncedValue'

const initialUrlState = readStateFromUrl()

function App() {
  const { theme, toggleTheme, setTheme } = useTheme()
  const [code, setCode] = useState(initialUrlState.code ?? EXAMPLES[0].code)
  const [config, setConfig] = useState<D2Config>(initialUrlState.config)
  const [activePanel, setActivePanel] = useState<ToolbarPanel>(null)
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const debouncedCode = useDebouncedValue(code, 300)
  const appliedUrlTheme = useRef(false)

  // Apply a theme carried in the share URL exactly once, on first load.
  useEffect(() => {
    if (appliedUrlTheme.current) return
    appliedUrlTheme.current = true
    if (initialUrlState.theme) setTheme(initialUrlState.theme)
  }, [setTheme])

  useEffect(() => {
    let cancelled = false
    // Diagram settings (theme, layout engine, sketch mode) are app state, not
    // part of `code` — they're prepended only for compilation, so the editor
    // stays free of a ~40-line color block and "Copy code" gives back a
    // clean diagram. See d2Config.ts for the tradeoff this implies.
    const source = buildConfigPrelude(config, theme) + debouncedCode
    renderD2(source).then((result) => {
      if (cancelled) return
      if ('svg' in result) {
        setSvg(result.svg)
        setError(null)
      } else {
        setError(result.error)
      }
    })
    return () => {
      cancelled = true
    }
  }, [debouncedCode, config, theme])

  useEffect(() => {
    writeStateToUrl(debouncedCode, theme, config)
  }, [debouncedCode, theme, config])

  return (
    <div className="flex h-screen w-screen flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-purple-700 focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to editor
      </a>
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-2 dark:border-slate-800">
        <h1 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200">
          Scaleway D2 Diagram Editor
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-purple-700 uppercase dark:bg-purple-900/50 dark:text-purple-300">
            Beta
          </span>
        </h1>
        <div className="flex items-center gap-2">
          <select
            aria-label="Diagram theme"
            value={config.diagramTheme}
            onChange={(e) =>
              setConfig({
                ...config,
                diagramTheme: e.target.value === 'scaleway' ? 'scaleway' : Number(e.target.value),
              })
            }
            className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <option value="scaleway">Scaleway (default)</option>
            <optgroup label="D2 built-in — light">
              {D2_BUILTIN_THEMES.filter((t) => !t.dark).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="D2 built-in — dark">
              {D2_BUILTIN_THEMES.filter((t) => t.dark).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </optgroup>
          </select>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="flex min-h-0 flex-1">
        <div className="flex min-h-0 w-1/2 flex-col border-r border-slate-200 dark:border-slate-800">
          <div className="min-h-0 flex-1 overflow-hidden">
            <Editor value={code} onChange={setCode} />
          </div>
          {activePanel === 'layout' && (
            <D2Settings config={config} onChange={setConfig} onClose={() => setActivePanel(null)} />
          )}
          {activePanel === 'icons' && <IconBrowser onClose={() => setActivePanel(null)} />}
          <Toolbar
            code={code}
            svg={svg}
            theme={theme}
            config={config}
            activePanel={activePanel}
            onTogglePanel={(panel) => setActivePanel((prev) => (prev === panel ? null : panel))}
            onLoadExample={setCode}
          />
        </div>

        <div className="min-h-0 w-1/2">
          <Preview svg={svg} error={error} />
        </div>
      </main>
    </div>
  )
}

export default App
