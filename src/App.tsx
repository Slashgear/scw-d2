import { useEffect, useRef, useState } from 'react'
import { D2Settings } from './components/D2Settings'
import { Editor } from './components/Editor'
import { IconBrowser } from './components/IconBrowser'
import { Preview } from './components/Preview'
import { Sidebar } from './components/Sidebar'
import { Toolbar, type ToolbarPanel } from './components/Toolbar'
import { buildConfigPrelude, DEFAULT_D2_CONFIG, type D2Config } from './lib/d2Config'
import { D2_BUILTIN_THEMES } from './lib/d2Themes'
import {
  createDocument,
  deleteDocument,
  duplicateDocument,
  getAllDocuments,
  getLastOpenDocId,
  parseImportedFile,
  putDocument,
  setLastOpenDocId,
  type D2Document,
} from './lib/documents'
import { EXAMPLES } from './lib/examples'
import { exportDocument, exportLibrary } from './lib/export'
import { renderD2 } from './lib/renderD2'
import { readDocIdFromUrl, readStateFromUrl, writeDocIdToUrl } from './lib/share'
import { useTheme } from './lib/theme'
import { useDebouncedValue } from './lib/useDebouncedValue'

const initialUrlState = readStateFromUrl()
const SIDEBAR_OPEN_KEY = 'scw-d2:sidebar-open'

