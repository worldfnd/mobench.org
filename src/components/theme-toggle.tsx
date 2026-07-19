import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'mobench-theme'

function systemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

function storedTheme(): Theme | null {
  if (typeof window === 'undefined') return null
  try {
    const value = window.localStorage?.getItem?.(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === 'undefined') return 'light'
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  })

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const syncTheme = () => {
      const next = storedTheme() ?? (media.matches ? 'dark' : 'light')
      applyTheme(next)
      setTheme(next)
    }

    syncTheme()
    media.addEventListener('change', syncTheme)
    window.addEventListener('storage', syncTheme)

    return () => {
      media.removeEventListener('change', syncTheme)
      window.removeEventListener('storage', syncTheme)
    }
  }, [])

  const nextTheme = theme === 'dark' ? 'light' : 'dark'
  const Icon = theme === 'dark' ? Sun : Moon

  return (
    <button
      type="button"
      data-theme-toggle
      onClick={() => {
        try {
          window.localStorage?.setItem?.(STORAGE_KEY, nextTheme)
        } catch {
          // Storage can be unavailable in hardened browser contexts; the in-page theme still updates.
        }
        applyTheme(nextTheme)
        setTheme(nextTheme)
 }}
 className={cn(
 'inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[rgba(20,18,12,0.16)] bg-white text-ink transition-colors hover:border-green/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green/35 xl:h-12 xl:w-12',
 className,
 )}
 aria-label={`Switch to ${nextTheme} mode`}
 title={`Switch to ${nextTheme} mode`}
 >
 <Icon className="h-4 w-4 xl:h-5 xl:w-5" />
 </button>
  )
}
