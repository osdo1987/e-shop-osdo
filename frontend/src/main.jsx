import { StrictMode, useState, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { SocketProvider } from './context/SocketContext'
import App from './App.jsx'
import { lightTheme, darkTheme } from './theme'

function Main() {
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true'
    })

    const theme = useMemo(() => {
        return darkMode ? darkTheme : lightTheme
    }, [darkMode])

    return (
        <StrictMode>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <BrowserRouter>
                    <SocketProvider>
                        <App darkMode={darkMode} setDarkMode={setDarkMode} />
                    </SocketProvider>
                </BrowserRouter>
            </ThemeProvider>
        </StrictMode>
    )
}

createRoot(document.getElementById('root')).render(<Main />)