import manifest from '../assets/scw-icons-manifest.json'

export const SCW_ICON_NAMES: string[] = manifest as string[]

export function scwIconUrl(name: string): string {
  return new URL(`${import.meta.env.BASE_URL}icons/scw/${name}.svg`, window.location.href).href
}

const SCW_ICON_REF_RE = /\bicon:\s*scw:([a-z0-9-]+)/gi

/**
 * D2's `icon:` field only accepts a URL — there's no iconify-style pack
 * registry like mermaid's registerIconPacks(). So diagram source can use the
 * shorthand `icon: scw:instance`, and this rewrites it to the actual static
 * asset URL right before compilation (the shorthand form is what travels in
 * the shareable/copyable diagram source).
 */
export function resolveScwIcons(code: string): string {
  return code.replace(SCW_ICON_REF_RE, (match, name: string) =>
    SCW_ICON_NAMES.includes(name) ? `icon: ${scwIconUrl(name)}` : match,
  )
}
