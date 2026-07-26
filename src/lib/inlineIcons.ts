/**
 * D2 renders icons as `<image href="http://...">` pointing at an external
 * URL. That works fine for the live preview (the SVG is inlined directly
 * into the page DOM), but browsers don't fetch external resources for
 * `<image>` elements nested inside an SVG that's itself loaded as an `<img>`
 * — which is exactly what exportPng()'s canvas rasterization does, and what
 * a downloaded standalone .svg falls back to if its icon server ever goes
 * away. Confirmed empirically: the icon silently doesn't render, no visible
 * error. Inlining each icon as a data URI before export sidesteps both.
 */
export async function inlineIcons(svg: string): Promise<string> {
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
  const images = Array.from(doc.getElementsByTagNameNS('http://www.w3.org/2000/svg', 'image'))
  const cache = new Map<string, string>()

  await Promise.all(
    images.map(async (image) => {
      const href = image.getAttribute('href') ?? image.getAttributeNS('http://www.w3.org/1999/xlink', 'href')
      if (!href || !href.startsWith('http')) return

      try {
        let dataUrl = cache.get(href)
        if (!dataUrl) {
          const blob = await fetch(href).then((r) => r.blob())
          dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = () => reject(reader.error)
            reader.readAsDataURL(blob)
          })
          cache.set(href, dataUrl)
        }
        image.setAttribute('href', dataUrl)
        image.removeAttributeNS('http://www.w3.org/1999/xlink', 'href')
      } catch {
        // Leave the original URL in place; export still succeeds, just
        // without that one icon inlined.
      }
    }),
  )

  return new XMLSerializer().serializeToString(doc)
}
