import { D2 } from '@terrastruct/d2'
import { resolveScwIcons } from './scwIcons'

let instance: D2 | null = null

function getD2(): D2 {
  instance ??= new D2()
  return instance
}

// The D2.js worker wrapper keeps a single in-flight resolver per instance, so
// two concurrent compile/render pipelines against the same instance race and
// can resolve each other's promises (e.g. React StrictMode double-invoking
// effects in dev). Serialize all calls through one queue to avoid that.
let queue: Promise<unknown> = Promise.resolve()

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const result = queue.then(task)
  queue = result.catch(() => undefined)
  return result
}

export async function renderD2(code: string): Promise<{ svg: string } | { error: string }> {
  try {
    const svg = await enqueue(async () => {
      const d2 = getD2()
      const compiled = await d2.compile(resolveScwIcons(code))
      return d2.render(compiled.diagram, compiled.renderOptions)
    })
    return { svg }
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) }
  }
}
