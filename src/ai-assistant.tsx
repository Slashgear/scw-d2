import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AiAssistant from './AiAssistant.tsx'
import './index.css'
import { ThemeProvider } from './lib/theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AiAssistant />
    </ThemeProvider>
  </StrictMode>,
)
