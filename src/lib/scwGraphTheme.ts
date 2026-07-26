/**
 * Scaleway-branded D2 color ramp, built from the same tokens as
 * scw-mermaid's mermaidTheme.ts (copied from `@ultraviolet/themes@3.1.8`
 * colors.primary/colors.neutral). D2 doesn't expose as many named slots as
 * mermaid's themeVariables, so the handful of exact tokens we have are
 * interpolated into D2's B1-B6 (primary)/AA·AB (accent)/N1-N7 (neutral) color
 * ramp — see https://d2lang.com/tour/themes for the slot reference.
 */
const SCALEWAY_TOKENS = {
  light: {
    primaryBorder: '#8c40ef',
    primaryBackground: '#f1eefc',
    neutralBackground: '#ffffff',
    neutralText: '#3f4250',
  },
  dark: {
    primaryBorder: '#8d40ee',
    primaryBackground: '#2d1c51',
    neutralBackground: '#151a2d',
    neutralText: '#b8bac0',
  },
} as const

type Variant = keyof typeof SCALEWAY_TOKENS

function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`
}

/** Linear interpolation between two hex colors; t=0 -> a, t=1 -> b. */
function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a)
  const [br, bg, bb] = hexToRgb(b)
  return rgbToHex([ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t])
}

export function scwThemeColors(variant: Variant): Record<string, string> {
  const t = SCALEWAY_TOKENS[variant]
  const accent = mix(t.neutralText, t.neutralBackground, 0.7)
  const accentLight = mix(t.neutralText, t.neutralBackground, 0.85)

  return {
    B1: t.primaryBorder,
    B2: t.primaryBorder,
    B3: mix(t.primaryBorder, t.primaryBackground, 0.35),
    B4: mix(t.primaryBorder, t.primaryBackground, 0.65),
    B5: t.primaryBackground,
    B6: mix(t.primaryBackground, t.neutralBackground, 0.6),
    AA2: t.neutralText,
    AA4: accent,
    AA5: accentLight,
    AB4: accent,
    AB5: accentLight,
    N1: t.neutralText,
    N2: t.neutralText,
    N3: mix(t.neutralText, t.neutralBackground, 0.25),
    N4: mix(t.neutralText, t.neutralBackground, 0.5),
    N5: mix(t.neutralText, t.neutralBackground, 0.7),
    N6: mix(t.neutralText, t.neutralBackground, 0.85),
    N7: t.neutralBackground,
  }
}
