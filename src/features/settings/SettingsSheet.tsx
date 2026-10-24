import { Check, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Sheet } from '@/components/Sheet'
import {
  loadThemePreference,
  saveThemePreference,
  type ThemePreference,
} from '@/storage/prefs'

const themeOptions: Array<{ value: ThemePreference; label: string }> = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

function applyTheme(theme: ThemePreference) {
  if (theme === 'system') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.dataset.theme = theme
  }
}

export function SettingsSheet() {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<ThemePreference>(() => loadThemePreference())

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  function handleThemeChange(nextTheme: ThemePreference) {
    setTheme(nextTheme)
    saveThemePreference(nextTheme)
  }

  return (
    <>
      <button
        type="button"
        aria-label="Settings"
        className="fixed right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-surface text-muted shadow-sm"
        onClick={() => setOpen(true)}
      >
        <Settings size={20} aria-hidden />
      </button>
      <Sheet open={open} title="Settings" titleId="settings-title" onClose={() => setOpen(false)}>
        <div aria-labelledby="appearance-heading">
          <h3 id="appearance-heading" className="mb-2 text-footnote font-semibold text-muted">Appearance</h3>
          <div className="overflow-hidden rounded-xl bg-surface-2">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className="flex min-h-12 w-full items-center justify-between border-b border-separator px-4 text-left last:border-b-0"
                onClick={() => handleThemeChange(option.value)}
              >
                <span>{option.label}</span>
                {theme === option.value && <Check size={20} className="text-accent" aria-label="Selected" />}
              </button>
            ))}
          </div>
        </div>
      </Sheet>
    </>
  )
}
