import { useRef, useState } from 'react'
import type { D2Document } from '../lib/documents'
import { EXAMPLES } from '../lib/examples'

interface SidebarProps {
  open: boolean
  onToggleOpen: () => void
  documents: D2Document[]
  currentDocId: string
  onSelectDocument: (id: string) => void
  onCreateDocument: () => void
  onDuplicateDocument: (id: string) => void
  onRenameDocument: (id: string, name: string) => void
  onDeleteDocument: (id: string) => void
  onImportFile: (file: File) => void
  onExportDocument: (id: string) => void
  onExportAllDocuments: () => void
  onLoadExample: (code: string) => void
}

function formatUpdatedAt(timestamp: number): string {
  const seconds = Math.round((Date.now() - timestamp) / 1000)
  if (seconds < 5) return 'just now'
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, secondsInUnit] of units) {
    const value = Math.floor(seconds / secondsInUnit)
    if (value >= 1) {
      return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-value, unit)
    }
  }
  return 'just now'
}

export function Sidebar({
  open,
  onToggleOpen,
  documents,
  currentDocId,
  onSelectDocument,
  onCreateDocument,
  onDuplicateDocument,
  onRenameDocument,
  onDeleteDocument,
  onImportFile,
  onExportDocument,
  onExportAllDocuments,
  onLoadExample,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!open) {
    return (
      <div className="flex w-9 shrink-0 flex-col items-center border-r border-slate-200 bg-slate-50 py-2 dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          onClick={onToggleOpen}
          aria-label="Open sidebar"
          title="Open sidebar"
          className="flex h-7 w-7 items-center justify-center rounded text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          »
        </button>
      </div>
    )
  }

  const sorted = [...documents].sort((a, b) => b.updatedAt - a.updatedAt)

  function startRename(doc: D2Document) {
    setEditingId(doc.id)
    setDraftName(doc.name)
  }

  function commitRename() {
    if (editingId && draftName.trim()) {
      onRenameDocument(editingId, draftName.trim())
    }
    setEditingId(null)
  }

  function handleImportChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onImportFile(file)
    e.target.value = ''
  }

  function handleDelete(doc: D2Document) {
    if (window.confirm(`Delete "${doc.name}"? This can't be undone.`)) {
      onDeleteDocument(doc.id)
    }
  }

  return (
    <div className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-1 border-b border-slate-200 px-2 py-2 dark:border-slate-800">
        <button
          type="button"
          onClick={onToggleOpen}
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
          className="flex h-6 w-6 items-center justify-center rounded text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          «
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onCreateDocument}
            className="rounded px-1.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            + New
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded px-1.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Import…
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={onExportAllDocuments}
            className="rounded px-1.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Export all
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        <h2 className="mb-1 px-1 text-[10px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
          My diagrams
        </h2>
        <ul className="space-y-0.5">
          {sorted.map((doc) => (
            <li
              key={doc.id}
              className={`group flex items-center gap-1 rounded-md px-1.5 py-1 ${
                doc.id === currentDocId
                  ? 'bg-purple-100 dark:bg-purple-900/50'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {editingId === doc.id ? (
                <input
                  autoFocus
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename()
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  className="min-w-0 flex-1 rounded border border-slate-300 bg-white px-1 py-0.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => onSelectDocument(doc.id)}
                  onDoubleClick={() => startRename(doc)}
                  className={`min-w-0 flex-1 truncate text-left text-xs ${
                    doc.id === currentDocId
                      ? 'font-medium text-purple-800 dark:text-purple-200'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}
                  title={`${doc.name} · ${formatUpdatedAt(doc.updatedAt)}`}
                >
                  {doc.name}
                </button>
              )}
              <div className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
                <button
                  type="button"
                  onClick={() => startRename(doc)}
                  aria-label={`Rename ${doc.name}`}
                  title="Rename"
                  className="text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  ✎
                </button>
                <button
                  type="button"
                  onClick={() => onDuplicateDocument(doc.id)}
                  aria-label={`Duplicate ${doc.name}`}
                  title="Duplicate"
                  className="text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  ⧉
                </button>
                <button
                  type="button"
                  onClick={() => onExportDocument(doc.id)}
                  aria-label={`Export ${doc.name}`}
                  title="Export"
                  className="text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  ⭳
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(doc)}
                  aria-label={`Delete ${doc.name}`}
                  title="Delete"
                  className="text-[11px] text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                >
                  🗑
                </button>
              </div>
            </li>
          ))}
          {sorted.length === 0 && (
            <li className="px-1 py-2 text-center text-xs text-slate-500 dark:text-slate-400">No diagrams yet</li>
          )}
        </ul>
      </div>

      <div className="border-t border-slate-200 p-2 dark:border-slate-800">
        <h2 className="mb-1 px-1 text-[10px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
          Examples
        </h2>
        <ul className="space-y-0.5">
          {EXAMPLES.map((example) => (
            <li key={example.id}>
              <button
                type="button"
                onClick={() => onLoadExample(example.code)}
                className="w-full truncate rounded-md px-1.5 py-1 text-left text-xs text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {example.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
