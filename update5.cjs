const fs = require('fs');
let content = fs.readFileSync('src/screens/HistoryScreen.tsx', 'utf8');

// Replace the lighten function with getEmboss
content = content.replace(
  /const lighten = \(hex: string, pct: number\) => \{[\s\S]*?return `rgb\(\$\{f\(n >> 16\)\},\$\{f\(\(n >> 8\) & 255\)\},\$\{f\(n & 255\)\}\)`\n\}/,
  `const getEmboss = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  const isLight = luma > 130;
  const pct = isLight ? -45 : 25;
  const f = (c: number) => Math.min(255, Math.max(0, Math.round(c + (pct > 0 ? (255 - c) : c) * pct / 100)));
  return {
    color: \`rgb(\${f(r)},\${f(g)},\${f(b)})\`,
    textShadow: isLight ? '0 1px 0 rgba(255,255,255,0.45)' : '0 1px 0 rgba(0,0,0,0.35)'
  };
}`
);

// Replace the inline style usage
content = content.replace(
  /style=\{\{ color: lighten\(album\.coverColor, 20\), textShadow: '0 1px 0 rgba\(0,0,0,0\.35\)' \}\}/,
  "style={getEmboss(album.coverColor)}"
);

fs.writeFileSync('src/screens/HistoryScreen.tsx', content, 'utf8');
console.log('Replaced lighten with adaptive getEmboss');
