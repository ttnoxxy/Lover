import React, { useState } from 'react'
import { UserPlus, CaretRight, CaretDown, Plus, X, Check, MapPin, Lightning, GameController, Camera, Heart, Cake, AirplaneTilt, Sparkle } from '@phosphor-icons/react'
import { m, AnimatePresence } from 'framer-motion'
import { AnimatedCounter } from '../components/AnimatedCounter'

const WIDGET_DEFS = [
  { id: 'partner', icon: MapPin },
  { id: 'impulse', icon: Lightning },
  { id: 'games', icon: GameController },
  { id: 'photo', icon: Camera },
]

const WIDGET_CONFIGS: Record<string, { icon: any, label: string, sub: string }> = {
  partner: { icon: MapPin, label: 'Рядом', sub: '2.4 км' },
  impulse: { icon: Lightning, label: 'Импульс', sub: 'Отправить' },
  games: { icon: GameController, label: 'Игры', sub: 'Провести время вместе' },
  photo: { icon: Camera, label: 'Фото', sub: 'Загрузить' },
}

const INITIAL_DATES = [
  { id: 1, icon: Heart, category: 'Следующий юбилей', title: '50 Дней', daysLeft: '41 день остался', progress: 18, dateStr: '6 ноя' },
  { id: 2, icon: Cake, category: 'Особый день', title: 'День рождения', daysLeft: '19 дней осталось', progress: 62, dateStr: '15 окт' },
  { id: 3, icon: AirplaneTilt, category: 'Наше путешествие', title: 'Отпуск вдвоём', daysLeft: '28 дней осталось', progress: 45, dateStr: '24 окт' },
  { id: 4, icon: Sparkle, category: 'Круглая дата', title: '100 Дней', daysLeft: '91 день остался', progress: 9, dateStr: '26 дек' }
]

