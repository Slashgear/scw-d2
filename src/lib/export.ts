import type { D2Document } from './documents'
import { inlineIcons } from './inlineIcons'

function slug(name: string): string {
  const s = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return s || 'untitled'
}

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  downloadBlob(blob, filename)
}

export function exportDocument(doc: D2Document) {
  downloadJson(
    { kind: 'document', version: 1, name: doc.name, code: doc.code, config: doc.config },
    `${slug(doc.name)}.d2.json`,
  )
}

export function exportLibrary(docs: D2Document[]) {
  downloadJson(
    {
      kind: 'library',
      version: 1,
      documents: docs.map((d) => ({ name: d.name, code: d.code, config: d.config })),
    },
    'scw-d2-library.json',
  )
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function getSvgDimensions(svg: string): { width: number; height: number } {
  const viewBoxMatch = svg.match(/viewBox="[^"]*?\s(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)"/)
  if (viewBoxMatch) {
    return { width: Math.ceil(Number(viewBoxMatch[1])), height: Math.ceil(Number(viewBoxMatch[2])) }
  }
  return { width: 1200, height: 800 }
}

export async function exportSvg(svg: string, filename = 'architecture-diagram.svg') {
  // Inlined so the downloaded file renders its icons standalone, without
  // depending on this app's icon server still being reachable later.
  const portable = await inlineIcons(svg)
  const blob = new Blob([portable], { type: 'image/svg+xml' })
  downloadBlob(blob, filename)
}

export async function exportPng(
  svg: string,
  filename = 'architecture-diagram.png',
  scale = 2,
): Promise<void> {
  const { width, height } = getSvgDimensions(svg)
  // Required, not just nice-to-have, for PNG export: rasterizing via canvas
  // loads the SVG as an <img>, and browsers don't fetch external <image>
  // hrefs nested inside an SVG used that way — icons would silently be
  // missing from the exported PNG otherwise (see inlineIcons.ts).
  const portable = await inlineIcons(svg)
  const svgBlob = new Blob([portable], { type: 'image/svg+xml' })
  const svgUrl = URL.createObjectURL(svgBlob)

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to load diagram as image'))
      img.src = svgUrl
    })

    const canvas = document.createElement('canvas')
    canvas.width = width * scale
    canvas.height = height * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context unavailable')

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    const pngBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!pngBlob) throw new Error('Failed to encode PNG')
    downloadBlob(pngBlob, filename)
  } finally {
    URL.revokeObjectURL(svgUrl)
  }
}
