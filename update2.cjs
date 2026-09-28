const fs = require('fs');
let content = fs.readFileSync('src/screens/HistoryScreen.tsx', 'utf8');

// 1. Remove the title block
const titleBlockRegex = /<div className="absolute inset-x-0 top-0 h-full flex flex-col items-center justify-center pointer-events-none">[\s\S]*?<\/div>/;
content = content.replace(titleBlockRegex, '');

// 2. Reduce padding around the book to make it larger (from padding: 14 to padding: 4)
content = content.replace("style={{ containerType: 'size', padding: 14 }}", "style={{ containerType: 'size', padding: 4 }}");

fs.writeFileSync('src/screens/HistoryScreen.tsx', content, 'utf8');
console.log('Done');
