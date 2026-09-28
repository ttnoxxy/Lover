const fs = require('fs');
let content = fs.readFileSync('src/screens/HistoryScreen.tsx', 'utf8');

content = content.replace(
  "const [view, setView] = useState<'spread' | 'grid'>('spread')",
  "const [view, setView] = useState<'spread' | 'grid'>('grid')"
);

content = content.replace(
  "const openBook = () => { setSpread(0); setFocus(0); setView('spread'); setIsOpen(true); haptic('medium') }",
  "const openBook = () => { setIsOpen(true); haptic('medium') }"
);

content = content.replace(
  "onClick={() => { setSpread(i); setView('spread') }}",
  "onClick={() => {}}"
);

fs.writeFileSync('src/screens/HistoryScreen.tsx', content, 'utf8');
