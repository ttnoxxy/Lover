import React, { useState, useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCoverflow } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import { ReactSketchCanvas } from 'react-sketch-canvas'
import type { ReactSketchCanvasRef } from 'react-sketch-canvas'
import * as Popover from '@radix-ui/react-popover'
import { m, AnimatePresence } from 'framer-motion'
import WebApp from '@twa-dev/sdk'
import { Camera, Books, BookOpen, SquaresFour, SlidersHorizontal, DotsThree, ShareNetwork, Trash, ArrowUUpLeft, Plus, X } from '@phosphor-icons/react'

const INITIAL_ALBUMS = [
  {
    id: '1', title: 'Отпуск 2026', coverColor: '#431E1A',
    pages: [
      { id: 'p1', photo: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop', date: '24 СЕН', title: 'ВЕЧЕР У ВОДЫ', text: 'Взяли самый вкусный раф и гуляли до ночи.' },
      { id: 'p2', photo: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600&auto=format&fit=crop', date: '25 СЕН', title: 'УЮТНОЕ УТРО', text: 'Завтрак с видом на старый город и красивые улицы.' }
    ]
  },
  {
    id: '2', title: 'Осень вдвоём', coverColor: '#B07D56',
    pages: [
      { id: 'p1', photo: '', date: '12 ОКТ', title: 'ПАРК', text: 'Собрали букет из желтых листьев.' }
    ]
  },
  {
    id: '3', title: 'Архив', coverColor: '#5F6F52',
    pages: [
      { id: 'p1', photo: '', date: '1 НОЯ', title: 'КИНО', text: 'Смотрели старые фильмы весь день.' }
    ]
  }
]

const AVAILABLE_COLORS = ['#431E1A', '#A44A3F', '#5F6F52', '#B07D56', '#C2B078']
const BRUSH_COLORS = ['#FAF5EF', '#E5B869', '#E07A5F', '#F2D0C9', '#231714']
const BRUSH_WIDTHS = [3, 6, 14]

export const HistoryScreen = () => {
  const [albums, setAlbums] = useState(INITIAL_ALBUMS)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isEditingCover, setIsEditingCover] = useState(false)
  
  const [activeTab, setActiveTab] = useState<'draw' | 'color' | 'name'>('name')
  const [strokeColor, setStrokeColor] = useState('#FAF5EF')
  const [strokeWidth, setStrokeWidth] = useState(3)
  
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)

  const canvasRef = useRef<ReactSketchCanvasRef>(null)
  const activeAlbum = albums[activeIndex] || albums[0] || { pages: [] }

  const handleOpenBook = () => {
    if (isOpen || isEditingCover) return;
    try { const app = (WebApp as any)?.default || WebApp; app?.HapticFeedback?.impactOccurred('light'); } catch(e){}
    setIsOpen(true);
  }

  const handleCloseBook = () => {
    try { const app = (WebApp as any)?.default || WebApp; app?.HapticFeedback?.impactOccurred('light'); } catch(e){}
    setIsOpen(false);
  }

  const updateAlbum = (id: string, updates: any) => {
    setAlbums(albums.map(a => a.id === id ? { ...a, ...updates } : a))
  }
  const updatePage = (pageId: string, updates: any) => {
    updateAlbum(activeAlbum.id, {
      pages: activeAlbum.pages.map((p: any) => p.id === pageId ? { ...p, ...updates } : p)
    })
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, pageId: string) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updatePage(pageId, { photo: url });
    }
  }

  const handleAdd = () => {
    if (!isOpen) {
      const newAlbum = { id: Date.now().toString(), title: 'Новый альбом', coverColor: AVAILABLE_COLORS[0], pages: [] }
      setAlbums([...albums, newAlbum])
      setActiveIndex(albums.length)
    } else {
      const newPage = { id: Date.now().toString(), photo: '', date: '', title: '', text: '' }
      updateAlbum(activeAlbum.id, { pages: [...activeAlbum.pages, newPage] })
    }
  }

  const handleDelete = () => {
    if (albums.length <= 1) return;
    setAlbums(albums.filter(a => a.id !== activeAlbum.id))
    setActiveIndex(Math.max(0, activeIndex - 1))
    if (isOpen) setIsOpen(false)
  }

  const handleDeletePage = (pageId: string) => {
    updateAlbum(activeAlbum.id, { pages: activeAlbum.pages.filter((p: any) => p.id !== pageId) })
    setSelectedPageId(null)
  }

  const selectedPage = activeAlbum.pages.find((p: any) => p.id === selectedPageId)

  return (
    <div className="w-full flex-grow flex flex-col font-ui relative">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 shrink-0 mt-2 z-10 relative">
         <div className="flex flex-col">
            {!isOpen ? (
               <button className="w-10 h-10 rounded-full bg-white/70 text-[#431E1A] flex items-center justify-center shadow-sm">
                 <Books className="w-5 h-5" weight="duotone" />
               </button>
            ) : (
               <m.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
                 <button onClick={handleCloseBook} className="w-10 h-10 rounded-full bg-white/70 text-[#431E1A] flex items-center justify-center shadow-sm transition hover:scale-105 active:scale-95">
                   <BookOpen className="w-5 h-5" weight="fill" />
                 </button>
                 <button className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-md text-[#4A2521] flex items-center justify-center shadow-sm transition hover:scale-105 active:scale-95">
                   <SquaresFour className="w-5 h-5" weight="fill" />
                 </button>
               </m.div>
            )}
         </div>
         <div className="flex flex-col items-center justify-center mt-1">
            <AnimatePresence mode="wait">
              <m.h1 key={activeAlbum.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-[24px] font-display font-bold text-[#1A1412] tracking-tight cursor-pointer leading-none">
                {activeAlbum.title}
              </m.h1>
            </AnimatePresence>
            <span className="text-xs font-medium text-[#6E5D53] flex items-center justify-center gap-1.5 mt-0.5">
              {activeAlbum.pages?.length || 0} {(activeAlbum.pages?.length === 1) ? 'запись' : (activeAlbum.pages?.length >= 2 && activeAlbum.pages?.length <= 4) ? 'записи' : 'записей'}
            </span>
         </div>
         <div className="w-10" />
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col justify-center items-center relative w-full px-4 overflow-hidden py-2 z-10">
        {!isOpen ? (
          <div className="w-full relative h-[310px]">
            <Swiper
              effect="coverflow"
              grabCursor={true}
              centeredSlides={true}
              slidesPerView="auto"
              spaceBetween={36}
              coverflowEffect={{
                rotate: 0,
                stretch: 0,
                depth: 80,
                modifier: 1,
                slideShadows: false,
              }}
              modules={[EffectCoverflow]}
              onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
              className="w-full h-full pt-4 !overflow-visible"
            >
              {albums.map((album, idx) => {
                const coverPhoto = album.pages.find((p: any) => p.photo)?.photo;
                return (
                  <SwiperSlide key={album.id} style={{ width: 216, height: 290 }} className="!overflow-visible">
                    <div 
                      onClick={handleOpenBook}
                      className="w-[216px] h-[290px] rounded-r-[18px] rounded-l-[4px] overflow-hidden relative shadow-[0_20px_38px_-8px_rgba(67,30,26,0.28)] transition-transform duration-300 border-y border-r border-black/5 cursor-pointer flex" 
                      style={{ backgroundColor: activeIndex === idx ? album.coverColor : '#EAE2D5', transform: activeIndex === idx ? 'scale(1)' : 'scale(0.92)' }}
                    >
                      {/* Fabric Spine */}
                      <div className="w-[20px] h-full bg-black/25 border-r border-black/20 shrink-0 shadow-[inset_-2px_0_5px_rgba(0,0,0,0.25)] relative z-30" />
                      
                      {/* Cover Content */}
                      <div className="absolute inset-0 pl-[20px] z-10">
                         {coverPhoto ? (
                           <img src={coverPhoto} className="w-full h-full object-cover" alt="" />
                         ) : (
                           <div className="w-full h-full pt-14 px-5 text-center flex flex-col items-center">
                             <h2 className="text-white text-[22px] font-display tracking-wide leading-tight px-2">{album.title}</h2>
                           </div>
                         )}
                      </div>

                      {/* Drawing Canvas */}
                      <div className="absolute inset-0 pl-[20px] z-30 pointer-events-none">
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
                        className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center absolute top-3 right-3 z-40 pointer-events-auto hover:bg-black/40 transition"
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                      </button>

                      <AnimatePresence>
                        {isEditingCover && activeIndex === idx && (
                          <m.div 
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute top-14 right-3 z-40 flex flex-col gap-2 pointer-events-auto"
                          >
                            <button onClick={(e) => { e.stopPropagation(); canvasRef.current?.undo() }} className="w-7 h-7 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center">
                              <ArrowUUpLeft className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); canvasRef.current?.clearCanvas() }} className="w-7 h-7 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center">
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </m.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </SwiperSlide>
                )
              })}
            </Swiper>
          </div>
        ) : (
          <m.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full flex-grow overflow-y-auto px-1 py-2 max-h-[60vh] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <div className="grid grid-cols-3 gap-2.5 auto-rows-auto">
              {activeAlbum.pages.map((page: any, idx: number) => {
                if (idx === 0) {
                  return (
                    <React.Fragment key={page.id}>
                      {/* Module 1: Panoramic Photo */}
                      <div className="col-span-3 aspect-[16/10] rounded-[24px] overflow-hidden bg-white shadow-[0_6px_20px_rgba(67,30,26,0.06)] relative cursor-pointer" onClick={() => setSelectedPageId(page.id)}>
                         {page.photo ? (
                           <img src={page.photo} className="w-full h-full object-cover" alt="" />
                         ) : (
                           <div className="absolute inset-0 flex items-center justify-center bg-[#F5EFEA]">
                             <span className="text-[#8C7A6B] text-xs font-semibold px-4 py-2 bg-white rounded-full shadow-sm">+ Загрузить фото</span>
                           </div>
                         )}
                         <div className="absolute top-3 right-3 bg-[#431E1A]/85 backdrop-blur-md text-white text-[10px] font-display font-bold px-3 py-1 rounded-full z-10">
                           {page.date || '24 СЕН'}
                         </div>
                      </div>
                      {/* Module 2: White Text Card */}
                      <div className="col-span-2 bg-white rounded-[24px] p-4 shadow-[0_6px_20px_rgba(67,30,26,0.05)] flex flex-col justify-between text-left cursor-pointer" onClick={() => setSelectedPageId(page.id)}>
                         <div>
                           <div className="text-[11px] font-medium text-[#8C7A6B]">Момент №1</div>
                           <h3 className="text-[17px] font-display font-bold text-[#1A1412] leading-tight mt-1">{page.title || 'Новая запись'}</h3>
                         </div>
                         <p className="text-[12px] text-[#6E5D53] leading-snug mt-1.5 line-clamp-2">{page.text || 'Нажмите, чтобы добавить описание к этому моменту...'}</p>
                      </div>
                      {/* Module 3: Chocolate Square */}
                      <div className="col-span-1 bg-[#431E1A] text-white rounded-[24px] p-3.5 flex flex-col items-center justify-between text-center cursor-pointer shadow-[0_6px_20px_rgba(67,30,26,0.12)]" onClick={() => setSelectedPageId(page.id)}>
                         <div className="text-[9px] uppercase tracking-[0.16em] text-white/60">КАДР</div>
                         <div className="text-[36px] font-display font-bold leading-none my-auto">01</div>
                         <div className="text-[10px] font-medium text-white/80">{page.date || '24 СЕН'}</div>
                      </div>
                    </React.Fragment>
                  )
                } else {
                  return (
                    <React.Fragment key={page.id}>
                      {/* Module A: Milky Square */}
                      <div className="col-span-1 bg-[#F5EFEA] border border-white/60 rounded-[24px] p-3.5 flex flex-col items-center justify-between text-center cursor-pointer shadow-[0_4px_12px_rgba(67,30,26,0.03)]" onClick={() => setSelectedPageId(page.id)}>
                         <div className="text-[9px] uppercase tracking-[0.15em] text-[#8C7A6B]">КАДР</div>
                         <div className="text-[30px] font-display font-bold text-[#1A1412] my-auto">0{idx + 1}</div>
                         <div className="bg-[#431E1A] text-white text-[9px] font-display font-bold px-2.5 py-0.5 rounded-full">{page.date || 'ДАТА'}</div>
                      </div>
                      {/* Module B: Photo Tile */}
                      <div className="col-span-2 aspect-[4/3] rounded-[24px] overflow-hidden bg-white shadow-[0_6px_20px_rgba(67,30,26,0.06)] relative cursor-pointer" onClick={() => setSelectedPageId(page.id)}>
                         {page.photo ? (
                           <img src={page.photo} className="w-full h-full object-cover" alt="" />
                         ) : (
                           <div className="absolute inset-0 flex items-center justify-center bg-[#F5EFEA]">
                             <span className="text-[#8C7A6B] text-xs font-semibold px-4 py-2 bg-white rounded-full shadow-sm">+ Загрузить фото</span>
                           </div>
                         )}
                      </div>
                      {/* Module C: White Wide Text Tile */}
                      <div className="col-span-3 bg-white rounded-[24px] p-4 shadow-[0_6px_20px_rgba(67,30,26,0.05)] flex items-center justify-between gap-3 text-left cursor-pointer" onClick={() => setSelectedPageId(page.id)}>
                         <div className="flex-grow">
                           <h3 className="text-[15px] font-display font-bold text-[#1A1412]">{page.title || 'Новая запись'}</h3>
                           <p className="text-[12px] text-[#6E5D53] mt-0.5 line-clamp-1">{page.text || 'Нажмите, чтобы добавить описание...'}</p>
                         </div>
                         <div className="w-8 h-8 rounded-full bg-[#F5EFEA] flex items-center justify-center text-[#431E1A] shrink-0">
                           <SlidersHorizontal className="w-4 h-4" />
                         </div>
                      </div>
                    </React.Fragment>
                  )
                }
              })}
              
              {/* Add Moment Button */}
              <div className="col-span-3 flex justify-center pt-2 pb-1">
                <button onClick={handleAdd} className="bg-[#F5EFEA] hover:bg-white text-[#1A1412] text-[13px] font-semibold px-6 py-3 rounded-full shadow-[0_4px_14px_rgba(35,23,20,0.06)] flex items-center gap-2 transition active:scale-95">
                  <Plus className="w-4 h-4" weight="bold" /> Добавить момент
                </button>
              </div>
            </div>
          </m.div>
        )}
      </div>

      {/* Bottom Area (ALWAYS RENDERED) */}
      <div className="mt-auto mb-6 shrink-0 w-full px-4 relative z-20 h-[100px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isEditingCover && !isOpen ? (
            <m.div 
              key="editor"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-[28px] p-4 shadow-[0_10px_40px_rgba(67,30,26,0.1)] w-full max-w-xs mx-auto space-y-3"
            >
              <div className="flex bg-[#F5EBE4] rounded-full p-1 relative">
                 <button onClick={() => setActiveTab('draw')} className={`flex-1 text-[11px] font-display font-bold py-1.5 rounded-full transition ${activeTab === 'draw' ? 'bg-white text-[#431E1A] shadow-sm' : 'text-[#8C7A6B]'}`}>Рисунок</button>
                 <button onClick={() => setActiveTab('color')} className={`flex-1 text-[11px] font-display font-bold py-1.5 rounded-full transition ${activeTab === 'color' ? 'bg-white text-[#431E1A] shadow-sm' : 'text-[#8C7A6B]'}`}>Цвет</button>
                 <button onClick={() => setActiveTab('name')} className={`flex-1 text-[11px] font-display font-bold py-1.5 rounded-full transition ${activeTab === 'name' ? 'bg-white text-[#431E1A] shadow-sm' : 'text-[#8C7A6B]'}`}>Название</button>
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
                    className="w-full bg-[#F5EBE4] text-[#1A1412] font-display font-bold text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#DBCAB9]"
                    placeholder="Название альбома..."
                  />
                </div>
              )}

              <button onClick={() => setIsEditingCover(false)} className="bg-[#431E1A] text-white rounded-full py-2.5 w-full text-xs font-semibold hover:opacity-90 active:scale-95 transition">
                Готово
              </button>
            </m.div>
          ) : (
            <m.div 
              key="buttons"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="flex items-center justify-center gap-4"
            >
              <button onClick={() => !isOpen && setIsEditingCover(true)} className="w-11 h-11 rounded-full bg-white text-[#431E1A] shadow-[0_4px_14px_rgba(35,23,20,0.06)] flex items-center justify-center hover:scale-105 active:scale-95 transition">
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
                  <Popover.Content sideOffset={8} className="bg-white px-3 py-2 rounded-[10px] shadow-[0_10px_30px_rgba(0,0,0,0.1)] text-[11px] font-display font-bold text-[#231714] z-50 flex flex-col gap-2 items-center">
                    <span>Удалить этот альбом?</span>
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

      {/* Editing Modal for Moments */}
      <AnimatePresence>
        {selectedPageId && selectedPage && (
          <m.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/40 flex flex-col justify-end p-2"
          >
            <m.div 
              initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
              className="bg-white rounded-[28px] p-5 shadow-2xl flex flex-col space-y-4 max-h-[85vh] overflow-y-auto"
            >
               <div className="flex justify-between items-center mb-2">
                 <h3 className="text-[17px] font-display font-bold text-[#1A1412]">Момент</h3>
                 <button onClick={() => setSelectedPageId(null)} className="w-8 h-8 rounded-full bg-[#F5EFEA] flex items-center justify-center text-[#1A1412] hover:bg-[#EAE2D5] transition">
                   <X weight="bold" />
                 </button>
               </div>
               
               <label className="block w-full aspect-video bg-[#F5EFEA] rounded-2xl overflow-hidden relative cursor-pointer flex items-center justify-center border-2 border-dashed border-[#8C7A6B]/30 hover:bg-[#EAE2D5] transition">
                 {selectedPage.photo ? (
                   <img src={selectedPage.photo} className="w-full h-full object-cover" />
                 ) : (
                   <div className="text-[#8C7A6B] flex flex-col items-center font-medium text-sm"><Camera className="w-8 h-8 mb-2" /> <span>Загрузить фото</span></div>
                 )}
                 <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, selectedPage.id)} />
               </label>

               <div className="space-y-3">
                 <div>
                   <input type="text" value={selectedPage.title} onChange={e => updatePage(selectedPage.id, { title: e.target.value })} className="w-full bg-[#F5EFEA] text-[#1A1412] font-display font-bold rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-[#DBCAB9]" placeholder="Заголовок" />
                 </div>
                 
                 <div>
                   <input type="text" value={selectedPage.date} onChange={e => updatePage(selectedPage.id, { date: e.target.value })} className="w-full bg-[#F5EFEA] text-[#1A1412] font-display font-bold rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-[#DBCAB9]" placeholder="Дата (например, 24 СЕН)" />
                 </div>

                 <div>
                   <textarea value={selectedPage.text} onChange={e => updatePage(selectedPage.id, { text: e.target.value })} className="w-full bg-[#F5EFEA] text-[#1A1412] rounded-xl p-3.5 min-h-[100px] outline-none focus:ring-2 focus:ring-[#DBCAB9] resize-none" placeholder="Описание момента..." />
                 </div>
               </div>

               <div className="pt-2">
                  <button onClick={() => handleDeletePage(selectedPage.id)} className="w-full py-3.5 rounded-xl bg-[#A44A3F]/10 text-[#A44A3F] font-display font-bold flex items-center justify-center gap-2 hover:bg-[#A44A3F]/20 transition">
                    <Trash weight="bold" className="w-5 h-5" /> Удалить момент
                  </button>
               </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

    </div>
  )
}
