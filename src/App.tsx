import { useState } from 'react'
import { calculateSummary } from './domain/calc'
import { today } from './domain/dates'
import { MiniPlayer } from './components/MiniPlayer'
import { TabBar, type AppTab } from './components/TabBar'
import { SpendTab } from './features/spend/SpendTab'
import { HomeTab } from './features/home/HomeTab'
import { CalendarTab } from './features/calendar/CalendarTab'
import { AppStateProvider } from './state/AppStateProvider'
import { PlanTab } from './features/plan/PlanTab'
import { useAppState } from './state/useAppState'

function AppContent() {
  const [activeTab, setActiveTab] = useState<AppTab>('plan')
  const [calendarDate, setCalendarDate] = useState<string>(today())
  const { state } = useAppState()
  const remainingToSpend = calculateSummary(state, today()).remainingToSpend

  return (
    <>
      {activeTab === 'spend' ? <SpendTab /> : activeTab === 'home' ? <HomeTab onOpenCalendar={(date) => { setCalendarDate(date); setActiveTab('calendar') }} /> : activeTab === 'calendar' ? <CalendarTab initialDate={calendarDate} /> : <PlanTab />}
      {activeTab !== 'home' && <MiniPlayer amount={remainingToSpend} onOpenHome={() => setActiveTab('home')} />}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  )
}

function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  )
}

export default App
