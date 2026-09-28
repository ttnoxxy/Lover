const fs = require('fs');
let content = fs.readFileSync('src/screens/HistoryScreen.tsx', 'utf8');

// 1. Remove Sheet and FlatBook components
content = content.replace(/\/\* ---------- Страница-лист с фото-отпечатком ---------- \*\/[\s\S]*?\/\* ---------- Экран ---------- \*\//, '/* ---------- Экран ---------- */');

// 2. Remove 'view' state
content = content.replace(/const \[view, setView\] = useState<'spread' \| 'grid'>\('spread'\)\n/, '');

// 3. Update openBook function
content = content.replace(
  "const openBook = () => { setSpread(0); setFocus(0); setView('spread'); setIsOpen(true); haptic('medium') }",
  "const openBook = () => { setIsOpen(true); haptic('medium') }"
);

// 4. Update the render logic: remove view === 'spread' block
content = content.replace(
  /\) : view === 'spread' \? \([\s\S]*?\) : \(/,
  ") : ("
);

// 5. Update grid button onClick
content = content.replace(
  /onClick=\{\(\) => \{ setSpread\(i\); setView\('spread'\) \}\}/g,
  "onClick={() => {}}"
);

// 6. Remove the spread pagination indicator
content = content.replace(
  /\{isOpen && view === 'spread' && \([\s\S]*?\}\)/,
  ""
);

fs.writeFileSync('src/screens/HistoryScreen.tsx', content, 'utf8');
