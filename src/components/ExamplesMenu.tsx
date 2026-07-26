import { EXAMPLES } from '../lib/examples'

interface ExamplesMenuProps {
  onSelect: (code: string) => void
}

export function ExamplesMenu({ onSelect }: ExamplesMenuProps) {
  return (
    <select
      aria-label="Load an example diagram"
      value=""
      onChange={(e) => {
        const example = EXAMPLES.find((ex) => ex.id === e.target.value)
        if (example) onSelect(example.code)
        e.target.value = ''
      }}
      className="h-9 shrink-0 rounded-md border border-slate-300 bg-white px-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
    >
      <option value="" disabled>
        Examples…
      </option>
      {EXAMPLES.map((example) => (
        <option key={example.id} value={example.id}>
          {example.label}
        </option>
      ))}
    </select>
  )
}
