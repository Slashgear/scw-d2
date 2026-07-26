import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import CodeMirror from '@uiw/react-codemirror'
import { useMemo } from 'react'
import { d2Language } from '../lib/d2Language'
import { useTheme } from '../lib/theme'

interface EditorProps {
  value: string
  onChange: (value: string) => void
}

const fontTheme = EditorView.baseTheme({
  '&': { fontSize: '13px', height: '100%' },
  '.cm-content': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' },
  '.cm-gutters': { backgroundColor: 'transparent', border: 'none' },
  // oneDark's default gutter color (#7d8799 on #282c34) is ~3.86:1, short of the
  // 4.5:1 required for text. Brighten it enough to clear that threshold.
  '.cm-gutterElement': { color: '#9aa1ad !important' },
})

export function Editor({ value, onChange }: EditorProps) {
  const { theme } = useTheme()

  const extensions = useMemo(
    () => [
      d2Language,
      EditorView.lineWrapping,
      fontTheme,
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      // aria-label on <CodeMirror> only reaches the outer wrapper div; the
      // actual role="textbox" element is .cm-content, which needs its own name.
      EditorView.contentAttributes.of({ 'aria-label': 'D2 diagram source' }),
    ],
    [],
  )

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      theme={theme === 'dark' ? oneDark : 'light'}
      height="100%"
      indentWithTab={false}
      // D2 leans heavily on multi-line `{ }` containers; CodeMirror's
      // closeBrackets auto-inserts the closing brace right after `{`, but
      // once the cursor has moved to a new line it no longer detects the
      // user's own `}` as "typing over" it, leaving a duplicate.
      basicSetup={{ autocompletion: false, closeBrackets: false }}
      className="h-full"
    />
  )
}
