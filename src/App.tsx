import React, { useState, useEffect, useRef } from 'react'
import WebApp from '@twa-dev/sdk'
import { LazyMotion, domMax } from 'framer-motion'
import { BottomNav } from './components/BottomNav'
import { HomeScreen } from './screens/HomeScreen'
import { HistoryScreen } from './screens/HistoryScreen'

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('главная')
  
  // Telegram User Data
  const [tgUser, setTgUser] = useState<any>(null)

  useEffect(() => {
    try {
      const app = (WebApp as any)?.default || WebApp;
      if (app && app.ready) {
        app.ready()
        app.expand()
        app.setHeaderColor('#DFD0C5')
        
        if (app.initDataUnsafe?.user) {
          setTgUser(app.initDataUnsafe.user)
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [])

  // Widget Logic (kept at App level to persist state across tabs)
  const [installedWidgets, setInstalledWidgets] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current && installedWidgets.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        })
      }, 100)
    }
  }, [installedWidgets.length])

  return (
    <LazyMotion features={domMax}>
      <div ref={scrollRef} className="h-[100dvh] overflow-y-auto overflow-x-hidden bg-gradient-to-b from-[#DFD0C5] to-[#C3AE9C] font-ui relative px-5">
        
        {/* Noise Texture Overlay for premium matte paper feel */}
        <div 
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.04] mix-blend-multiply"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        ></div>

        {/* Master Container: Strict Vertical Grid */}
        <div 
          className="w-full max-w-[420px] mx-auto flex flex-col min-h-full pb-6 relative z-10"
          style={{ paddingTop: 'calc(var(--tg-content-safe-area-inset-top, 40px) + 12px)' }}
        >
          {/* Main Views */}
          <div className="flex-grow flex flex-col pb-6">
            <div className="relative flex-grow flex flex-col">
              <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${activeTab === 'главная' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'}`}>
                <HomeScreen tgUser={tgUser} installedWidgets={installedWidgets} setInstalledWidgets={setInstalledWidgets} />
              </div>

              <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${activeTab === 'история' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'}`}>
                <HistoryScreen />
              </div>
            </div>
          </div>

          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
    </LazyMotion>
  )
}

export default App


