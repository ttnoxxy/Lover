import codecs
import re

with codecs.open('src/screens/HistoryScreen.tsx', 'r', 'utf-8') as f:
    content = f.read()

# Replace INITIAL_ALBUMS manually
old_albums = r"const INITIAL_ALBUMS = \[\s*\{.*?\}\s*\]\n\nconst AVAILABLE_COLORS"
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

with codecs.open('src/screens/HistoryScreen.tsx', 'w', 'utf-8') as f:
    f.write(content)
