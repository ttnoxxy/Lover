const fs = require('fs');
let content = fs.readFileSync('src/screens/HistoryScreen.tsx', 'utf8');

const oldCodeRegex = /\/\* ---------- Страница-лист с фото-отпечатком ---------- \*\/[\s\S]*?(?=\/\* ---------- Экран ---------- \*\/)/;

const newCode = `/* ---------- Страница-лист с фото-отпечатком ---------- */
type SheetProps = {
  page: PageData | null; idx: number;
  onPhoto: (file: File) => void; onPatch: (patch: Partial<PageData>) => void; onFocus: (i: number) => void
}

const Sheet = ({ page, idx, onPhoto, onPatch, onFocus }: SheetProps) => {
  const [editing, setEditing] = useState(false)
  const rot = TILTS[idx % TILTS.length]
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: PAPER, backgroundImage: NOISE }} onPointerDown={() => onFocus(idx)}>
      <div className="absolute inset-y-0 left-0 w-8 pointer-events-none" style={{ background: \`linear-gradient(to right, rgba(60,30,20,.12), transparent)\` }} />
      {page ? (
        <div
          className="absolute left-1/2 top-1/2 flex flex-col bg-white"
          style={{ width: '88%', height: '88%', padding: '10px 10px 0', borderRadius: 3, transform: \`translate(-50%,-50%) rotate(\${rot}deg)\`, boxShadow: '0 6px 14px rgba(0,0,0,.28)' }}
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
      if (e.target?.closest?.('input')) return
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') flipRef.current('next')
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') flipRef.current('prev')
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  const down = (e: React.PointerEvent) => {
    if (dirRef.current || e.target?.closest?.('input')) return
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
`;

content = content.replace(oldCodeRegex, newCode);

// Fix pagination counter text
content = content.replace(
  "{2 * spread + 1}–{Math.min(pages.length, 2 * spread + 2)} / {pages.length}",
  "{spread + 1} / {pages.length}"
);

// Fix total calculation
content = content.replace(
  "const total = Math.max(1, Math.ceil(pages.length / 2))",
  "const total = pages.length"
);

// Fix handleAdd logic
content = content.replace(
  "setSpread(Math.floor(pages.length / 2))",
  "setSpread(pages.length)"
);
content = content.replace(
  "setSpread(s => Math.min(s, Math.ceil((pages.length - 1) / 2) - 1))",
  "setSpread(s => Math.min(s, pages.length - 2))"
);

// Render page calls
content = content.replace(
  "renderPage(i, 'top')",
  "renderPage(i)"
);
content = content.replace(
  "renderPage(i, 'bot')",
  "renderPage(i)"
);

content = content.replace(
  /const renderPage = \(i: number, side: 'top' \| 'bot'\) => \([\s\S]*?\n  \)/,
  `const renderPage = (i: number) => (
    <Sheet
      page={pages[i] ?? null} idx={i} onFocus={setFocus}
      onPhoto={f => patchPage(i, { photo: URL.createObjectURL(f) })}
      onPatch={patch => patchPage(i, patch)}
    />
  )`
);

// Finally, swap out BookSpread rendering in the return block for FlatBook
content = content.replace(
  "<BookSpread total={total} spread={spread} onChange={setSpread} renderPage={renderPage} />",
  "<FlatBook total={total} spread={spread} onChange={setSpread} renderPage={renderPage} />"
);

// Update grid mode behavior: i >> 1 to i
content = content.replace(
  "setSpread(i >> 1)",
  "setSpread(i)"
);

// Ensure the container for FlatBook occupies mostly full height (padding: '16px 8px' or similar instead of arbitrary size).
// Previously it was: className="absolute inset-0 flex items-center justify-center" style={{ containerType: 'size', padding: 4 }}
content = content.replace(
  "className=\"absolute inset-0 flex items-center justify-center\" style={{ containerType: 'size', padding: 4 }}",
  "className=\"absolute inset-0\" style={{ padding: '8px 16px' }}"
);


fs.writeFileSync('src/screens/HistoryScreen.tsx', content, 'utf8');
console.log('Successfully updated to FlatBook horizontal flip');
