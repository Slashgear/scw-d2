/** D2's built-in numbered themes (oss.terrastruct.com/d2/d2themes/d2themescatalog). */
export interface D2BuiltinTheme {
  id: number
  name: string
  dark?: boolean
}

export const D2_BUILTIN_THEMES: D2BuiltinTheme[] = [
  { id: 0, name: 'Neutral Default' },
  { id: 1, name: 'Neutral Grey' },
  { id: 3, name: 'Flagship Terrastruct' },
  { id: 4, name: 'Cool Classics' },
  { id: 5, name: 'Mixed Berry Blue' },
  { id: 6, name: 'Grape Soda' },
  { id: 7, name: 'Aubergine' },
  { id: 8, name: 'Colorblind Clear' },
  { id: 100, name: 'Vanilla Nitro Cola' },
  { id: 101, name: 'Orange Creamsicle' },
  { id: 102, name: 'Shirley Temple' },
  { id: 103, name: 'Earth Tones' },
  { id: 104, name: 'Everglade Green' },
  { id: 105, name: 'Buttered Toast' },
  { id: 300, name: 'Terminal' },
  { id: 301, name: 'Terminal Grayscale' },
  { id: 302, name: 'Origami' },
  { id: 303, name: 'C4' },
  { id: 200, name: 'Dark Mauve', dark: true },
  { id: 201, name: 'Dark Flagship Terrastruct', dark: true },
]

/**
 * A diagram theme is either one of D2's built-in numbered themes, or our
 * Scaleway-branded custom theme, injected as source-level `theme-overrides` /
 * `dark-theme-overrides` (see scwGraphTheme.ts). Confirmed empirically: D2
 * applies `theme-overrides` whenever no `darkThemeID` render option is set,
 * and switches to `dark-theme-overrides` as soon as one is (any value) — so
 * the Scaleway theme's light/dark variant is chosen at render time by
 * whether `darkThemeID` is passed, letting it follow the app's own
 * light/dark toggle instead of being a separate selectable entry.
 */
export type DiagramTheme = 'scaleway' | number

export const DEFAULT_DIAGRAM_THEME: DiagramTheme = 'scaleway'
