import codecs
import re

with codecs.open('src/screens/HistoryScreen.tsx', 'r', 'utf-8') as f:
    content = f.read()

# 1. Imports
content = re.sub(r'import \{[^}]+\} from \'@phosphor-icons/react\'', "import { Camera, Books, BookOpen, SquaresFour, SlidersHorizontal, DotsThree, ShareNetwork, Trash, ArrowUUpLeft, Plus, MagnifyingGlass, List } from '@phosphor-icons/react'", content)
content = content.replace("import { m, AnimatePresence } from 'framer-motion'", "import { m, AnimatePresence } from 'framer-motion'\nimport { VerticalBook } from '../components/Book/VerticalBook'")

# 2. Albums data
old_albums = r"const INITIAL_ALBUMS = \[\n.*?\]\n\nconst AVAILABLE_COLORS"
new_albums = """const INITIAL_ALBUMS = [
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
]

const AVAILABLE_COLORS"""
content = re.sub(old_albums, new_albums, content, flags=re.DOTALL)

# 3. Add lightenHex just before HistoryScreen
lighten_func = """function lightenHex(hex: string, percent: number) {
  let num = parseInt(hex.replace('#',''),16),
  amt = Math.round(2.55 * percent),
  R = (num >> 16) + amt,
  B = (num >> 8 & 0x00FF) + amt,
  G = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
}

export const HistoryScreen = () => {"""
content = content.replace('export const HistoryScreen = () => {', lighten_func)

# 4. Remove 'Page' component entirely to fix TS1128
page_regex = r'const Page = React\.forwardRef<HTMLDivElement, any>\(\(props, ref\) => \{.*?\}\)\n\n'
content = re.sub(page_regex, '', content, flags=re.DOTALL)

# 5. Remove canvasRef and onFlip inside HistoryScreen
content = re.sub(r'const canvasRef = useRef<ReactSketchCanvasRef>\(null\)\n', '', content)
on_flip_regex = r'const onFlip = \(e: any\) => \{.*?(?=const updateAlbum =)const updateAlbum ='
content = re.sub(r'const onFlip = \(e: any\) => \{[\s\S]*?\}\n\n', '', content)

# 6. Replace Main Area
main_area_regex = r'\{\/\* Main Area: Swiper OR Open Book \*\/\}.*?\{\/\* Bottom Area \*\/\}'
new_main_area = """{/* Main Area: Swiper OR Open Book */}
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

      {/* Bottom Area */}"""
content = re.sub(main_area_regex, new_main_area, content, flags=re.DOTALL)

with codecs.open('src/screens/HistoryScreen.tsx', 'w', 'utf-8') as f:
    f.write(content)
print("Done")
