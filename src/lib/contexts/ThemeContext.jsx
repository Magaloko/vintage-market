import { createContext, useContext, useState, useEffect } from 'react'

const LIGHT_COLORS = {
  pageBg: '#F7F2EB',
  text: '#2C2420',
  textFaded: 'rgba(44, 36, 32, 0.6)',
  textDim: 'rgba(44, 36, 32, 0.35)',
  cardBg: 'rgba(255, 255, 255, 0.7)',
  sectionAltBg: '#0C0A08',
  inputBg: 'rgba(240, 230, 214, 0.5)',
  borderSubtle: 'rgba(44, 36, 32, 0.08)',
}

const DARK_COLORS = {
  pageBg: '#0C0A08',
  text: '#F0E6D6',
  textFaded: 'rgba(240, 230, 214, 0.6)',
  textDim: 'rgba(240, 230, 214, 0.35)',
  cardBg: 'rgba(26, 20, 16, 0.9)',
  sectionAltBg: '#1A1410',
  inputBg: 'rgba(240, 230, 214, 0.05)',
  borderSubtle: 'rgba(240, 230, 214, 0.08)',
}

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('vintage_theme') || 'light'
    } catch {
      return 'light'
    }
  })

  const isDark = theme === 'dark'
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  useEffect(() => {
    try {
      localStorage.setItem('vintage_theme', theme)
    } catch {
      // localStorage unavailable
    }
  }, [theme])

  useEffect(() => {
    document.body.style.backgroundColor = colors.pageBg
    document.body.style.color = colors.text
  }, [colors])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
