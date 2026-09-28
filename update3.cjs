const fs = require('fs');
let content = fs.readFileSync('src/screens/HistoryScreen.tsx', 'utf8');

// Replace width: 68vw with width: 82vw
content = content.replace(
  "style={{ width: '68vw', aspectRatio: '3/4', height: 'auto' }}",
  "style={{ width: '82vw', aspectRatio: '3/4', height: 'auto' }}"
);

// Optional: decrease py-8 on swiper if needed? The user mentioned free space, py-8 is 2rem = 32px, which is fine.

fs.writeFileSync('src/screens/HistoryScreen.tsx', content, 'utf8');
console.log('Book size increased');
