import { AppStateProvider } from './state/AppStateProvider'
import { PlanTab } from './features/plan/PlanTab'

function App() {
  return (
    <AppStateProvider>
      <PlanTab />
    </AppStateProvider>
  )
}

export default App
