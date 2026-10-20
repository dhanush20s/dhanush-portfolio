import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { Layout } from './components/Layout'
import App from './App'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Layout>
      <App />
    </Layout>
  </StrictMode>,
)
