import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "tailwindcss"
import './index.css'
import './styles/shared/layout.css'
import './styles/shared/cards.css'
import './styles/shared/forms.css'
import './styles/shared/badges.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
