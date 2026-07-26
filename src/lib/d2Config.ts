import { DEFAULT_DIAGRAM_THEME, type DiagramTheme } from './d2Themes'
import { scwThemeColors } from './scwGraphTheme'

export interface D2Config {
  diagramTheme: DiagramTheme
  layout: 'dagre' | 'elk'
  sketch: boolean
}

export const DEFAULT_D2_CONFIG: D2Config = {
  diagramTheme: DEFAULT_DIAGRAM_THEME,
  layout: 'dagre',
  sketch: false,
}

function formatColors(colors: Record<string, string>): string {
  return Object.entries(colors)
    .map(([key, value]) => `        ${key}: "${value}"`)
    .join('\n')
}

/**
 * Builds the `vars: { d2-config: {...} } }` block that carries diagram-level
 * settings (theme, layout engine, sketch mode) into the compiler. This used
 * to be spliced into the editable source itself (like scw-mermaid's
 * `%%{init}%%` directive), but a ~40-line color block above every diagram
 * makes the editor hard to read/edit — so instead it's kept as app state
 * (D2Config) and only prepended to the source right before compiling, never
 * written back into what the user sees or copies. The tradeoff: pasting
 * "Copy code" output into the D2 Playground/CLI reproduces the diagram's
 * shapes and connections, but not the Scaleway color theme — the theme is UI
 * state, not diagram content.
 *
 * D2 applies `theme-overrides` unless a `dark-theme-id` is also set, in
 * which case it switches to `dark-theme-overrides` — confirmed empirically,
 * since this isn't spelled out in the docs. That's what lets the Scaleway
 * theme's dark variant follow the app's own light/dark toggle.
 */
export function buildConfigPrelude(config: D2Config, uiTheme: 'light' | 'dark'): string {
  const lines = [`layout-engine: ${config.layout}`, `sketch: ${config.sketch}`]

  if (config.diagramTheme === 'scaleway') {
    lines.push(
      'theme-id: 0',
      ...(uiTheme === 'dark' ? ['dark-theme-id: 0'] : []),
      'theme-overrides: {',
      formatColors(scwThemeColors('light')),
      '}',
      'dark-theme-overrides: {',
      formatColors(scwThemeColors('dark')),
      '}',
    )
  } else {
    lines.push(`theme-id: ${config.diagramTheme}`)
  }

  return `vars: {
  d2-config: {
${lines.map((l) => `    ${l}`).join('\n')}
  }
}
`
}
