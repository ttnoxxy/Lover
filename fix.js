const fs = require('fs');
let c = fs.readFileSync('src/screens/HistoryScreen.tsx', 'utf8');
const before = c.substring(0, c.indexOf('const INITIAL_ALBUMS'));
const after = c.substring(c.indexOf('const AVAILABLE_COLORS'));
const newAlbums = \const INITIAL_ALBUMS = [
  {
    id: '1', title: 'Осень 2026', coverColor: '#431E1A',
    pages: [
      { id: 'p1', photo: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop', date: '24 сентября · 20:41', location: 'Кофейня на Покровке', title: 'Вечер у воды', text: '«Взяли раф и случайно дошли до набережной»' },
      { id: 'p2', photo: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600&auto=format&fit=crop', date: '24 сентября', time: '21:15', location: 'Набережная', title: 'Тот самый раф', text: 'Раф — 390 ₽\\\\nКруассан — 250 ₽' },
      { id: 'p3', photo: '', date: '25 сентября', time: '10:00', location: 'Дома', title: 'Утро', text: 'Проснулись и поняли, что сегодня никуда не пойдем.' }
    ]
  },
  {
    id: '2', title: 'Отпуск', coverColor: '#B07D56',
    pages: [
      { id: 'p1', photo: '', date: '12 августа', title: 'Билеты', text: 'Купили билеты в Питер.' }
    ]
  }
]

\;
fs.writeFileSync('src/screens/HistoryScreen.tsx', before + newAlbums + after);
