import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import { DEFAULT_D2_CONFIG, type D2Config } from './d2Config'
import type { Theme } from './theme'

const CODE_PARAM = 'code'
const THEME_PARAM = 'theme'
const DIAGRAM_THEME_PARAM = 'dtheme'
const LAYOUT_PARAM = 'layout'
const SKETCH_PARAM = 'sketch'

export interface DiagramState {
  code: string | null
  theme: Theme | null
  config: D2Config
}

export function readStateFromUrl(): DiagramState {
  const params = new URLSearchParams(window.location.search)

  const encodedCode = params.get(CODE_PARAM)
  const code = encodedCode ? decompressFromEncodedURIComponent(encodedCode) : null

  const themeParam = params.get(THEME_PARAM)
  const theme = themeParam === 'dark' || themeParam === 'light' ? themeParam : null

  const diagramThemeParam = params.get(DIAGRAM_THEME_PARAM)
  const diagramTheme =
    diagramThemeParam === 'scaleway'
      ? 'scaleway'
      : diagramThemeParam && !Number.isNaN(Number(diagramThemeParam))
        ? Number(diagramThemeParam)
        : DEFAULT_D2_CONFIG.diagramTheme

  const layoutParam = params.get(LAYOUT_PARAM)
  const layout = layoutParam === 'dagre' || layoutParam === 'elk' ? layoutParam : DEFAULT_D2_CONFIG.layout

  const sketch = params.get(SKETCH_PARAM) === '1'

  return { code, theme, config: { diagramTheme, layout, sketch } }
}

function buildParams(code: string, theme: Theme, config: D2Config): URLSearchParams {
  const params = new URLSearchParams()
  params.set(CODE_PARAM, compressToEncodedURIComponent(code))
  params.set(THEME_PARAM, theme)
  params.set(DIAGRAM_THEME_PARAM, String(config.diagramTheme))
  params.set(LAYOUT_PARAM, config.layout)
  if (config.sketch) params.set(SKETCH_PARAM, '1')
  return params
}

/** Replaces the current URL's query params without adding a history entry. */
export function writeStateToUrl(code: string, theme: Theme, config: D2Config) {
  const params = buildParams(code, theme, config)
  const url = `${window.location.pathname}?${params.toString()}${window.location.hash}`
  window.history.replaceState(null, '', url)
}

export function buildShareUrl(code: string, theme: Theme, config: D2Config): string {
  const params = buildParams(code, theme, config)
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`
}
