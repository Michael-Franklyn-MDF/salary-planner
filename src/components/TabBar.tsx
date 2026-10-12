import { CalendarDays, ClipboardList, Home, WalletCards } from 'lucide-react'
import type { ComponentType } from 'react'

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
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--separator)] bg-[color:var(--bar-bg)] pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_0_rgba(0,0,0,0.04)] backdrop-blur-xl"
    >
      <div className="mx-auto flex h-[49px] max-w-[480px] items-stretch justify-around" role="tablist">
        {tabs.map(({ id, label, icon: Icon }) => {
          const selected = activeTab === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              className={`flex min-w-16 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] leading-4 transition-colors motion-reduce:transition-none ${
                selected ? 'text-[color:var(--accent)]' : 'text-[color:var(--text-muted)]'
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
