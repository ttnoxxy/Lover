import React, { useState, useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCoverflow } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
// @ts-ignore
import HTMLFlipBook from 'react-pageflip'
import { ReactSketchCanvas } from 'react-sketch-canvas'
import type { ReactSketchCanvasRef } from 'react-sketch-canvas'
import * as Popover from '@radix-ui/react-popover'
import { m, AnimatePresence } from 'framer-motion'
import WebApp from '@twa-dev/sdk'
import { Camera, Books, BookOpen, SquaresFour, SlidersHorizontal, DotsThree, ShareNetwork, Trash, ArrowUUpLeft, Plus } from '@phosphor-icons/react'

const INITIAL_ALBUMS = [
  {
    id: '1', title: 'Отпуск 2026', coverColor: '#431E1A',
    pages: [
      { id: 'p1', photo: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop', date: '24 сентября', title: 'Вечерняя прогулка у воды', text: 'Взяли самый вкусный раф и гуляли до ночи.' },
      { id: 'p2', photo: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600&auto=format&fit=crop', date: '25 сентября', title: 'Уютное утро', text: 'Завтрак с видом на старый город и красивые улицы.' }
    ]
  },
  {
    id: '2', title: 'Осень вдвоём', coverColor: '#B07D56',
    pages: [
      { id: 'p1', photo: '', date: '12 октября', title: 'Парк', text: 'Собрали букет из желтых листьев.' }
    ]
  },
  {
    id: '3', title: 'Наше начало', coverColor: '#5F6F52',
    pages: [
      { id: 'p1', photo: '', date: '1 сентября', title: 'Знакомство', text: 'День, когда всё изменилось.' }
    ]
  }
]

const AVAILABLE_COLORS = ['#431E1A', '#A44A3F', '#5F6F52', '#B07D56', '#C2B078']
const BRUSH_COLORS = ['#FAF5EF', '#E5B869', '#E07A5F', '#F2D0C9', '#231714']
const BRUSH_WIDTHS = [3, 6, 14]

const Page = React.forwardRef<HTMLDivElement, any>((props, ref) => {
  return (
    <div ref={ref} data-density="hard">
      {props.children}
    </div>
  )
})

export const HistoryScreen = () => {
  const [albums, setAlbums] = useState(INITIAL_ALBUMS)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isEditingCover, setIsEditingCover] = useState(false)
  const [activeTab, setActiveTab] = useState<'draw' | 'color' | 'name'>('draw')
  
  const [strokeColor, setStrokeColor] = useState('#FAF5EF')
  const [strokeWidth, setStrokeWidth] = useState(3)

  const activeAlbum = albums[activeIndex] || albums[0] || { pages: [] }
  const canvasRef = useRef<ReactSketchCanvasRef>(null)
  const flipBookRef = useRef<any>(null)

  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        try {
          if (flipBookRef.current && flipBookRef.current.pageFlip()) {
            if (flipBookRef.current.pageFlip().getCurrentPageIndex() === 0) {
              flipBookRef.current.pageFlip().flipNext();
            }
          }
        } catch (e) {}
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const onFlip = (_e: any) => {
    try {
      const app = (WebApp as any)?.default || WebApp;
      if (app && app.ready && app.HapticFeedback) {
        app.HapticFeedback.impactOccurred('light');
      }
    } catch (err) {}
  }

  const updateAlbum = (id: string, updates: any) => {
    setAlbums(albums.map(a => a.id === id ? { ...a, ...updates } : a))
  }

  const handleAdd = () => {
    if (!isOpen) {
      // Add new album
      const newAlbum = {
        id: Date.now().toString(),
        title: 'Новый альбом',
        coverColor: AVAILABLE_COLORS[0],
        pages: [{ id: Date.now().toString(), photo: '', date: '', title: '', text: '' }]
      }
      setAlbums([...albums, newAlbum])
      setActiveIndex(albums.length)
    } else {
      // Add new page to current album
      const newPage = { id: Date.now().toString(), photo: '', date: '', title: '', text: '' }
      updateAlbum(activeAlbum.id, { pages: [...activeAlbum.pages, newPage] })
    }
  }

  const handleDelete = () => {
    if (!isOpen) {
      // Delete album
      if (albums.length <= 1) return;
      setAlbums(albums.filter(a => a.id !== activeAlbum.id))
      setActiveIndex(Math.max(0, activeIndex - 1))
    } else {
      // Delete page
      if (activeAlbum.pages.length <= 1) {
        // Can't delete last page, maybe delete album instead? 
        return;
      }
      // Currently, just remove last page or current page
      // flipbook doesn't easily expose current page index without syncing it to state, let's just delete the last page for now or close if needed
      updateAlbum(activeAlbum.id, { pages: activeAlbum.pages.slice(0, -1) })
    }
  }

  return (
    <div className="w-full flex-grow flex flex-col pt-2 relative overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-start justify-between px-2 mb-4 relative z-20 shrink-0">
         <div className="flex gap-2">
            {!isOpen ? (
               <button className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-md text-[#4A2521] flex items-center justify-center shadow-sm">
                 <Books className="w-5 h-5" weight="fill" />
               </button>
            ) : (
               <>
                 <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full bg-[#431E1A] text-white flex items-center justify-center shadow-sm transition hover:scale-105 active:scale-95">
                   <BookOpen className="w-5 h-5" weight="fill" />
                 </button>
                 <button className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-md text-[#4A2521] flex items-center justify-center shadow-sm transition hover:scale-105 active:scale-95">
                   <SquaresFour className="w-5 h-5" weight="fill" />
                 </button>
               </>
            )}
         </div>
         <div className="flex flex-col items-center justify-center mt-1">
            <h1 className="text-[22px] font-bold text-[#1A1412] tracking-tight cursor-pointer hover:opacity-80 transition leading-none">
              {activeAlbum.title}
            </h1>
            <span className="text-xs font-medium text-[#6E5D53] flex items-center justify-center gap-1.5 mt-0.5">
              {activeAlbum.pages?.length || 0} страницы
            </span>
         </div>
         <div className="w-10" />
      </div>

      {/* Main Area: Swiper OR Open Book */}
      <div className="flex-grow flex flex-col justify-center items-center relative w-full">
        {!isOpen ? (
          <div className="w-full relative py-6 overflow-visible">
            <Swiper
              effect={'coverflow'}
              grabCursor={!isEditingCover}
              allowTouchMove={!isEditingCover}
              centeredSlides={true}
              slidesPerView={'auto'}
              coverflowEffect={{ rotate: 10, stretch: 0, depth: 110, modifier: 1, slideShadows: false }}
              modules={[EffectCoverflow]}
              onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
              className="w-full overflow-visible"
            >
              {albums.map((album, idx) => (
                <SwiperSlide key={album.id} style={{ width: 210, height: 280 }}>
                  <div 
                    className="w-full h-full rounded-l-[6px] rounded-r-[22px] relative overflow-hidden shadow-[0_24px_40px_rgba(35,23,20,0.25)] flex select-none transition-transform duration-300"
                    style={{ backgroundColor: album.coverColor }}
                    onClick={() => {
                       if (!isEditingCover && activeIndex === idx) setIsOpen(true)
                    }}
                  >
                    <div className="w-5 h-full bg-black/20 border-r border-black/20 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.2)] shrink-0 z-0" />
                    
                    <div className="absolute inset-0 pt-9 px-5 text-center z-0">
                      <h2 className="text-white text-[20px] font-bold">{album.title}</h2>
                    </div>

                    <div className={`absolute inset-0 z-10 ${!isEditingCover ? 'pointer-events-none' : 'pointer-events-auto'}`}>
                       <ReactSketchCanvas
                          ref={activeIndex === idx ? canvasRef : null}
                          strokeWidth={strokeWidth}
                          strokeColor={strokeColor}
                          canvasColor="transparent"
                          style={{ border: "none" }}
                       />
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (activeIndex === idx) setIsEditingCover(!isEditingCover);
                      }}
                      className="w-8 h-8 rounded-full bg-black/25 hover:bg-black/40 text-white flex items-center justify-center absolute top-3 right-3 z-20"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </button>

                    <AnimatePresence>
                      {isEditingCover && activeIndex === idx && (
                        <m.div 
                          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute top-14 right-3 z-20 flex flex-col gap-2"
                        >
                          <button onClick={(e) => { e.stopPropagation(); canvasRef.current?.undo() }} className="w-7 h-7 rounded-full bg-black/20 text-white flex items-center justify-center backdrop-blur-md">
                            <ArrowUUpLeft className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); canvasRef.current?.clearCanvas() }} className="w-7 h-7 rounded-full bg-black/20 text-white flex items-center justify-center backdrop-blur-md">
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </m.div>
                      )}
                    </AnimatePresence>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <div className="w-full flex items-center justify-center px-3 overflow-visible">
            {/* @ts-ignore */}
            <HTMLFlipBook 
              width={160} height={220} size="fixed" usePortrait={false} showCover={true} 
              flippingTime={600} maxShadowOpacity={0.18} drawShadow={true} onFlip={onFlip}
              className="shadow-2xl" ref={flipBookRef}
            >
              <Page>
                <div className="w-full h-full rounded-r-[16px] border-y-[3px] border-r-[3px] border-l-0 overflow-hidden relative flex" style={{ backgroundColor: activeAlbum.coverColor, borderColor: activeAlbum.coverColor }}>
                   <div className="w-5 h-full bg-black/20 border-r border-black/20 shrink-0 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.2)]" />
                   <div className="absolute inset-0 pt-9 px-5 text-center">
                      <h2 className="text-white text-[20px] font-bold">{activeAlbum.title}</h2>
                   </div>
                </div>
              </Page>

              {activeAlbum.pages.flatMap((page, idx) => [
                  <Page key={page.id + '-left'}>
                    <div className="w-full h-full bg-[#FAF6F0] rounded-l-[16px] border-y-[3px] border-l-[3px] border-r-0 relative flex flex-col p-3 pb-4" style={{ borderColor: activeAlbum.coverColor }}>
                      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/[0.07] via-black/[0.02] to-transparent pointer-events-none z-10" />
                      <div className="flex-grow w-full rounded-[12px] bg-[#EBE0D5] overflow-hidden relative shadow-inner aspect-[4/4.2]">
                        {page.photo ? (
                          <img src={page.photo} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Camera className="w-6 h-6 text-[#8C7A6B]" weight="fill" />
                          </div>
                        )}
                      </div>
                      <div className="text-center mt-2 text-[11px] font-semibold text-[#8C7A6B]">
                        {page.date || 'Новое'}
                      </div>
                    </div>
                  </Page>,
                  <Page key={page.id + '-right'}>
                    <div className="w-full h-full bg-[#FAF6F0] rounded-r-[16px] border-y-[3px] border-r-[3px] border-l-0 relative flex flex-col p-4" style={{ borderColor: activeAlbum.coverColor }}>
                      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/[0.07] via-black/[0.02] to-transparent pointer-events-none z-10" />
                      <h3 className="text-[15px] font-bold text-[#1A1412] leading-tight">{page.title || 'Без названия'}</h3>
                      <p className="text-xs text-[#8C7A6B] mt-2 leading-relaxed">{page.text || 'Нажмите, чтобы добавить описание...'}</p>
                      <div className="mt-auto text-right text-[11px] font-semibold text-[#8C7A6B]">
                        {idx + 1} / {activeAlbum.pages.length}
                      </div>
                    </div>
                  </Page>
              ])}

              <Page>
                <div className="w-full h-full rounded-l-[16px] border-y-[3px] border-l-[3px] border-r-0 overflow-hidden relative" style={{ backgroundColor: activeAlbum.coverColor, borderColor: activeAlbum.coverColor }}>
                   <div className="absolute right-0 top-0 bottom-0 w-5 bg-black/20 border-l border-black/20 shadow-[inset_2px_0_4px_rgba(0,0,0,0.2)]" />
                </div>
              </Page>
            </HTMLFlipBook>
          </div>
        )}
      </div>

      {/* Bottom Area */}
      <div className="mt-auto mb-6 shrink-0 w-full px-4 relative z-20 h-[100px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isEditingCover ? (
            <m.div 
              key="editor"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-[28px] p-4 shadow-sm w-full max-w-xs mx-auto space-y-3"
            >
              <div className="flex bg-[#F5EBE4] rounded-full p-1 relative">
                 <button onClick={() => setActiveTab('draw')} className={`flex-1 text-[11px] font-bold py-1.5 rounded-full transition ${activeTab === 'draw' ? 'bg-white text-[#431E1A] shadow-sm' : 'text-[#8C7A6B]'}`}>Рисунок</button>
                 <button onClick={() => setActiveTab('color')} className={`flex-1 text-[11px] font-bold py-1.5 rounded-full transition ${activeTab === 'color' ? 'bg-white text-[#431E1A] shadow-sm' : 'text-[#8C7A6B]'}`}>Цвет</button>
                 <button onClick={() => setActiveTab('name')} className={`flex-1 text-[11px] font-bold py-1.5 rounded-full transition ${activeTab === 'name' ? 'bg-white text-[#431E1A] shadow-sm' : 'text-[#8C7A6B]'}`}>Название</button>
              </div>

              {activeTab === 'draw' && (
                <div className="flex items-center justify-between px-2">
                   <div className="flex gap-2">
                     {BRUSH_COLORS.map(c => (
                       <button key={c} onClick={() => setStrokeColor(c)} className={`w-6 h-6 rounded-full shadow-inner transition ${strokeColor === c ? 'scale-110 ring-2 ring-offset-1 ring-black/20' : 'scale-100'}`} style={{ backgroundColor: c }} />
                     ))}
                   </div>
                   <div className="w-[1px] h-5 bg-[#E8D9CA] mx-1" />
                   <div className="flex gap-2">
                     {BRUSH_WIDTHS.map(w => (
                       <button key={w} onClick={() => setStrokeWidth(w)} className={`w-6 h-6 rounded-full bg-[#F5EBE4] flex items-center justify-center transition ${strokeWidth === w ? 'bg-[#E8D9CA] text-[#431E1A]' : 'text-[#8C7A6B]'}`}>
                         <div className="bg-current rounded-full" style={{ width: w===3?4:w===6?8:12, height: w===3?4:w===6?8:12, opacity: w===14?0.4:1 }} />
                       </button>
                     ))}
                   </div>
                </div>
              )}

              {activeTab === 'color' && (
                <div className="flex items-center justify-center gap-3 py-1">
                  {AVAILABLE_COLORS.map(c => (
                    <button key={c} onClick={() => updateAlbum(activeAlbum.id, { coverColor: c })} className={`w-8 h-8 rounded-full shadow-inner transition ${activeAlbum.coverColor === c ? 'scale-110 ring-2 ring-offset-2 ring-black/20' : 'scale-100 hover:scale-105'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              )}

              {activeTab === 'name' && (
                <div className="px-1">
                  <input 
                    type="text" 
                    value={activeAlbum.title}
                    onChange={(e) => updateAlbum(activeAlbum.id, { title: e.target.value })}
                    className="w-full bg-[#F5EBE4] text-[#1A1412] font-bold text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#DBCAB9]"
                    placeholder="Название альбома..."
                  />
                </div>
              )}

              <button onClick={() => setIsEditingCover(false)} className="bg-[#431E1A] text-white rounded-full py-2.5 w-full text-xs font-semibold hover:opacity-90 active:scale-95 transition">
                Сохранить обложку ✓
              </button>
            </m.div>
          ) : (
            <m.div 
              key="buttons"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="flex items-center justify-center gap-4"
            >
              <button onClick={() => setIsEditingCover(true)} className="w-11 h-11 rounded-full bg-white text-[#431E1A] shadow-[0_4px_14px_rgba(35,23,20,0.06)] flex items-center justify-center hover:scale-105 active:scale-95 transition">
                 <DotsThree className="w-6 h-6" weight="bold" />
              </button>
              <button className="w-11 h-11 rounded-full bg-white text-[#431E1A] shadow-[0_4px_14px_rgba(35,23,20,0.06)] flex items-center justify-center hover:scale-105 active:scale-95 transition">
                 <ShareNetwork className="w-5 h-5" weight="fill" />
              </button>
              
              <Popover.Root>
                <Popover.Trigger asChild>
                  <button className="w-11 h-11 rounded-full bg-white text-[#431E1A] shadow-[0_4px_14px_rgba(35,23,20,0.06)] flex items-center justify-center hover:scale-105 active:scale-95 transition">
                    <Trash className="w-5 h-5" weight="fill" />
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content sideOffset={8} className="bg-white px-3 py-2 rounded-[10px] shadow-[0_10px_30px_rgba(0,0,0,0.1)] text-[11px] font-bold text-[#231714] z-50 flex flex-col gap-2 items-center">
                    <span>{isOpen ? 'Удалить последнюю страницу?' : 'Удалить этот альбом?'}</span>
                    <button onClick={handleDelete} className="bg-[#A44A3F] text-white px-3 py-1.5 rounded-md w-full hover:bg-red-700">Удалить</button>
                    <Popover.Arrow className="fill-white" />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>

              <button onClick={handleAdd} className="w-11 h-11 rounded-full bg-white text-[#431E1A] shadow-[0_4px_14px_rgba(35,23,20,0.06)] flex items-center justify-center hover:scale-105 active:scale-95 transition">
                 <Plus className="w-5 h-5" weight="bold" />
              </button>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
