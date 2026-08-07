import { DEFAULT_D2_CONFIG, type D2Config } from '../lib/d2Config'

interface D2SettingsProps {
  config: D2Config
  onChange: (config: D2Config) => void
  onClose: () => void
}

export function D2Settings({ config, onChange, onClose }: D2SettingsProps) {
  return (
    <div className="border-t border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-wide text-slate-600 uppercase dark:text-slate-400">
          Diagram layout
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_D2_CONFIG, diagramTheme: config.diagramTheme })}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Reset to defaults
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close diagram layout settings"
            className="flex h-6 w-6 items-center justify-center rounded text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <label className="flex min-h-6 items-center justify-between gap-2 text-xs">
          <span className="text-slate-600 dark:text-slate-300" title="dagre is faster; elk handles dense graphs better">
            Layout engine
          </span>
          <select
            value={config.layout}
            onChange={(e) => onChange({ ...config, layout: e.target.value as D2Config['layout'] })}
            className="rounded border border-slate-500 bg-white px-1.5 py-1 text-slate-800 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="dagre">dagre</option>
            <option value="elk">elk</option>
          </select>
        </label>

        <label className="flex min-h-6 items-center justify-between gap-2 text-xs">
          <span className="text-slate-600 dark:text-slate-300" title="Hand-drawn rendering style">
            Sketch mode
          </span>
          <input
            type="checkbox"
            checked={config.sketch}
            onChange={(e) => onChange({ ...config, sketch: e.target.checked })}
            className="h-4 w-4"
          />
        </label>
      </div>
    </div>
  )
}