const WidgetCard = ({ id }: { id: string }) => {
  const config = WIDGET_CONFIGS[id]

  if (!config) return null
  const Icon = config.icon

  return (
    <m.div 
      initial={{ opacity: 0, scale: 0.95, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="bg-white rounded-[24px] p-3 px-3.5 h-[76px] shadow-[0_6px_20px_rgba(35,23,20,0.04)] flex items-center gap-3 cursor-pointer hover:scale-[1.01] active:scale-[0.98] transition"
    >
      <div className="w-10 h-10 rounded-full bg-[#F5EBE4] text-[#4A2521] flex items-center justify-center shrink-0">
        <Icon className="w-[18px] h-[18px]" weight="bold" />
      </div>
      <div className="flex flex-col justify-center text-left">
        <span className="text-[13px] font-semibold text-[#231714] leading-tight">{config.label}</span>
        <span className="text-[11px] font-medium text-[#8C7A6B] leading-tight mt-0.5">{config.sub}</span>
      </div>
    </m.div>
  )
}

export const HomeScreen = ({ tgUser, installedWidgets, setInstalledWidgets }: { tgUser: any, installedWidgets: string[], setInstalledWidgets: (w: string[]) => void }) => {
  const [isWidgetMenuOpen, setIsWidgetMenuOpen] = useState(false)
  const [dates] = useState(INITIAL_DATES)
  const [activeDateIndex, setActiveDateIndex] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  
  const activeDate = dates[activeDateIndex]

  const handleAddWidget = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!installedWidgets.includes(id)) {
      setInstalledWidgets([...installedWidgets, id])
    }
    setIsWidgetMenuOpen(false)
  }

  return (
    <>
      {/* 1. Header Capsule */}
      <div className="w-full h-[60px] bg-white rounded-full p-2 shadow-[0_10px_28px_rgba(35,23,20,0.06)] flex items-center justify-between shrink-0 mb-8">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden relative z-0 bg-[#DBCAB9]">
              <img src={tgUser?.photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"} alt={tgUser?.first_name || "User"} className="w-full h-full object-cover" />
            </div>
            <div className="w-10 h-10 rounded-full border-[2px] border-white overflow-hidden -ml-3 relative z-10 bg-[#F9F5F1] flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-[#8C6D68]" weight="bold" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-1">
            <m.span animate={{ opacity: [1, 0.35, 1] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[13px] font-ui font-semibold text-[#8C6D68]">Ждем партнера</span>
          </div>
        </div>
        <button className="bg-[#4A2521] text-white h-10 px-4 rounded-full inline-flex items-center justify-center gap-1 active:scale-95 transition-transform shrink-0">
          <span className="text-[13px] font-ui font-medium leading-none">Пригласить</span>
          <CaretRight className="w-4 h-4 shrink-0" weight="bold" />
        </button>
      </div>

      {/* 2. Center Section: Main Counter & Inline Accordion Card */}
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="text-[160px] leading-none font-display font-[800] text-[#0A0A0C] -tracking-[0.02em]">
          <AnimatedCounter value={9} />
        </div>
        <div className="text-[14px] tracking-[0.3em] text-[#52525B] mt-4 font-ui font-medium uppercase">
          ДНЕЙ ЛЮБВИ
        </div>

        {/* Inline Expanding Dates Card */}
        <div className="w-full bg-white rounded-[32px] p-5 shadow-[0_8px_30px_rgba(35,23,20,0.04)] mt-12 overflow-hidden relative">
          <div className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-medium text-[#8C7A6B]">
                {activeDate.category}
              </span>
              <div className="bg-[#4A2521] text-white px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 shadow-sm">
                Все даты
                <m.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <CaretDown className="w-3 h-3" weight="bold" />
                </m.div>
              </div>
            </div>

            {/* Main Date Info */}
            <div className="text-3xl text-[#0A0A0C] font-display font-bold mb-6 tracking-tight">
              <AnimatedCounter key={`title-${activeDate.id}`} value={activeDate.title} />
            </div>
            
            <div className="h-2.5 w-full bg-[#E8D9CA] rounded-full overflow-hidden mb-3 shadow-[inset_0_2px_4px_rgba(100,60,40,0.15)] border border-[#DBCAB9]/50">
              <m.div 
                key={`progress-${activeDate.id}`}
                initial={{ width: 0 }}
                animate={{ width: `${activeDate.progress}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#59261C] to-[#682E22] rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
              />
            </div>
            
            <div className="flex justify-between text-[11px] font-ui font-semibold text-[#8C6D68]">
              <span><AnimatedCounter key={`days-${activeDate.id}`} value={activeDate.daysLeft} /></span>
              <span><AnimatedCounter key={`perc-${activeDate.id}`} value={`${activeDate.progress}%`} /></span>
            </div>
          </div>

          {/* Expanded List */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <m.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="border-t border-[#F0E6DC] my-4" />
                <div className="space-y-1.5">
                  {dates.map((date, index) => {
                    const Icon = date.icon;
                    const isActive = index === activeDateIndex;
                    return (
                      <div 
                        key={date.id} 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDateIndex(index);
                          setIsExpanded(false);
                        }}
                        className="p-2.5 px-3 rounded-[18px] flex items-center justify-between cursor-pointer hover:bg-[#FAF5EF] transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#F5EBE4] text-[#4A2521] flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" weight="fill" />
                          </div>
                          <div>
                            <div className="text-[13px] font-semibold text-[#231714] leading-none mb-1">{date.title}</div>
                            <div className="text-[11px] text-[#8C7A6B] leading-none">{date.daysLeft}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium text-[#8C7A6B]">{date.dateStr}</span>
                          {isActive && <Check className="w-4 h-4 text-[#4A2521]" weight="bold" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                <button className="w-full mt-3 py-2.5 rounded-full bg-[#FAF5EF] hover:bg-[#F5EBE4] text-[#4A2521] text-xs font-semibold flex items-center justify-center gap-1.5 transition">
                  <Plus className="w-4 h-4" weight="bold" /> Добавить дату
                </button>
              </m.div>
            )}
          </AnimatePresence>
        </div>

        {/* Installed Widgets Grid */}
        {installedWidgets.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5 w-full mt-3 content-start items-start">
            <AnimatePresence>
              {installedWidgets.map(id => (
                <WidgetCard key={id} id={id} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Inline Expanding Action Pill */}
        <AnimatePresence>
          {installedWidgets.length < 4 && (
            <m.div 
              layout 
              initial={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 40, marginTop: 24, marginBottom: 8 }}
              exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full flex justify-center relative z-10 overflow-hidden"
            >
              <m.div
                layout
                onClick={() => !isWidgetMenuOpen && setIsWidgetMenuOpen(true)}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`bg-white/75 hover:bg-white backdrop-blur-md text-[#4A3B32] rounded-full shadow-[0_6px_20px_rgba(35,23,20,0.05)] overflow-hidden cursor-pointer flex items-center justify-center h-[40px] ${isWidgetMenuOpen ? 'px-4' : 'px-5'}`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {!isWidgetMenuOpen ? (
                    <m.div
                      key="text"
                      initial={{ opacity: 0, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, filter: 'blur(4px)', scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-2 whitespace-nowrap text-xs font-semibold"
                    >
                      <Plus className="w-4 h-4 text-[#8C6D68]" weight="bold" />
                      Добавить виджет
                    </m.div>
                  ) : (
                    <m.div
                      key="icons"
                      initial={{ opacity: 0, filter: 'blur(4px)', scale: 0.9 }}
                      animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                      exit={{ opacity: 0, filter: 'blur(4px)', scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-4"
                    >
                      {WIDGET_DEFS.filter(w => !installedWidgets.includes(w.id)).map(w => (
                        <button 
                          key={w.id} 
                          onClick={(e) => handleAddWidget(w.id, e)} 
                          className="hover:scale-110 active:scale-95 transition-transform"
                        >
                          <w.icon className="w-[18px] h-[18px] text-[#4A3B32]" weight="fill" />
                        </button>
                      ))}
                      <div className="w-[1px] h-4 bg-[#DBCAB9] mx-1" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); setIsWidgetMenuOpen(false); }} 
                        className="hover:scale-110 active:scale-95 transition-transform"
                      >
                        <X className="w-5 h-5 text-[#8C6D68]" weight="bold" />
                      </button>
                    </m.div>
                  )}
                </AnimatePresence>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
