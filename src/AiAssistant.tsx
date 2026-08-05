import { useState } from 'react'
import { DIAGRAM_PROMPT } from './lib/aiPrompt'
import { SCW_ICON_NAMES, scwIconUrl } from './lib/scwIcons'

const DOCS_LINKS = [
  { label: 'D2 syntax tour', href: 'https://d2lang.com/tour/intro' },
  { label: 'D2 icons reference', href: 'https://d2lang.com/tour/icons' },
  { label: 'D2 themes reference', href: 'https://d2lang.com/tour/themes' },
  { label: 'D2 playground', href: 'https://play.d2lang.com' },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{children}</div>
    </section>
  )
}

function AiAssistant() {
  const [promptCopied, setPromptCopied] = useState(false)
  const [iconFilter, setIconFilter] = useState('')
  const [iconCopied, setIconCopied] = useState<string | null>(null)

  const filteredIcons = SCW_ICON_NAMES.filter((name) => name.includes(iconFilter.trim().toLowerCase()))

  async function handleCopyPrompt() {
    await navigator.clipboard.writeText(DIAGRAM_PROMPT)
    setPromptCopied(true)
    setTimeout(() => setPromptCopied(false), 1500)
  }

  async function handleCopyIcon(name: string) {
    await navigator.clipboard.writeText(`scw:${name}`)
    setIconCopied(name)
    setTimeout(() => setIconCopied(null), 1200)
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-2 dark:border-slate-800">
        <p className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200">
          Scaleway D2 Diagram Editor
        </p>
        <a
          href="./"
          className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          ← Back to editor
        </a>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">AI assistant</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            A ready-to-copy prompt that helps any AI assistant (Claude, ChatGPT, …) co-author a D2 diagram with
            you — from a description, a back-and-forth conversation, or a screenshot of the architecture you want
            reproduced.
          </p>
        </div>

        <Section title="How to use it">
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>Copy the prompt below.</li>
            <li>
              Paste it into your AI assistant of choice — optionally attach a screenshot or photo of the
              architecture you want to reproduce.
            </li>
            <li>
              Answer any clarifying questions it asks, then copy the D2 code it gives you back into the editor.
            </li>
          </ol>
        </Section>

        <Section title="The prompt">
          <button
            type="button"
            onClick={handleCopyPrompt}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {promptCopied ? 'Copied!' : 'Copy prompt'}
          </button>
          <pre className="max-h-96 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-xs whitespace-pre-wrap text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            {DIAGRAM_PROMPT}
          </pre>
        </Section>

        <Section title="Official D2 docs">
          <ul className="list-disc space-y-1 pl-5">
            {DOCS_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-700 underline hover:no-underline dark:text-purple-400"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Available icons">
          <p>
            The prompt above already includes the full list, but you can browse it here too. Click an icon to
            copy its <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">scw:name</code>{' '}
            reference.
          </p>
          <input
            type="text"
            value={iconFilter}
            onChange={(e) => setIconFilter(e.target.value)}
            placeholder="Filter…"
            aria-label="Filter icons"
            className="w-40 rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <div className="grid grid-cols-4 gap-1 sm:grid-cols-6 md:grid-cols-8">
            {filteredIcons.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => handleCopyIcon(name)}
                title={`scw:${name}`}
                className="flex flex-col items-center gap-1 rounded p-1.5 text-center hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <img src={scwIconUrl(name)} alt="" className="h-6 w-6" />
                <span className="w-full truncate text-[10px] text-slate-600 dark:text-slate-300">
                  {iconCopied === name ? 'Copied!' : name}
                </span>
              </button>
            ))}
            {filteredIcons.length === 0 && (
              <p className="col-span-full py-2 text-center text-xs text-slate-500 dark:text-slate-400">
                No icons match "{iconFilter}"
              </p>
            )}
          </div>
        </Section>
      </main>
    </div>
  )
}

export default AiAssistant
