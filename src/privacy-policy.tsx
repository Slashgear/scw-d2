import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PrivacyPolicy from './PrivacyPolicy.tsx'
import { ThemeProvider } from './lib/theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <PrivacyPolicy />
    </ThemeProvider>
  </StrictMode>,
)