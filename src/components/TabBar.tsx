import { CalendarDays, ClipboardList, Home, WalletCards } from 'lucide-react'
import { useRef, type ComponentType, type KeyboardEvent } from 'react'

export type AppTab = 'home' | 'spend' | 'calendar' | 'plan'

interface TabDefinition {
  id: AppTab
  label: string
  icon: ComponentType<{ size?: number; strokeWidth?: number; 'aria-hidden'?: boolean }>
}

const tabs: TabDefinition[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'spend', label: 'Spend', icon: WalletCards },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'plan', label: 'Plan', icon: ClipboardList },
]

interface TabBarProps {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
  entering?: boolean
}

export function TabBar({ activeTab, onTabChange, entering = false }: TabBarProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!direction) return
    event.preventDefault()
    const nextIndex = (index + direction + tabs.length) % tabs.length
    tabRefs.current[nextIndex]?.focus()
    onTabChange(tabs[nextIndex].id)
  }

  return (
    <nav
      aria-label="Primary navigation"
      className={`wide-tab-bar fixed inset-x-0 bottom-0 z-40 border-t border-separator bg-bar pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_0_rgba(0,0,0,0.04)] backdrop-blur-xl ${entering ? 'animate-bar-enter' : ''}`}
    >
      <div className="wide-tab-bar-content mx-auto flex h-[49px] w-full max-w-[480px] items-stretch justify-around" role="tablist">
        {tabs.map(({ id, label, icon: Icon }, index) => {
          const selected = activeTab === id
          return (
            <button
              key={id}
              type="button"
              id={`${id}-tab`}
              role="tab"
              aria-selected={selected}
              aria-current={selected ? 'page' : undefined}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              ref={(element) => { tabRefs.current[index] = element }}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`flex min-w-16 flex-1 flex-col items-center justify-center gap-0.5 text-tab transition-colors motion-reduce:transition-none ${
                selected ? 'text-accent' : 'text-muted'
              }`}
              onClick={() => onTabChange(id)}
            >
              <Icon size={22} strokeWidth={selected ? 2.5 : 2} aria-hidden />
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
