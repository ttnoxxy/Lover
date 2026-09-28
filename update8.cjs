const fs = require('fs');
let content = fs.readFileSync('src/screens/HistoryScreen.tsx', 'utf8');

// 1. Remove Sheet and FlatBook components entirely
content = content.replace(/\/\* ---------- Страница-лист с фото-отпечатком ---------- \*\/[\s\S]*?\/\* ---------- Экран ---------- \*\//, '/* ---------- Экран ---------- */');

// 2. Remove 'view' state
content = content.replace(/const \[view, setView\] = useState<'spread' \| 'grid'>\('spread'\)\n/, '');

// 3. Update openBook function
content = content.replace(
  "const openBook = () => { setSpread(0); setFocus(0); setView('spread'); setIsOpen(true); haptic('medium') }",
  "const openBook = () => { setIsOpen(true); haptic('medium') }"
);

// 4. Replace view rendering logic using string replace
const viewRenderStart = ") : view === 'spread' ? (";
const viewRenderEnd = ") : (";
const startIndex = content.indexOf(viewRenderStart);
if (startIndex !== -1) {
  const endIndex = content.indexOf(viewRenderEnd, startIndex);
  if (endIndex !== -1) {
    content = content.slice(0, startIndex) + ") : (" + content.slice(endIndex + viewRenderEnd.length);
  }
}

// 5. Update grid button onClick (using a simpler regex)
content = content.replace(
  /onClick=\{\(\) => \{ setSpread\(i\); setView\('spread'\) \}\}/g,
  "onClick={() => {}}"
);

// 6. Remove the spread pagination indicator
const paginationIndicatorRegex = /\{isOpen && view === 'spread' && \([\s\S]*?\}\)/;
content = content.replace(paginationIndicatorRegex, "");

fs.writeFileSync('src/screens/HistoryScreen.tsx', content, 'utf8');
console.log('Removed FlatBook and spread view logic');
