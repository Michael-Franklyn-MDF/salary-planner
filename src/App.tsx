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
import { UpdatePrompt } from './pwa/UpdatePrompt'
import { useColdLaunch } from './hooks/useColdLaunch'

interface AppProps {
  update?: () => Promise<void>
}

function AppContent({ update }: AppProps) {
  const [activeTab, setActiveTab] = useState<AppTab>('home')
  const [calendarDate, setCalendarDate] = useState<string>(today())
  const [spendAmount, setSpendAmount] = useState('')
  const coldLaunch = useColdLaunch()
  const { state } = useAppState()
  const remainingToSpend = calculateSummary(state, today()).remainingToSpend

  return (
    <>
      {activeTab === 'spend' ? <SpendTab draftAmount={spendAmount} onDraftAmountChange={setSpendAmount} /> : activeTab === 'home' ? <HomeTab coldLaunch={coldLaunch} onOpenSpend={() => setActiveTab('spend')} onOpenCalendar={(date) => { setCalendarDate(date); setActiveTab('calendar') }} onOpenPlan={() => setActiveTab('plan')} /> : activeTab === 'calendar' ? <CalendarTab initialDate={calendarDate} onOpenPlan={() => setActiveTab('plan')} /> : <PlanTab />}
      {activeTab !== 'home' && <MiniPlayer amount={remainingToSpend} onOpenHome={() => setActiveTab('home')} />}
      <TabBar activeTab={activeTab} entering={coldLaunch} onTabChange={setActiveTab} />
      {update && <UpdatePrompt onUpdate={update} />}
    </>
  )
}

function App({ update }: AppProps) {
  return (
    <AppStateProvider>
      <AppContent update={update} />
    </AppStateProvider>
  )
}

export default App
