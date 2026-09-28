import codecs
import re

with codecs.open('src/screens/HistoryScreen.tsx', 'r', 'utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "import { Camera, Books, BookOpen, SquaresFour, SlidersHorizontal, DotsThree, ShareNetwork, Trash, ArrowUUpLeft, Plus } from '@phosphor-icons/react'",
    "import { Camera, Books, BookOpen, SquaresFour, SlidersHorizontal, DotsThree, ShareNetwork, Trash, ArrowUUpLeft, Plus, MagnifyingGlass, List } from '@phosphor-icons/react'"
)
content = content.replace(
    "import { Camera, Books, BookOpen, SquaresFour, SlidersHorizontal, DotsThree, ShareNetwork, Trash, ArrowUUpLeft, Plus } \nfrom '@phosphor-icons/react'",
    "import { Camera, Books, BookOpen, SquaresFour, SlidersHorizontal, DotsThree, ShareNetwork, Trash, ArrowUUpLeft, Plus, MagnifyingGlass, List } \nfrom '@phosphor-icons/react'"
)

# 2. Add lightenHex function
if 'function lightenHex' not in content:
    lighten_func = """
function lightenHex(hex: string, percent: number) {
  let num = parseInt(hex.replace('#',''),16),
  amt = Math.round(2.55 * percent),
  R = (num >> 16) + amt,
  B = (num >> 8 & 0x00FF) + amt,
  G = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
}

export const HistoryScreen = () => {
"""
    content = content.replace('export const HistoryScreen = () => {', lighten_func)

# 3. Top Bar replacement
topbar_regex = r'\{\/\* Top Bar \*\/\}.*?<div className="flex-grow flex flex-col justify-center items-center relative w-full">'
new_topbar = """{/* Top Bar */}
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
      <div className="flex-grow flex flex-col justify-center items-center relative w-full">"""
content = re.sub(topbar_regex, new_topbar, content, flags=re.DOTALL)

# 4. Swiper modifications
swiper_regex = r'\{\/\* Main Area: Swiper OR Open Book \*\/\}.*?<\/Swiper>'
# Wait, replacing the whole swiper section is safer
new_swiper = """{/* Main Area: Swiper OR Open Book */}
      <div className="flex-grow flex flex-col justify-center items-center relative w-full">
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
                      className="w-full h-full rounded-l-[6px] rounded-r-[22px] relative overflow-hidden flex select-none transition-all duration-300 origin-bottom"
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
                        className="w-11 h-11 rounded-full bg-black/25 hover:bg-black/40 text-white flex items-center justify-center absolute top-3 right-3 z-20"
                      >
                        <SlidersHorizontal className="w-5 h-5" />
                      </button>

                      <AnimatePresence>
                        {isEditingCover && activeIndex === idx && (
                          <m.div 
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute top-16 right-3 z-20 flex flex-col gap-2"
                          >
                            <button onClick={(e) => { e.stopPropagation(); canvasRef.current?.undo() }} className="w-9 h-9 rounded-full bg-black/20 text-white flex items-center justify-center backdrop-blur-md">
                              <ArrowUUpLeft className="w-4 h-4" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); canvasRef.current?.clearCanvas() }} className="w-9 h-9 rounded-full bg-black/20 text-white flex items-center justify-center backdrop-blur-md">
                              <Trash className="w-4 h-4" />
                            </button>
                          </m.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </SwiperSlide>
              ))}
            </Swiper>"""
content = re.sub(swiper_regex, new_swiper, content, flags=re.DOTALL)

with codecs.open('src/screens/HistoryScreen.tsx', 'w', 'utf-8') as f:
    f.write(content)
print("Done")
