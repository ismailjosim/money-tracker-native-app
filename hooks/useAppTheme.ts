import { useEffect } from 'react'
import { Platform } from 'react-native'
import { colorScheme as nwColorScheme, useColorScheme as useNWColorScheme } from 'nativewind'
import { useUserStore } from '@/store/useStore'

export function useAppTheme() {
  const theme = useUserStore(s => s.theme)
  const setTheme = useUserStore(s => s.setTheme)
  const { setColorScheme } = useNWColorScheme()

  const isDark = theme === 'dark'

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark'
    setTheme(next)
  }

  // Synchronize NativeWind and Web DOM whenever theme changes
  useEffect(() => {
    try {
      setColorScheme(theme)
    } catch {
      // Safe fallback if NativeWind's hook wrapper throws
    }

    try {
      nwColorScheme.set(theme)
    } catch {
      // Safe fallback
    }

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--css-interop-darkMode', 'class dark')
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [theme, setColorScheme])

  return {
    theme,
    isDark,
    colorScheme: theme,
    toggleTheme,
    setTheme,
  }
}
