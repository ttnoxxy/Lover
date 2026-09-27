import { Heart, BookOpenText, User, Faders } from '@phosphor-icons/react'
import { m } from 'framer-motion'

export const TABS = [
  { id: 'главная', label: 'Главная', icon: Heart },
  { id: 'история', label: 'История', icon: BookOpenText },
  { id: 'профиль', label: 'Профиль', icon: User },
  { id: 'настройки', label: 'Настройки', icon: Faders },
]

export const BottomNav = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (id: string) => void }) => {
  return (
    <div className="sticky bottom-6 mt-auto w-full z-50 shrink-0 px-4">
      <div className="w-full h-[60px] bg-white/95 backdrop-blur-xl rounded-full p-2 shadow-[0_10px_40px_rgba(35,23,20,0.1)] flex items-center justify-between shrink-0 overflow-hidden">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ WebkitTapHighlightColor: 'transparent' }}
              className={`relative flex items-center rounded-full cursor-pointer overflow-hidden h-[44px] transition-colors duration-300 ${
                isActive ? 'bg-[#F5EBE4] text-[#4A3B32]' : 'bg-transparent text-[#8C6D68]/80 hover:text-[#8C6D68]'
              }`}
            >
              <div className="w-[44px] h-[44px] shrink-0 flex items-center justify-center">
                <Icon className={`w-[20px] h-[20px] transition-transform duration-300 ${tab.id === 'настройки' ? 'rotate-90' : ''}`} weight={isActive ? "fill" : "regular"} />
              </div>
              
              <m.div
                initial={false}
                animate={{ width: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="overflow-hidden flex items-center"
              >
                <span className="font-ui text-xs font-semibold whitespace-nowrap block w-max pl-1 pr-4">
                  {tab.label}
                </span>
              </m.div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
