import { AppStateProvider } from './state/AppStateProvider'
import ObolApp from './features/obol/ObolApp'
import { UpdatePrompt } from './pwa/UpdatePrompt'
import '@fontsource/lora/400.css'
import './features/obol/obol.css'
export default function App({update}:{update?:()=>Promise<void>}) {
 return <AppStateProvider><ObolApp/>{update&&<UpdatePrompt onUpdate={update}/>}</AppStateProvider>
}
