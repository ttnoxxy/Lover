import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCoverflow } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import { ReactSketchCanvas } from 'react-sketch-canvas'
import type { ReactSketchCanvasRef } from 'react-sketch-canvas'
import * as Popover from '@radix-ui/react-popover'
import { m, AnimatePresence, animate, useMotionValue, useTransform } from 'framer-motion'
import WebApp from '@twa-dev/sdk'
import { Camera, BookOpen, SquaresFour, SlidersHorizontal, DotsThree, ShareNetwork, Trash, ArrowUUpLeft, Plus } from '@phosphor-icons/react'

/* Шрифты подключите в index.html:
   <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500&family=IBM+Plex+Mono&display=swap" rel="stylesheet"> */
const HAND = "'Caveat', 'Segoe Print', cursive"
const MONO = "'IBM Plex Mono', ui-monospace, monospace"
const INK = '#4A2320'
const PAPER = '#F5EDE6'
const FLOOR = '#2A1A16'
const LIB_TOP = '#E4D3C6'
const LIB_BOTTOM = '#C9AE9C'
const NOISE = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 .3 0 0 0 0 .2 0 0 0 0 .15 0 0 0 .04 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`
const TILTS = [-2.2, 1.6, -1, 2.4, -2.8, 0.8]

type PageData = { id: string; photo: string; caption: string; meta: string }
type Album = { id: string; title: string; coverColor: string; pages: PageData[] }

const INITIAL_ALBUMS: Album[] = [
  {
    id: '1', title: 'Отпуск 2026', coverColor: '#431E1A',
    pages: [
      { id: 'p1', photo: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop', caption: 'Вечерняя прогулка у воды', meta: '24 сент · Кофейня на Покровке' },
      { id: 'p2', photo: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800&auto=format&fit=crop', caption: 'Уютное утро', meta: '25 сент · Старый город' },
      { id: 'p3', photo: '', caption: '', meta: '' }
    ]
  },
  { id: '2', title: 'Осень вдвоём', coverColor: '#B07D56', pages: [{ id: 'p1', photo: '', caption: 'Парк', meta: '12 окт' }] },
  { id: '3', title: 'Наше начало', coverColor: '#5F6F52', pages: [{ id: 'p1', photo: '', caption: 'Знакомство', meta: '1 сент' }] }
]

const AVAILABLE_COLORS = ['#431E1A', '#A44A3F', '#5F6F52', '#B07D56', '#C2B078']
const BRUSH_COLORS = ['#FAF5EF', '#E5B869', '#E07A5F', '#F2D0C9', '#231714']
const BRUSH_WIDTHS = [3, 6, 14]

/* ---------- Telegram ---------- */
const tg: any = (WebApp as any)?.default ?? WebApp
const tgCall = (fn: (a: any) => void) => { try { fn(tg) } catch { /* вне Telegram */ } }
const haptic = (k: 'light' | 'medium' = 'light') => tgCall(a => a.HapticFeedback?.impactOccurred(k))

/* ---------- utils ---------- */
const getEmboss = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  const isLight = luma > 130;
  return {
    color: isLight ? '#3D2622' : '#F5EDE6',
    textShadow: isLight ? '0 1px 0 rgba(255,255,255,0.6)' : '0 1px 2px rgba(0,0,0,0.4)'
  };
}

/* ---------- Круглая кнопка шапки ---------- */
const Round = ({ children, onClick, active, dark, label }: { children: React.ReactNode; onClick?: () => void; active?: boolean; dark?: boolean; label: string }) => (
  <button
    aria-label={label} onClick={onClick}
    className="w-11 h-11 rounded-full flex items-center justify-center border transition active:scale-95"
    style={{
      borderColor: dark ? 'rgba(245,237,230,.4)' : 'rgba(140,122,107,.4)',
      background: active ? PAPER : 'transparent',
      color: active ? INK : dark ? PAPER : '#1A1412'
    }}
  >{children}</button>
)

/* ---------- Страница-лист с фото-отпечатком ---------- */
type SheetProps = {
  page: PageData | null; idx: number;
  onPhoto: (file: File) => void; onPatch: (patch: Partial<PageData>) => void; onFocus: (i: number) => void
}

const Sheet = ({ page, idx, onPhoto, onPatch, onFocus }: SheetProps) => {
  const [editing, setEditing] = useState(false)
  const rot = TILTS[idx % TILTS.length]
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: PAPER, backgroundImage: NOISE }} onPointerDown={() => onFocus(idx)}>
      <div className="absolute inset-y-0 left-0 w-8 pointer-events-none" style={{ background: `linear-gradient(to right, rgba(60,30,20,.12), transparent)` }} />
      {page ? (
        <div
          className="absolute left-1/2 top-1/2 flex flex-col bg-white"
          style={{ width: '88%', height: '88%', padding: '10px 10px 0', borderRadius: 3, transform: `translate(-50%,-50%) rotate(${rot}deg)`, boxShadow: '0 6px 14px rgba(0,0,0,.28)' }}
        >
          <label className="flex-1 min-h-0 relative overflow-hidden cursor-pointer" style={{ background: '#EBE0D5' }}>
            {page.photo
              ? <img src={page.photo} alt="" className="w-full h-full object-cover" draggable={false} />
              : <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-[#8C7A6B]"><Camera className="w-8 h-8" weight="fill" /><span className="text-sm">Добавить фото</span></span>}
            <input type="file" accept="image/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) onPhoto(f); e.target.value = '' }} />
          </label>
          <div
            className="h-16 shrink-0 flex flex-col items-center justify-center leading-none px-1"
            onClick={() => setEditing(true)}
            onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setEditing(false) }}
          >
            {editing ? (
              <>
                <input
                  autoFocus value={page.caption} placeholder="Подпись" maxLength={40}
                  onChange={e => onPatch({ caption: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && setEditing(false)}
                  className="w-full text-center bg-transparent outline-none" style={{ fontFamily: HAND, fontSize: 24, color: INK }}
                />
                <input
                  value={page.meta} placeholder="Дата · место" maxLength={40}
                  onChange={e => onPatch({ meta: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && setEditing(false)}
                  className="w-full text-center bg-transparent outline-none uppercase mt-1" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.08em', color: '#8A6F64' }}
                />
              </>
            ) : (
              <>
                <span style={{ fontFamily: HAND, fontSize: 24, color: INK, opacity: page.caption ? 1 : 0.35 }}>{page.caption || 'Добавить подпись'}</span>
                {page.meta && <span className="uppercase mt-1" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.08em', color: '#8A6F64' }}>{page.meta}</span>}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="absolute inset-[8%] rounded-sm border border-dashed border-[#B39A8C] flex items-center justify-center text-center text-xs text-[#8A6F64] px-6">
          Нажмите «+», чтобы добавить фото
        </div>
      )}
      <span className="absolute bottom-3 right-4" style={{ fontFamily: MONO, fontSize: 12, color: '#B39A8C' }}>{idx + 1}</span>
    </div>
  )
}

/* ---------- Вертикальный разворот с переплётом посередине ---------- */
type Dir = 'next' | 'prev'

const FlatBook = ({ total, spread, onChange, renderPage }: {
  total: number; spread: number; onChange: (s: number) => void; renderPage: (i: number) => React.ReactNode
}) => {
  const [dir, setDir] = useState<Dir | null>(null)
  const dirRef = useRef<Dir | null>(null)
  const p = useMotionValue(0)
  const box = useRef<HTMLDivElement>(null)
  const start = useRef<{ x: number; t: number } | null>(null)

  useLayoutEffect(() => { if (!dir) p.set(0) }, [dir, spread, p])

  const settle = (d: Dir, commit: boolean) => {
    animate(p, commit ? 1 : 0, {
      type: 'spring', stiffness: 220, damping: 28,
      onComplete: () => {
        if (commit) { onChange(spread + (d === 'next' ? 1 : -1)); haptic('light') }
        dirRef.current = null; setDir(null)
      }
    })
  }
  const canGo = (d: Dir) => (d === 'next' ? spread < total - 1 : spread > 0)
  const flip = (d: Dir) => {
    if (dirRef.current || !canGo(d)) return
    dirRef.current = d; setDir(d); settle(d, true)
  }
  const flipRef = useRef(flip); flipRef.current = flip

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest?.('input')) return
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') flipRef.current('next')
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') flipRef.current('prev')
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  const down = (e: React.PointerEvent) => {
    if (dirRef.current || (e.target as HTMLElement)?.closest?.('input')) return
    start.current = { x: e.clientX, t: performance.now() }
  }
  const move = (e: React.PointerEvent) => {
    if (!start.current) return
    const dx = e.clientX - start.current.x
    if (!dirRef.current) {
      if (Math.abs(dx) < 10) return
      const d: Dir = dx < 0 ? 'next' : 'prev'
      if (!canGo(d)) { start.current = null; return }
      dirRef.current = d; setDir(d); box.current?.setPointerCapture(e.pointerId)
    }
    const w = (box.current?.clientWidth ?? 300)
    const sign = dirRef.current === 'next' ? -1 : 1
    p.set(Math.min(1, Math.max(0, (sign * dx) / w)))
  }
  const end = (e: React.PointerEvent) => {
    const d = dirRef.current
    if (!start.current || !d) { start.current = null; return }
    const dx = e.clientX - start.current.x
    const speed = Math.abs(dx) / Math.max(1, performance.now() - start.current.t)
    start.current = null
    settle(d, p.get() > 0.25 || speed > 0.4)
  }

  const leftVal = useTransform(p, v => (dirRef.current === 'next' ? 14 * (1 - v) : (dirRef.current === 'prev' ? 14 * v : 14)) + '%')
  const shadeVal = useTransform(p, v => (dirRef.current === 'next' ? 0.3 * (1 - v) : (dirRef.current === 'prev' ? 0.3 * v : 0.3)))
  const rotVal = useTransform(p, v => (dirRef.current === 'next' ? -v * 180 : (dirRef.current === 'prev' ? -180 + v * 180 : 0)))

  const slidingIdx = dir === 'next' ? spread + 1 : (dir === 'prev' ? spread : spread + 1)
  const flippingIdx = dir === 'next' ? spread : (dir === 'prev' ? spread - 1 : spread)

  return (
    <div ref={box} className="relative w-full h-full" style={{ perspective: 1800, touchAction: 'none' }} onPointerDown={down} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
      <div className="absolute inset-y-0 left-0" style={{ width: '86%', background: '#EAE6DF', borderRadius: '4px 8px 8px 4px' }} />

      {slidingIdx < total && (
        <m.div
          className="absolute inset-y-0 shadow-lg overflow-hidden"
          style={{ width: '86%', left: leftVal, borderRadius: '4px 8px 8px 4px', zIndex: 1 }}
          onClick={() => { if (!dir && slidingIdx === spread + 1) flip('next') }}
        >
          {renderPage(slidingIdx)}
          <m.div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: shadeVal }} />
        </m.div>
      )}

      {flippingIdx >= 0 && flippingIdx < total && (
        <m.div
          className="absolute inset-y-0 shadow-2xl overflow-hidden origin-left"
          style={{ width: '86%', left: 0, rotateY: rotVal, borderRadius: '4px 8px 8px 4px', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', zIndex: 2 }}
        >
          {renderPage(flippingIdx)}
        </m.div>
      )}
    </div>
  )
}
/* ---------- Экран ---------- */
export const HistoryScreen = ({ onBookOpenChange }: { onBookOpenChange?: (open: boolean) => void }) => {
  const [albums, setAlbums] = useState<Album[]>(INITIAL_ALBUMS)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<'spread' | 'grid'>('spread')
  const [spread, setSpread] = useState(0)
  const [focus, setFocus] = useState(0)
  const [isEditingCover, setIsEditingCover] = useState(false)
  const [activeTab, setActiveTab] = useState<'draw' | 'color' | 'name'>('draw')
  const [strokeColor, setStrokeColor] = useState('#FAF5EF')
  const [strokeWidth, setStrokeWidth] = useState(3)
  const canvasRef = useRef<ReactSketchCanvasRef>(null)

  const activeAlbum = albums[activeIndex] || albums[0]
  const pages = activeAlbum.pages
  const total = pages.length

  useEffect(() => { tgCall(a => { a.expand?.(); a.disableVerticalSwipes?.() }) }, [])
  useEffect(() => { onBookOpenChange?.(isOpen) }, [isOpen, onBookOpenChange])
  useEffect(() => {
    tgCall(a => {
      a.setHeaderColor?.(isOpen ? FLOOR : LIB_TOP)
      a.setBackgroundColor?.(isOpen ? FLOOR : LIB_TOP)
      a.setBottomBarColor?.(isOpen ? FLOOR : LIB_BOTTOM)
    })
  }, [isOpen])
  useEffect(() => {
    if (!isOpen) return
    const close = () => setIsOpen(false)
    tgCall(a => { a.BackButton?.show?.(); a.BackButton?.onClick?.(close) })
    return () => tgCall(a => { a.BackButton?.offClick?.(close); a.BackButton?.hide?.() })
  }, [isOpen])

  const updateAlbum = (id: string, patch: Partial<Album>) => setAlbums(as => as.map(a => (a.id === id ? { ...a, ...patch } : a)))
  const patchPage = (i: number, patch: Partial<PageData>) =>
    updateAlbum(activeAlbum.id, { pages: pages.map((pg, k) => (k === i ? { ...pg, ...patch } : pg)) })
  const openBook = () => { setSpread(0); setFocus(0); setView('spread'); setIsOpen(true); haptic('medium') }

  const handleAdd = () => {
    const id = Date.now().toString()
    if (!isOpen) {
      setAlbums(as => [...as, { id, title: 'Новый альбом', coverColor: AVAILABLE_COLORS[0], pages: [{ id, photo: '', caption: '', meta: '' }] }])
      setActiveIndex(albums.length)
    } else {
      updateAlbum(activeAlbum.id, { pages: [...pages, { id, photo: '', caption: '', meta: '' }] })
      setSpread(pages.length)
    }
  }

  const canDelete = isOpen ? pages.length > 1 : albums.length > 1
  const handleDelete = () => {
    if (!canDelete) return
    if (!isOpen) {
      setAlbums(as => as.filter(a => a.id !== activeAlbum.id))
      setActiveIndex(Math.max(0, activeIndex - 1))
    } else {
      const at = focus < pages.length ? focus : pages.length - 1
      updateAlbum(activeAlbum.id, { pages: pages.filter((_, k) => k !== at) })
      setSpread(s => Math.min(s, pages.length - 2))
      setFocus(0)
    }
    haptic('medium'); tgCall(a => a.HapticFeedback?.notificationOccurred('warning'))
  }

  const renderPage = (i: number) => (
    <Sheet
      page={pages[i] ?? null} idx={i} onFocus={setFocus}
      onPhoto={f => patchPage(i, { photo: URL.createObjectURL(f) })}
      onPatch={patch => patchPage(i, patch)}
    />
  )

  const dark = isOpen
    const circle = 'w-12 h-12 rounded-full bg-white text-[#431E1A] shadow-[0_4px_14px_rgba(35,23,20,0.12)] flex items-center justify-center transition active:scale-95 disabled:opacity-50'

  return (
    <div className="w-full flex-grow flex flex-col pt-2 relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: `linear-gradient(${LIB_TOP}, ${LIB_BOTTOM})` }} />
      <div className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-700" style={{ background: FLOOR, opacity: dark ? 1 : 0 }} />

      {/* Шапка */}
      <div className="flex items-center justify-between px-4 mb-4 relative z-20 shrink-0 h-11 w-full">
        <div className="flex gap-2">
          {!isOpen ? (
            null
          ) : (
            <>
              <Round label="Разворот" active dark onClick={() => setView('spread')}><BookOpen className="w-5 h-5" weight="fill" /></Round>
              <Round label="Сетка страниц" dark active={view === 'grid'} onClick={() => setView('grid')}><SquaresFour className="w-5 h-5" weight="fill" /></Round>
            </>
          )}
        </div>
        
      </div>

      {/* Основная область */}
      <div className="flex-grow min-h-0 relative w-full z-10">
        <AnimatePresence mode="wait" initial={false}>
          {!isOpen ? (
            <m.div key="library" className="absolute inset-0 flex items-center" exit={{ opacity: 0, scale: 1.08 }} transition={{ duration: 0.25 }}>
              <Swiper
                effect="coverflow" grabCursor={!isEditingCover} allowTouchMove={!isEditingCover}
                centeredSlides slidesPerView="auto"
                coverflowEffect={{ rotate: 0, stretch: 0, depth: 0, modifier: 1, slideShadows: false }}
                modules={[EffectCoverflow]}
                onSlideChange={s => { setActiveIndex(s.activeIndex); haptic('light') }}
                className="w-full overflow-visible py-8"
              >
                {albums.map((album, idx) => (
                  <SwiperSlide key={album.id} style={{ width: 'min(72vw, 52vh)', aspectRatio: '3/4', height: 'auto' }}>
                    {({ isActive }: { isActive: boolean }) => (
                      <div
                        className="w-full h-full rounded-l-[4px] rounded-r-[14px] relative overflow-hidden flex select-none transition-all duration-300 origin-bottom"
                        style={{
                          backgroundColor: album.coverColor,
                          filter: isActive ? 'none' : 'brightness(0.82)',
                          transform: isActive ? 'scale(1)' : 'scale(0.92)',
                          boxShadow: `16px 20px 24px rgba(40,20,15,${isActive ? 0.35 : 0.2})`
                        }}
                        onClick={() => { if (!isEditingCover && activeIndex === idx) openBook() }}
                      >
                        <div className="w-[10%] h-full bg-black/20 border-r border-white/10 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.25)] shrink-0" />
                        <div className="absolute inset-x-0 bottom-[14%] px-4 text-center">
                          <h2 className="text-[13px] uppercase tracking-[0.12em] font-display font-bold" style={getEmboss(album.coverColor)}>{album.title}</h2>
                        </div>
                        <div className={`absolute inset-0 z-10 ${isEditingCover && isActive ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                          <ReactSketchCanvas ref={isActive ? canvasRef : null} strokeWidth={strokeWidth} strokeColor={strokeColor} canvasColor="transparent" style={{ border: 'none' }} />
                        </div>
                        <button
                          aria-label="Настройки обложки"
                          onClick={e => { e.stopPropagation(); if (isActive) setIsEditingCover(v => !v) }}
                          className="w-11 h-11 rounded-full bg-black/25 hover:bg-black/40 text-white flex items-center justify-center absolute top-2 right-2 z-20"
                        ><SlidersHorizontal className="w-5 h-5" /></button>
                        <AnimatePresence>
                          {isEditingCover && isActive && (
                            <m.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="absolute top-16 right-3 z-20 flex flex-col gap-2">
                              <button aria-label="Отменить" onClick={e => { e.stopPropagation(); canvasRef.current?.undo() }} className="w-9 h-9 rounded-full bg-black/20 text-white flex items-center justify-center backdrop-blur-md"><ArrowUUpLeft className="w-4 h-4" /></button>
                              <button aria-label="Очистить" onClick={e => { e.stopPropagation(); canvasRef.current?.clearCanvas() }} className="w-9 h-9 rounded-full bg-black/20 text-white flex items-center justify-center backdrop-blur-md"><Trash className="w-4 h-4" /></button>
                            </m.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </SwiperSlide>
                ))}
              </Swiper>
            </m.div>
          ) : view === 'spread' ? (
            <m.div key="book" className="absolute inset-y-0 inset-x-4 mx-auto max-w-[65vh]" style={{ padding: '8px 0' }}
              initial={{ opacity: 0, scale: 0.88, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92 }} transition={{ type: 'spring', stiffness: 160, damping: 22 }}>
              <FlatBook total={total} spread={spread} onChange={setSpread} renderPage={renderPage} />
            </m.div>
          ) : (
            <m.div key="grid" className="absolute inset-0 overflow-y-auto grid grid-cols-2 gap-3 p-4 content-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {pages.map((pg, i) => (
                <button key={pg.id} onClick={() => { setSpread(i); setView('spread') }} className="aspect-[4/3] relative overflow-hidden" style={{ background: PAPER, borderRadius: 5, boxShadow: '0 6px 12px rgba(0,0,0,.4)' }}>
                  {pg.photo ? <img src={pg.photo} alt="" className="w-full h-full object-cover" /> : <Camera className="w-6 h-6 m-auto text-[#8C7A6B]" weight="fill" />}
                  <span className="absolute bottom-1 right-2" style={{ fontFamily: MONO, fontSize: 10, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,.6)' }}>{i + 1}</span>
                </button>
              ))}
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {isOpen && view === 'spread' && (
        <div className="text-center relative z-10 shrink-0 pb-1" style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(245,237,230,.6)' }}>
          {spread + 1} / {pages.length}
        </div>
      )}

      {/* Нижняя область */}
      <div className="mt-auto mb-6 shrink-0 w-full px-4 relative z-20 min-h-[100px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isEditingCover && !isOpen ? (
            <m.div key="editor" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white rounded-[28px] p-4 shadow-sm w-full max-w-xs mx-auto space-y-3">
              <div className="flex bg-[#F5EBE4] rounded-full p-1">
                {([['draw', 'Рисунок'], ['color', 'Цвет'], ['name', 'Название']] as const).map(([k, l]) => (
                  <button key={k} onClick={() => setActiveTab(k)} className={`flex-1 text-[11px] font-bold py-1.5 rounded-full transition ${activeTab === k ? 'bg-white text-[#431E1A] shadow-sm' : 'text-[#8C7A6B]'}`}>{l}</button>
                ))}
              </div>
              {activeTab === 'draw' && (
                <div className="flex items-center justify-between px-2">
                  <div className="flex gap-2">
                    {BRUSH_COLORS.map(c => <button key={c} aria-label={c} onClick={() => setStrokeColor(c)} className={`w-6 h-6 rounded-full shadow-inner transition ${strokeColor === c ? 'scale-110 ring-2 ring-offset-1 ring-black/20' : ''}`} style={{ backgroundColor: c }} />)}
                  </div>
                  <div className="w-px h-5 bg-[#E8D9CA] mx-1" />
                  <div className="flex gap-2">
                    {BRUSH_WIDTHS.map(w => (
                      <button key={w} aria-label={`Толщина ${w}`} onClick={() => setStrokeWidth(w)} className={`w-6 h-6 rounded-full flex items-center justify-center transition ${strokeWidth === w ? 'bg-[#E8D9CA] text-[#431E1A]' : 'bg-[#F5EBE4] text-[#8C7A6B]'}`}>
                        <div className="bg-current rounded-full" style={{ width: w === 3 ? 4 : w === 6 ? 8 : 12, height: w === 3 ? 4 : w === 6 ? 8 : 12 }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'color' && (
                <div className="flex items-center justify-center gap-3 py-1">
                  {AVAILABLE_COLORS.map(c => <button key={c} aria-label={c} onClick={() => updateAlbum(activeAlbum.id, { coverColor: c })} className={`w-8 h-8 rounded-full shadow-inner transition ${activeAlbum.coverColor === c ? 'scale-110 ring-2 ring-offset-2 ring-black/20' : 'hover:scale-105'}`} style={{ backgroundColor: c }} />)}
                </div>
              )}
              {activeTab === 'name' && (
                <input type="text" value={activeAlbum.title} onChange={e => updateAlbum(activeAlbum.id, { title: e.target.value })} placeholder="Название альбома" className="w-full bg-[#F5EBE4] text-[#1A1412] font-bold text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#DBCAB9]" />
              )}
              <button onClick={() => setIsEditingCover(false)} className="bg-[#431E1A] text-white rounded-full py-2.5 w-full text-xs font-semibold active:scale-95 transition">Сохранить обложку</button>
            </m.div>
          ) : (
            <m.div key="buttons" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex items-center justify-center gap-4">
              <button aria-label="Ещё" onClick={() => !isOpen && setIsEditingCover(true)} className={circle}><DotsThree className="w-6 h-6" weight="bold" /></button>
              <button aria-label="Поделиться" disabled={!pages.some(pg => pg.photo)} className={circle}><ShareNetwork className="w-5 h-5" weight="fill" /></button>
              <Popover.Root>
                <Popover.Trigger asChild>
                  <button aria-label={isOpen ? 'Удалить страницу' : 'Удалить альбом'} disabled={!canDelete} className={circle}><Trash className="w-5 h-5" weight="fill" /></button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content sideOffset={8} className="bg-white px-3 py-2 rounded-[10px] shadow-[0_10px_30px_rgba(0,0,0,0.25)] text-[11px] font-bold text-[#231714] z-50 flex flex-col gap-2 items-center">
                    <span>{isOpen ? `Удалить страницу ${Math.min(focus, pages.length - 1) + 1}?` : 'Удалить этот альбом?'}</span>
                    <Popover.Close asChild>
                      <button onClick={handleDelete} className="bg-[#C0392B] text-white px-3 py-1.5 rounded-md w-full">{isOpen ? 'Удалить страницу' : 'Удалить альбом'}</button>
                    </Popover.Close>
                    <Popover.Arrow className="fill-white" />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
              <button aria-label={isOpen ? 'Добавить страницу' : 'Добавить альбом'} onClick={handleAdd} className={circle}><Plus className="w-5 h-5" weight="bold" /></button>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}








