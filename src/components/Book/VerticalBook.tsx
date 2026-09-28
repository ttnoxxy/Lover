// @ts-nocheck
import React, { useState } from 'react';
import { m, useAnimation } from 'framer-motion'; import type { PanInfo } from 'framer-motion';
import { Plus } from '@phosphor-icons/react';
import WebApp from '@twa-dev/sdk';

interface Photo {
  id: string;
  url: string;
  caption: string;
  locationDate: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

interface PageData {
  id: string;
  photos: Photo[];
}

export const VerticalBook = ({ 
  pages, 
  onAddPhoto, 
  onUpdatePhoto,
  onEmptyTap
}: { 
  pages: PageData[], 
  onAddPhoto: (pageId: string) => void,
  onUpdatePhoto: (pageId: string, photoId: string, updates: Partial<Photo>) => void,
  onEmptyTap: (pageId: string) => void
}) => {
  const [spreadIndex, setSpreadIndex] = useState(0);
  const controls = useAnimation();

  const handleDragEnd = async (e: any, info: PanInfo) => {
    const isSwipeUp = info.offset.y < -100 || info.velocity.y < -0.5;
    const isSwipeDown = info.offset.y > 100 || info.velocity.y > 0.5;

    try {
      const app = (WebApp as any)?.default || WebApp;
      if (app && app.ready && app.HapticFeedback) {
        app.HapticFeedback.impactOccurred('light');
      }
    } catch(err) {}

    if (isSwipeUp && spreadIndex < Math.ceil(pages.length / 2) - 1) {
      setSpreadIndex(s => s + 1);
    } else if (isSwipeDown && spreadIndex > 0) {
      setSpreadIndex(s => s - 1);
    }
  };

  const topPage = pages[spreadIndex * 2];
  const bottomPage = pages[spreadIndex * 2 + 1];

  const renderPhoto = (pageId: string, photo: Photo) => (
    <m.div
      key={photo.id}
      drag
      dragMomentum={false}
      whileDrag={{ scale: 1.03, boxShadow: '0 8px 16px rgba(0,0,0,0.3)' }}
      initial={{ x: photo.x, y: photo.y, rotate: photo.rotation, scale: photo.scale }}
      style={{ 
        position: 'absolute',
        boxShadow: '0 4px 10px rgba(0,0,0,0.28)',
        backgroundColor: 'white',
        padding: '8px 8px 40px 8px',
        width: '84%',
        left: '8%',
        top: '10%'
      }}
    >
      <img src={photo.url} className="w-full h-auto object-cover border border-black/5" alt="" />
      <div className="absolute bottom-1 left-0 right-0 flex flex-col items-center justify-center pointer-events-none">
        {photo.caption ? (
          <div className="text-[#4A2320] text-[18px] text-center leading-tight font-handwriting px-2" style={{ fontFamily: 'Caveat, cursive' }}>
            {photo.caption}
          </div>
        ) : (
          <div className="text-[#4A2320]/40 text-[18px] text-center leading-tight font-handwriting px-2 border-b border-dashed border-[#4A2320]/30 pb-0.5">
            Добавить подпись
          </div>
        )}
        <div className="text-[#8A6F64] text-[9px] uppercase tracking-[0.08em] font-mono mt-1">
          {photo.locationDate || 'ДАТА · МЕСТО'}
        </div>
      </div>
      {/* Invisible tap target for editing caption */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[40px] z-10 cursor-pointer"
        onClick={() => {
           const newCaption = prompt("Введите подпись:", photo.caption);
           if (newCaption !== null) {
              onUpdatePhoto(pageId, photo.id, { caption: newCaption });
           }
        }}
      />
    </m.div>
  );

  const renderPage = (page: PageData | undefined, isTop: boolean) => {
    if (!page) return null;
    return (
      <div 
        className="w-full flex-grow relative bg-[#F9F8F6] overflow-hidden"
        style={{ 
          aspectRatio: '4/3', 
          borderRadius: isTop ? '5px 5px 0 0' : '0 0 5px 5px',
          boxShadow: isTop ? 'inset 0 -10px 15px -10px rgba(0,0,0,0.1)' : 'inset 0 10px 15px -10px rgba(0,0,0,0.1)'
        }}
        onClick={(e) => {
          if (page.photos.length === 0) onEmptyTap(page.id);
        }}
      >
        {/* SVG Noise Texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

        {/* Thickness lines (right & bottom) */}
        <div className="absolute right-0 top-0 bottom-0 w-[1.5px] bg-[#EAE6DF]" />
        <div className="absolute right-[1.5px] top-0 bottom-0 w-[1.5px] bg-[#F2EFEA]" />
        
        {page.photos.length === 0 ? (
          <div className="absolute inset-4 border border-dashed border-[#DBCAB9] flex items-center justify-center pointer-events-none rounded">
            <span className="text-[#8C7A6B] text-xs">Нажмите, чтобы добавить фото</span>
          </div>
        ) : (
          page.photos.map(p => renderPhoto(page.id, p))
        )}

        {/* Page Number */}
        <div className={`absolute bottom-2 ${isTop ? 'left-3' : 'right-3'} text-[#B39A8C] text-[10px] font-mono`}>
          {pages.findIndex(p => p.id === page.id) + 1}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex-grow flex flex-col justify-center items-center px-[14px]">
      <m.div 
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        onDragEnd={handleDragEnd}
        className="w-full flex flex-col items-center relative"
        style={{
          boxShadow: '0 18px 28px rgba(0,0,0,.45), 0 2px 4px rgba(0,0,0,.3)',
          borderRadius: '5px'
        }}
      >
        {renderPage(topPage, true)}
        
        {/* Spine/Gap */}
        <div className="w-full h-[12px] bg-gradient-to-b from-[#E5E0D8] via-[#C8BFAF] to-[#E5E0D8] relative flex items-center justify-between px-8 z-10 shrink-0 border-y border-black/5">
           <div className="w-[10px] h-[3px] bg-black/30 rounded-full" />
           <div className="w-[10px] h-[3px] bg-black/30 rounded-full" />
        </div>

        {renderPage(bottomPage, false)}
      </m.div>

      {/* Pagination under spread */}
      <div className="mt-4 text-[11px] font-mono text-white/60">
        {spreadIndex * 2 + 1}–{Math.min(spreadIndex * 2 + 2, pages.length)} / {pages.length}
      </div>
    </div>
  );
};
