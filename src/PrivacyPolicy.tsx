const LAST_UPDATED = '2026-08-05'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{children}</div>
    </section>
  )
}

function PrivacyPolicy() {
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

      <main className="mx-auto max-w-2xl space-y-8 px-4 py-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Privacy Policy</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Last updated: {LAST_UPDATED}</p>
        </div>

        <Section title="Summary">
          <p>
            This app is a fully static, client-side application. There is no backend server, no
            database, and no user accounts. Everything — parsing your D2 source, compiling it, and
            rendering the diagram — happens entirely inside your browser. Nothing you type or
            generate here is sent to, or stored on, any server we operate.
          </p>
        </Section>

        <Section title="How the app works">
          <p>
            Diagram rendering is powered by{' '}
            <a
              href="https://github.com/terrastruct/d2/tree/master/d2js/js"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-700 underline hover:no-underline dark:text-purple-400"
            >
              @terrastruct/d2
            </a>
            , a WebAssembly build of the D2 compiler that runs locally on your machine — the same
            approach used by the official{' '}
            <a
              href="https://play.d2lang.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-700 underline hover:no-underline dark:text-purple-400"
            >
              D2 Playground
            </a>
            . Your diagram source code, the rendered SVG, and any exports (SVG/PNG) never leave
            your device.
          </p>
        </Section>

        <Section title="What's stored, and where">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Theme preference</strong> (light/dark) is saved in your browser's{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">
                localStorage
              </code>
              . It stays on your device and is never transmitted anywhere.
            </li>
            <li>
              <strong>Diagram state</strong> (your D2 source, diagram theme, and layout settings) is
              encoded directly into the page's URL — that's how the "Copy link" feature lets you
              share a diagram. That URL is only ever sent anywhere if you choose to share it
              yourself; we don't collect, log, or have access to it.
            </li>
          </ul>
        </Section>

        <Section title="Network requests">
          <p>
            Like any website, your browser downloads the app's files (HTML, JS, CSS, icons, fonts)
            once when you load the page. After that, no diagram content, source code, or usage data
            is ever sent to a server as you use the editor. We don't run analytics, don't use
            cookies, and don't include any third-party tracking scripts.
          </p>
        </Section>

        <Section title="Hosting">
          <p>
            This site is served as static files by our hosting provider (GitHub Pages). We don't run
            any server-side logic ourselves, but as with any website, standard web requests to load
            the page are handled by that provider and may appear in its infrastructure-level access
            logs (e.g. IP address, browser type) — see{' '}
            <a
              href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-700 underline hover:no-underline dark:text-purple-400"
            >
              GitHub's Privacy Statement
            </a>{' '}
            for details on that.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            If this app's data handling ever changes, this page will be updated to reflect it. Since
            the project is open source, you can also verify any of the above yourself in the{' '}
            <a
              href="https://github.com/Slashgear/scw-d2"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-700 underline hover:no-underline dark:text-purple-400"
            >
              source code
            </a>
            .
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions? Open an issue on{' '}
            <a
              href="https://github.com/Slashgear/scw-d2/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-700 underline hover:no-underline dark:text-purple-400"
            >
              GitHub
            </a>
            .
          </p>
        </Section>
      </main>
    </div>
  )
}

export default PrivacyPolicy
