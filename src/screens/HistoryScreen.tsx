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
    id: '1', title: 'Отпуск 2026', coverColor: '#2C2B29',
    pages: [
      { id: 'p1', photo: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop', date: '24 СЕН', title: 'ВЕЧЕР У ВОДЫ', text: 'Взяли самый вкусный раф и гуляли до ночи.' },
      { id: 'p2', photo: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600&auto=format&fit=crop', date: '25 СЕН', title: 'УЮТНОЕ УТРО', text: 'Завтрак с видом на старый город и красивые улицы.' }
    ]
  },
  {
    id: '2', title: 'Осень вдвоём', coverColor: '#4A3D36',
    pages: [
      { id: 'p1', photo: '', date: '12 ОКТ', title: 'ПАРК', text: 'Собрали букет из желтых листьев.' }
    ]
  },
  {
    id: '3', title: 'Архив', coverColor: '#364035',
    pages: [
      { id: 'p1', photo: '', date: '1 НОЯ', title: 'КИНО', text: 'Смотрели старые фильмы весь день.' }
    ]
  }
]

const AVAILABLE_COLORS = ['#2C2B29', '#4A3D36', '#364035', '#4A2521', '#8C7A6B']
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
    if (!isOpen) {
      if (albums.length <= 1) return;
      setAlbums(albums.filter(a => a.id !== activeAlbum.id))
      setActiveIndex(Math.max(0, activeIndex - 1))
    }
  }

  const handleDeletePage = (pageId: string) => {
    updateAlbum(activeAlbum.id, { pages: activeAlbum.pages.filter((p: any) => p.id !== pageId) })
    setSelectedPageId(null)
  }

  const selectedPage = activeAlbum.pages.find((p: any) => p.id === selectedPageId)

  return (
    <div className="w-full h-screen bg-[#F5EBE4] flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 shrink-0 mt-2">
         <div className="flex flex-col">
            {!isOpen ? (
               <div className="flex items-center gap-2">
                 <Books className="w-6 h-6 text-[#1A1412]" weight="duotone" />
                 <h1 className="text-[20px] font-bold text-[#1A1412] tracking-tight">История</h1>
               </div>
            ) : (
               <m.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
                 <button onClick={handleCloseBook} className="w-10 h-10 rounded-full bg-[#1A1311] text-[#FAF5EF] flex items-center justify-center shadow-sm transition hover:scale-105 active:scale-95">
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
              <m.h1 key={activeAlbum.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-[22px] font-bold text-[#1A1412] tracking-tight cursor-pointer leading-none">
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
      <div className="flex-grow flex flex-col justify-center items-center relative w-full px-4 overflow-hidden py-2">
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
              className="w-full h-full pt-4"
            >
              {albums.map((album, idx) => {
                const coverPhoto = album.pages.find((p: any) => p.photo)?.photo;
                return (
                  <SwiperSlide key={album.id} style={{ width: 216, height: 290 }}>
                    <div 
                      onClick={handleOpenBook}
                      className="w-[216px] h-[290px] rounded-r-[18px] rounded-l-[4px] overflow-hidden relative shadow-[20px_20px_40px_rgba(0,0,0,0.15)] transition-transform duration-300 border-y border-r border-[#000000]/10 cursor-pointer flex" 
                      style={{ backgroundColor: activeIndex === idx ? album.coverColor : '#EAE2D5', transform: activeIndex === idx ? 'scale(1)' : 'scale(0.92)' }}
                    >
                      {/* Fabric Spine */}
                      <div className="w-[22px] h-full bg-black/15 border-r border-black/20 shrink-0 shadow-[inset_-2px_0_5px_rgba(0,0,0,0.25)] relative z-30" />
                      
                      {/* Cover Content */}
                      <div className="absolute inset-0 pl-[22px] z-10 flex flex-col">
                         {coverPhoto ? (
                           <div className="w-full h-full relative">
                             <img src={coverPhoto} className="w-full h-full object-cover filter contrast-[1.05] sepia-[0.05] opacity-80 mix-blend-multiply" alt="" />
                             <div className="absolute inset-0 bg-black/30" />
                             <h2 className="absolute inset-x-4 top-14 text-white text-[24px] font-serif tracking-wide text-center leading-tight shadow-sm z-20">{album.title}</h2>
                           </div>
                         ) : (
                           <div className="w-full h-full pt-14 px-5 text-center flex flex-col items-center">
                             <h2 className="text-white text-[24px] font-serif tracking-wide leading-tight">{album.title}</h2>
                           </div>
                         )}
                      </div>

                      {/* Moleskine Elastic Band */}
                      <div className="absolute top-0 bottom-0 right-[18px] w-[11px] bg-black/25 shadow-[inset_1px_0_4px_rgba(0,0,0,0.4)] z-20" />

                      {/* Drawing Canvas */}
                      <div className="absolute inset-0 pl-[22px] z-30 pointer-events-none">
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
                        className="w-8 h-8 rounded-full bg-black/25 hover:bg-black/40 text-white flex items-center justify-center absolute top-3 right-3 z-40 pointer-events-auto"
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                      </button>

                      <AnimatePresence>
                        {isEditingCover && activeIndex === idx && (
                          <m.div 
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute top-14 right-3 z-40 flex flex-col gap-2 pointer-events-auto"
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
                )
              })}
            </Swiper>
          </div>
        ) : (
          <m.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full flex-grow bg-[#1A1311] p-2.5 rounded-[22px] border border-[#382B26] shadow-[0_24px_48px_rgba(26,19,17,0.28)] flex flex-col overflow-y-auto no-scrollbar max-h-[72vh]"
          >
            <div className="grid grid-cols-3 gap-2 auto-rows-auto">
              {activeAlbum.pages.map((page: any, idx: number) => {
                if (idx === 0) {
                  return (
                    <React.Fragment key={page.id}>
                      {/* Module A */}
                      <div className="col-span-3 aspect-[16/9] bg-[#261D1A] border border-white/[0.06] rounded-[14px] overflow-hidden relative transition hover:border-white/15 cursor-pointer" onClick={() => setSelectedPageId(page.id)}>
                         <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-black/45 via-transparent to-transparent z-10" />
                         <div className="text-[9px] font-medium text-[#FAF5EF]/75 tracking-wide text-center pt-2.5 z-10 relative">{page.title || 'ГЛАВНЫЙ КАДР'}</div>
                         {page.photo ? (
                           <img src={page.photo} className="absolute inset-0 w-full h-full object-cover filter contrast-[1.05]" alt="" />
                         ) : (
                           <div className="absolute inset-0 flex items-center justify-center"><Camera className="w-6 h-6 text-white/20" /></div>
                         )}
                      </div>
                      {/* Module B */}
                      <div className="col-span-2 min-h-[118px] p-3.5 flex flex-col justify-between text-left bg-[#261D1A] border border-white/[0.06] rounded-[14px] overflow-hidden relative transition hover:border-white/15 cursor-pointer" onClick={() => setSelectedPageId(page.id)}>
                         <div className="text-[11.5px] leading-[1.35] font-normal text-[#FAF5EF]/90 line-clamp-5">{page.text || 'Нажмите, чтобы описать этот момент и сохранить ваши общие впечатления...'}</div>
                      </div>
                      {/* Module C */}
                      <div className="col-span-1 min-h-[118px] p-3 flex flex-col items-center justify-between text-center bg-[#261D1A] border border-white/[0.06] rounded-[14px] overflow-hidden relative transition hover:border-white/15 cursor-pointer" onClick={() => setSelectedPageId(page.id)}>
                         <div className="text-[8.5px] text-[#FAF5EF]/50 tracking-wider uppercase">Дата</div>
                         <div className="text-[15px] font-semibold text-[#FAF5EF] leading-tight my-auto">{page.date || '24.09'}</div>
                      </div>
                    </React.Fragment>
                  )
                } else {
                  const isPhotoRow = idx % 2 !== 0;
                  if (isPhotoRow) {
                    return (
                      <React.Fragment key={page.id}>
                        {/* Narrow vertical module */}
                        <div className="col-span-1 aspect-[3/4.2] p-3 flex flex-col items-center justify-between bg-[#261D1A] border border-white/[0.06] rounded-[14px] overflow-hidden relative transition hover:border-white/15 cursor-pointer" onClick={() => setSelectedPageId(page.id)}>
                          <div className="text-[8.5px] text-[#FAF5EF]/50 tracking-wider uppercase">Кадр 0{idx + 1}</div>
                          <div className="text-[28px] font-semibold text-[#FAF5EF] tracking-tight my-auto">0{idx + 1}</div>
                        </div>
                        {/* Wide photo module */}
                        <div className="col-span-2 aspect-[4/3] bg-[#261D1A] border border-white/[0.06] rounded-[14px] overflow-hidden relative transition hover:border-white/15 cursor-pointer" onClick={() => setSelectedPageId(page.id)}>
                          <div className="text-[9px] font-medium text-[#FAF5EF]/75 tracking-wide text-center pt-2.5 z-10 relative">{page.title || 'МОМЕНТ'}</div>
                          {page.photo ? (
                            <img src={page.photo} className="absolute inset-0 w-full h-full object-cover filter contrast-[1.05]" alt="" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center"><Camera className="w-6 h-6 text-white/20" /></div>
                          )}
                        </div>
                      </React.Fragment>
                    )
                  } else {
                    return (
                      <React.Fragment key={page.id}>
                        {/* Typography module */}
                        <div className="col-span-2 p-3.5 flex flex-col justify-between text-left min-h-[104px] bg-[#261D1A] border border-white/[0.06] rounded-[14px] overflow-hidden relative transition hover:border-white/15 cursor-pointer" onClick={() => setSelectedPageId(page.id)}>
                          <h3 className="text-[20px] font-semibold text-[#FAF5EF] tracking-tight leading-none line-clamp-1">{page.title || 'История'}</h3>
                          <p className="text-[10.5px] text-[#FAF5EF]/70 leading-snug mt-3 line-clamp-2">{page.text || 'Нажмите, чтобы описать этот момент и сохранить впечатления...'}</p>
                          <div className="mt-auto text-[8.5px] text-[#FAF5EF]/50 uppercase tracking-widest pt-2">{page.date || 'ДАТА'}</div>
                        </div>
                        {/* Aspect ratio / tag module */}
                        <div className="col-span-1 p-3 flex flex-col items-center justify-between text-center min-h-[104px] bg-[#261D1A] border border-white/[0.06] rounded-[14px] overflow-hidden relative transition hover:border-white/15 cursor-pointer" onClick={() => setSelectedPageId(page.id)}>
                          <div className="text-[8.5px] text-[#FAF5EF]/50 tracking-wider uppercase">Формат</div>
                          <div className="text-[22px] font-medium text-[#FAF5EF] my-auto">16:9</div>
                        </div>
                      </React.Fragment>
                    )
                  }
                }
              })}
              
              {/* Add new moment module */}
              <div onClick={handleAdd} className="col-span-3 py-3.5 mt-1 bg-[#261D1A]/60 border border-dashed border-white/15 rounded-[14px] flex items-center justify-center gap-2 text-[11px] font-medium text-[#FAF5EF]/70 hover:text-white hover:bg-[#261D1A] hover:border-white/30 transition cursor-pointer">
                <Plus className="w-4 h-4" /> Добавить момент
              </div>
            </div>

            {/* Footer inside Bento */}
            <div className="flex justify-between items-center px-2 pt-3 pb-1 mt-2 text-[8.5px] font-mono text-[#FAF5EF]/40 tracking-wider border-t border-white/[0.04]">
              <span className="uppercase">{activeAlbum.title}</span>
              <span>0{activeIndex + 1}</span>
            </div>
          </m.div>
        )}
      </div>

      {/* Editing Modal */}
      <AnimatePresence>
        {selectedPageId && selectedPage && (
          <m.div 
            initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
            className="absolute inset-0 z-50 bg-[#1A1311] flex flex-col p-4 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-[#FAF5EF]">Редактировать момент</h3>
              <button onClick={() => setSelectedPageId(null)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                <X weight="bold" />
              </button>
            </div>
            
            <div className="space-y-4 flex-grow">
              <label className="block w-full aspect-video bg-[#261D1A] border border-white/10 rounded-xl overflow-hidden relative cursor-pointer flex items-center justify-center">
                {selectedPage.photo ? (
                  <img src={selectedPage.photo} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-white/40 flex flex-col items-center"><Camera className="w-8 h-8 mb-2" /> <span>Загрузить фото</span></div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, selectedPage.id)} />
              </label>

              <div>
                <label className="text-[10px] text-white/50 uppercase tracking-wider pl-2 mb-1 block">Заголовок</label>
                <input type="text" value={selectedPage.title} onChange={e => updatePage(selectedPage.id, { title: e.target.value })} className="w-full bg-[#261D1A] border border-white/10 text-[#FAF5EF] rounded-xl p-3 outline-none focus:border-white/30" placeholder="Заголовок" />
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] text-white/50 uppercase tracking-wider pl-2 mb-1 block">Дата</label>
                  <input type="text" value={selectedPage.date} onChange={e => updatePage(selectedPage.id, { date: e.target.value })} className="w-full bg-[#261D1A] border border-white/10 text-[#FAF5EF] rounded-xl p-3 outline-none focus:border-white/30" placeholder="24 СЕН" />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-white/50 uppercase tracking-wider pl-2 mb-1 block">Описание</label>
                <textarea value={selectedPage.text} onChange={e => updatePage(selectedPage.id, { text: e.target.value })} className="w-full bg-[#261D1A] border border-white/10 text-[#FAF5EF] rounded-xl p-3 min-h-[100px] outline-none focus:border-white/30 resize-none" placeholder="Описание момента..." />
              </div>
            </div>

            <div className="pt-6 pb-8">
               <button onClick={() => handleDeletePage(selectedPage.id)} className="w-full py-3 rounded-xl bg-red-500/20 text-red-400 font-semibold flex items-center justify-center gap-2">
                 <Trash weight="bold" /> Удалить момент
               </button>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Bottom Area */}
      {!isOpen && (
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
                  Готово
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
      )}
    </div>
  )
}
