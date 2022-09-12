import React from 'react'
import ReactDOM from 'react-dom/client'
import ThemeWrapper from './ThemeWrapper'
import 'styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeWrapper />
  </React.StrictMode>
)

postMessage({ payload: 'removeLoading' }, '*')
