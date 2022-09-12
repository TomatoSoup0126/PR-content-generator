import { useState, useEffect, createContext, useMemo } from 'react'

import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, createTheme } from '@mui/material/styles'

import App from './components/App'

export const ColorModeContext = createContext({ toggleColorMode: () => {} })

const ThemeWrapper: React.FC = () => {
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
      },
    }),
    [],
  )

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode],
  )

  const restoreTheme = () => {
    if (localStorage.getItem('theme')) {
      const saveMode = JSON.parse(`${localStorage.getItem('theme')}`)
      if (saveMode !== mode) {
        setMode(saveMode)
      }
    }
  }

  useEffect(() => {
    restoreTheme()
  }, [])

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}


export default ThemeWrapper
