interface CheatsheetEntry {
  syntax: string
  description: string
}

const ENTRIES: CheatsheetEntry[] = [
  { syntax: 'name: Label', description: 'Declare a shape with a label' },
  { syntax: 'parent.child: Label', description: 'Nest a shape inside another (creates a container)' },
  { syntax: 'a -> b', description: 'Connect two shapes with an arrow' },
  { syntax: 'a -> b: label', description: 'Label a connection' },
  { syntax: 'a -- b', description: 'Connect two shapes without an arrow' },
  {
    syntax: 'name: Label { icon: scw:<name> }',
    description: 'Attach a Scaleway icon — see the Icons panel for the full list',
  },
  { syntax: '# comment', description: 'A comment line, ignored by the compiler' },
]

interface CheatsheetProps {
  onClose: () => void
}

export function Cheatsheet({ onClose }: CheatsheetProps) {
  return (
    <div className="border-t border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-wide text-slate-600 uppercase dark:text-slate-400">
          D2 cheatsheet
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close D2 cheatsheet"
          className="flex h-6 w-6 items-center justify-center rounded text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
        >
          ✕
        </button>
      </div>

      <ul className="grid max-h-48 grid-cols-1 gap-x-6 gap-y-1.5 overflow-y-auto sm:grid-cols-2">
        {ENTRIES.map((entry) => (
          <li key={entry.syntax} className="flex items-baseline gap-2 text-xs">
            <code className="shrink-0 rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[11px] text-slate-800 dark:bg-slate-800 dark:text-slate-100">
              {entry.syntax}
            </code>
            <span className="text-slate-600 dark:text-slate-300">{entry.description}</span>
          </li>
        ))}
      </ul>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Full syntax reference:{' '}
        <a
          href="https://d2lang.com/tour/intro"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-700 underline hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-100"
        >
          D2 docs ↗
        </a>
      </p>
    </div>
  )
}
