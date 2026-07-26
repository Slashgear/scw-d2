import { StreamLanguage } from '@codemirror/language'

/**
 * Minimal syntax highlighting for the D2 diagram language. There's no
 * official CodeMirror/Lezer grammar for D2, so this is a small hand-rolled
 * legacy-mode tokenizer instead of a full grammar. Returned token names are
 * standard @lezer/highlight tag names (e.g. "keyword", "string"), which lets
 * any CodeMirror highlight theme (defaultHighlightStyle, oneDark, ...) style
 * them automatically.
 */

const RESERVED_KEYWORDS = new Set([
  'shape',
  'icon',
  'label',
  'near',
  'direction',
  'link',
  'tooltip',
  'width',
  'height',
  'top',
  'left',
  'constraint',
  'class',
  'classes',
  'vars',
  'layers',
  'scenarios',
  'steps',
  'style',
  'grid-rows',
  'grid-columns',
  'grid-gap',
  'source-arrowhead',
  'target-arrowhead',
])

const STYLE_KEYS = new Set([
  'fill',
  'stroke',
  'stroke-width',
  'stroke-dash',
  'border-radius',
  'shadow',
  'opacity',
  'font',
  'font-size',
  'font-color',
  'bold',
  'italic',
  'underline',
  'multiple',
  'filled',
  'double-border',
  'animated',
  '3d',
  'fill-pattern',
  'text-transform',
])

const SHAPE_VALUES = new Set([
  'rectangle',
  'square',
  'page',
  'parallelogram',
  'document',
  'cylinder',
  'queue',
  'package',
  'step',
  'callout',
  'stored_data',
  'person',
  'diamond',
  'oval',
  'circle',
  'hexagon',
  'cloud',
  'text',
  'code',
  'class',
  'sql_table',
  'image',
])

export const d2Language = StreamLanguage.define({
  token(stream) {
    if (stream.eatSpace()) return null

    // # line comments
    if (stream.match(/^#.*/)) return 'comment'

    // "quoted strings" and 'quoted strings'
    if (stream.match(/^"(?:[^"\\]|\\.)*"?/)) return 'string'
    if (stream.match(/^'(?:[^'\\]|\\.)*'?/)) return 'string'

    // connection arrows: ->, <-, <->, --
    if (stream.match(/^<?--+>?/)) return 'operator'

    if (stream.match(/^[{}]/)) return 'punctuation'
    if (stream.match(/^[.:;]/)) return 'punctuation'

    const word = stream.match(/^[A-Za-z_][\w-]*/) as RegExpMatchArray | false
    if (word) {
      const text = word[0]
      if (RESERVED_KEYWORDS.has(text)) return 'keyword'
      if (STYLE_KEYS.has(text)) return 'attributeName'
      if (SHAPE_VALUES.has(text)) return 'typeName'
      return 'variableName'
    }

    stream.next()
    return null
  },
})
