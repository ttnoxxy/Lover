const fs = require('fs');
let content = fs.readFileSync('src/screens/HistoryScreen.tsx', 'utf8');

// Replace the getEmboss function with a simpler, high-contrast version
content = content.replace(
  /const getEmboss = \(hex: string\) => \{[\s\S]*?return \{[\s\S]*?\};\n\}/,
  `const getEmboss = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  const isLight = luma > 130;
  return {
    color: isLight ? '#3D2622' : '#F5EDE6',
    textShadow: isLight ? '0 1px 0 rgba(255,255,255,0.6)' : '0 1px 2px rgba(0,0,0,0.4)'
  };
}`
);

// Replace the H2 classes to use the main screen fonts
content = content.replace(
  /className="text-\[12px\] uppercase tracking-\[0\.14em\] font-medium"/,
  'className="text-[13px] uppercase tracking-[0.12em] font-display font-bold"'
);

fs.writeFileSync('src/screens/HistoryScreen.tsx', content, 'utf8');
console.log('Fonts updated and contrast enhanced');
