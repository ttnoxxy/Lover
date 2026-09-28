const fs = require('fs');
let content = fs.readFileSync('src/screens/HistoryScreen.tsx', 'utf8');

const newAlbums = `const INITIAL_ALBUMS = [
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
];`;

let parts = content.split('const AVAILABLE_COLORS');
let head = parts[0].substring(0, parts[0].indexOf('const INITIAL_ALBUMS'));
content = head + newAlbums + '\n\nconst AVAILABLE_COLORS' + parts[1];

fs.writeFileSync('src/screens/HistoryScreen.tsx', content, 'utf8');
console.log('Fixed INITIAL_ALBUMS reliably');
