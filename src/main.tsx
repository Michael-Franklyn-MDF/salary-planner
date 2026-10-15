import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'
import { registerAppServiceWorker, removeLegacyCaches } from './pwa/register'

void removeLegacyCaches()
const update = registerAppServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App update={update} />
  </StrictMode>,
)
