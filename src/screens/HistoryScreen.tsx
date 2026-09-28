// @ts-nocheck
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
import { VerticalBook } from '../components/Book/VerticalBook'
import WebApp from '@twa-dev/sdk'
import { Camera, Books, BookOpen, SquaresFour, SlidersHorizontal, DotsThree, ShareNetwork, Trash, ArrowUUpLeft, Plus, MagnifyingGlass, List } from '@phosphor-icons/react'

const INITIAL_ALBUMS = [
  {
    id: '1', title: 'ОТПУСК 2026', coverColor: '#431E1A',
    pages: [
      { id: 'pg1', photos: [{ id: 'ph1', url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop', caption: 'Вечерняя прогулка у воды', locationDate: '24 СЕНТ · КОФЕЙНЯ', x: 0, y: 0, rotation: -2, scale: 1 }] },
      { id: 'pg2', photos: [{ id: 'ph2', url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600&auto=format&fit=crop', caption: 'Уютное утро с видом на город', locationDate: '25 СЕНТ · ГОРОД', x: 0, y: 0, rotation: 1, scale: 1 }] },
      { id: 'pg3', photos: [] },
      { id: 'pg4', photos: [] }
    ]
  },
  {
    id: '2', title: 'ОСЕНЬ 2026', coverColor: '#B07D56',
    pages: [{ id: 'pg1', photos: [] }, { id: 'pg2', photos: [] }]
  }
];

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



function lightenHex(hex: string, percent: number) {
  let num = parseInt(hex.replace('#',''),16),
  amt = Math.round(2.55 * percent),
  R = (num >> 16) + amt,
  B = (num >> 8 & 0x00FF) + amt,
  G = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
}

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
      let attempts = 0;
      const interval = setInterval(() => {
        try {
          const pf = flipBookRef.current?.pageFlip();
          if (pf) {
            if (pf.getCurrentPageIndex() === 0) {
              pf.flipNext();
            }
            clearInterval(interval);
          }
        } catch (e) {}
        
        attempts++;
        if (attempts > 20) clearInterval(interval); // 2 seconds max
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const onFlip = (e: any) => {
    try {
      const app = (WebApp as any)?.default || WebApp;
      if (app && app.ready && app.HapticFeedback) {
        app.HapticFeedback.impactOccurred('light');
      }
      
      if (e.data === 0) {
        setTimeout(() => setIsOpen(false), 400); // go back to shelf when closed
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
      <div className="flex items-center justify-between px-4 mb-4 relative z-20 shrink-0 h-11 w-full">
         <div className="absolute left-4 flex gap-2">
            {!isOpen ? (
               <button className="w-11 h-11 rounded-full border border-[#8C7A6B]/40 text-[#1A1412] flex items-center justify-center bg-transparent">
                 <Books className="w-5 h-5" weight="fill" />
               </button>
            ) : (
               <>
                 <button onClick={() => setIsOpen(false)} className="w-11 h-11 rounded-full bg-[#431E1A] text-white flex items-center justify-center shadow-sm transition hover:scale-105 active:scale-95">
                   <BookOpen className="w-5 h-5" weight="fill" />
                 </button>
                 <button className="w-11 h-11 rounded-full border border-[#8C7A6B]/40 text-[#1A1412] flex items-center justify-center bg-transparent transition hover:scale-105 active:scale-95">
                   <SquaresFour className="w-5 h-5" weight="fill" />
                 </button>
               </>
            )}
         </div>
         <div className="w-full h-full flex flex-col items-center justify-center pointer-events-none">
            <h1 className="text-[22px] font-bold text-[#1A1412] tracking-tight pointer-events-auto cursor-pointer hover:opacity-80 transition leading-none">
              {activeAlbum.title}
            </h1>
            <span className="text-xs font-medium text-[#6E5D53] flex items-center justify-center gap-1.5 mt-0.5">
              {activeAlbum.pages?.length || 0} страниц
            </span>
         </div>
         <div className="absolute right-4 flex items-center gap-2">
            {!isOpen && (
              <>
                <button className="w-11 h-11 rounded-full border border-[#8C7A6B]/40 text-[#1A1412] flex items-center justify-center bg-transparent">
                  <MagnifyingGlass className="w-5 h-5" weight="bold" />
                </button>
                <button className="w-11 h-11 rounded-full border border-[#8C7A6B]/40 text-[#1A1412] flex items-center justify-center bg-transparent">
                  <List className="w-5 h-5" weight="bold" />
                </button>
              </>
            )}
         </div>
      </div>

      {/* Main Area: Swiper OR Open Book */}
      <div className="flex-grow flex flex-col justify-center items-center relative w-full overflow-hidden">
        {!isOpen ? (
          <div className="w-full relative py-6 overflow-visible">
            <Swiper
              effect={'coverflow'}
              grabCursor={!isEditingCover}
              allowTouchMove={!isEditingCover}
              centeredSlides={true}
              slidesPerView={'auto'}
              coverflowEffect={{ rotate: 0, stretch: 0, depth: 0, modifier: 1, slideShadows: false }}
              modules={[EffectCoverflow]}
              onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
              className="w-full overflow-visible pb-12 pt-6"
            >
              {albums.map((album, idx) => (
                <SwiperSlide key={album.id} style={{ width: '68vw', aspectRatio: '3/4', height: 'auto' }}>
                  {({ isActive }: { isActive: boolean }) => (
                    <div 
                      className="w-full h-full rounded-l-[6px] rounded-r-[22px] relative overflow-hidden flex select-none transition-all duration-300 origin-bottom cursor-pointer"
                      style={{ 
                        backgroundColor: album.coverColor,
                        filter: isActive ? 'none' : 'brightness(0.82)',
                        transform: isActive ? 'scale(1)' : 'scale(0.92)',
                        boxShadow: isActive ? '16px 20px 24px rgba(40, 20, 15, 0.35)' : '16px 20px 24px rgba(40, 20, 15, 0.2)'
                      }}
                      onClick={() => {
                         if (!isEditingCover && activeIndex === idx) setIsOpen(true)
                      }}
                    >
                      <div className="w-5 h-full bg-black/20 border-r border-black/20 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.2)] shrink-0 z-0" />
                      
                      <div className="absolute inset-x-0 bottom-[14%] px-4 text-center z-0">
                        <h2 
                          className="text-[12px] uppercase tracking-[0.14em] font-medium" 
                          style={{ 
                            color: lightenHex(album.coverColor, 20),
                            textShadow: '0 1px 0 rgba(0,0,0,0.35)'
                          }}
                        >
                          {album.title}
                        </h2>
                      </div>
                    </div>
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <VerticalBook 
            pages={activeAlbum.pages as any}
            onAddPhoto={(_pageId) => {
               // stub
            }}
            onUpdatePhoto={(pageId, photoId, updates) => {
               const newPages = activeAlbum.pages.map((p: any) => p.id === pageId ? {
                  ...p, photos: p.photos.map((ph: any) => ph.id === photoId ? { ...ph, ...updates } : ph)
               } : p);
               updateAlbum(activeAlbum.id, { pages: newPages });
            }}
            onEmptyTap={(pageId) => {
               // stub
               const newPhoto = { id: Date.now().toString(), url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600&auto=format&fit=crop', caption: '', locationDate: '', x: 0, y: 0, rotation: 0, scale: 1 };
               const newPages = activeAlbum.pages.map((p: any) => p.id === pageId ? {
                  ...p, photos: [...p.photos, newPhoto]
               } : p);
               updateAlbum(activeAlbum.id, { pages: newPages });
            }}
          />
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