function App() {
  const { theme, toggleTheme, setTheme } = useTheme()
  const [documents, setDocuments] = useState<D2Document[]>([])
  const [currentDocId, setCurrentDocId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [code, setCode] = useState('')
  const [config, setConfig] = useState<D2Config>(DEFAULT_D2_CONFIG)
  const [activePanel, setActivePanel] = useState<ToolbarPanel>(null)
  const [sidebarOpen, setSidebarOpen] = useState(() => localStorage.getItem(SIDEBAR_OPEN_KEY) === '1')
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const debouncedCode = useDebouncedValue(code, 300)
  const appliedUrlTheme = useRef(false)
  const documentsRef = useRef<D2Document[]>([])

  useEffect(() => {
    documentsRef.current = documents
  }, [documents])

  // Apply a theme carried in the share URL exactly once, on first load.
  useEffect(() => {
    if (appliedUrlTheme.current) return
    appliedUrlTheme.current = true
    if (initialUrlState.theme) setTheme(initialUrlState.theme)
  }, [setTheme])

  useEffect(() => {
    localStorage.setItem(SIDEBAR_OPEN_KEY, sidebarOpen ? '1' : '0')
  }, [sidebarOpen])

  function openDocument(doc: D2Document) {
    setCurrentDocId(doc.id)
    setCode(doc.code)
    setConfig(doc.config)
    setActivePanel(null)
  }

  // Load the document library once on mount, then figure out which document
  // should be active: a bookmarked `?doc=<id>`, an incoming `?code=...` share
  // link (imported as a new document), the last-opened document, the most
  // recently updated one, or — on a first-ever visit — a seeded default.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const docs = await getAllDocuments()
      if (cancelled) return

      let activeDocs = docs
      let active: D2Document

      const urlDocId = readDocIdFromUrl()
      const fromUrl = urlDocId ? docs.find((d) => d.id === urlDocId) : undefined

      if (fromUrl) {
        active = fromUrl
      } else if (initialUrlState.code) {
        active = createDocument('Shared diagram', initialUrlState.code, initialUrlState.config)
        await putDocument(active)
        activeDocs = [...docs, active]
      } else {
        const lastId = getLastOpenDocId()
        const lastDoc = lastId ? docs.find((d) => d.id === lastId) : undefined
        if (lastDoc) {
          active = lastDoc
        } else if (docs.length > 0) {
          active = [...docs].sort((a, b) => b.updatedAt - a.updatedAt)[0]
        } else {
          active = createDocument('Untitled diagram', EXAMPLES[0].code)
          await putDocument(active)
          activeDocs = [active]
        }
      }

      if (cancelled) return
      setDocuments(activeDocs)
      setCurrentDocId(active.id)
      setCode(active.code)
      setConfig(active.config)
      setLastOpenDocId(active.id)
      writeDocIdToUrl(active.id)
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!ready) return
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
  }, [ready, debouncedCode, config, theme])

  // Autosave: IndexedDB is the source of truth now, so every debounced edit
  // (code or settings) is persisted against the currently open document.
  useEffect(() => {
    if (!ready || !currentDocId) return
    const current = documentsRef.current.find((d) => d.id === currentDocId)
    if (!current) return
    const updated: D2Document = { ...current, code: debouncedCode, config, updatedAt: Date.now() }
    putDocument(updated)
    setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
  }, [ready, debouncedCode, config, currentDocId])

  useEffect(() => {
    if (!ready || !currentDocId) return
    setLastOpenDocId(currentDocId)
    writeDocIdToUrl(currentDocId)
  }, [ready, currentDocId])

  function handleSelectDocument(id: string) {
    const doc = documents.find((d) => d.id === id)
    if (doc) openDocument(doc)
  }

  function handleCreateDocument() {
    const doc = createDocument('Untitled diagram', '')
    putDocument(doc)
    setDocuments((prev) => [...prev, doc])
    openDocument(doc)
  }

  function handleLoadExample(exampleCode: string) {
    const doc = createDocument('Untitled diagram', exampleCode)
    putDocument(doc)
    setDocuments((prev) => [...prev, doc])
    openDocument(doc)
  }

  function handleDuplicateDocument(id: string) {
    const doc = documents.find((d) => d.id === id)
    if (!doc) return
    const copy = duplicateDocument(doc)
    putDocument(copy)
    setDocuments((prev) => [...prev, copy])
    openDocument(copy)
  }

  function handleRenameDocument(id: string, name: string) {
    const doc = documents.find((d) => d.id === id)
    if (!doc) return
    const updated = { ...doc, name, updatedAt: Date.now() }
    putDocument(updated)
    setDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)))
  }

  function handleDeleteDocument(id: string) {
    const remaining = documents.filter((d) => d.id !== id)
    deleteDocument(id)

    if (remaining.length === 0) {
      const seeded = createDocument('Untitled diagram', EXAMPLES[0].code)
      putDocument(seeded)
      setDocuments([seeded])
      openDocument(seeded)
      return
    }

    setDocuments(remaining)
    if (id === currentDocId) {
      const fallback = [...remaining].sort((a, b) => b.updatedAt - a.updatedAt)[0]
      openDocument(fallback)
    }
  }

  async function handleImportFile(file: File) {
    try {
      const imported = await parseImportedFile(file)
      await Promise.all(imported.map(putDocument))
      setDocuments((prev) => [...prev, ...imported])
      const last = imported.at(-1)
      if (last) openDocument(last)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to import file')
    }
  }

  function handleExportOneDocument(id: string) {
    const doc = documents.find((d) => d.id === id)
    if (doc) exportDocument(doc)
  }

  function handleExportAllDocuments() {
    exportLibrary(documents)
  }

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
          <a
            href="./privacy-policy.html"
            className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Privacy
          </a>
          <a
            href="https://github.com/Slashgear/scw-d2"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
            className="rounded-md border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
          </a>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="flex min-h-0 flex-1">
        {currentDocId && (
          <Sidebar
            open={sidebarOpen}
            onToggleOpen={() => setSidebarOpen((prev) => !prev)}
            documents={documents}
            currentDocId={currentDocId}
            onSelectDocument={handleSelectDocument}
            onCreateDocument={handleCreateDocument}
            onDuplicateDocument={handleDuplicateDocument}
            onRenameDocument={handleRenameDocument}
            onDeleteDocument={handleDeleteDocument}
            onImportFile={handleImportFile}
            onExportDocument={handleExportOneDocument}
            onExportAllDocuments={handleExportAllDocuments}
            onLoadExample={handleLoadExample}
          />
        )}

        <div className="flex min-h-0 flex-1 flex-col border-r border-slate-200 dark:border-slate-800">
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
          />
        </div>

        <div className="min-h-0 flex-1">
          <Preview svg={svg} error={error} />
        </div>
      </main>
    </div>
  )
}

export default App
