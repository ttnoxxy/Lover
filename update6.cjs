const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<AnimatePresence mode="wait">[\s\S]*?<\/AnimatePresence>/;

const newCode = `<div className="relative flex-grow flex flex-col">
              <div className={\`absolute inset-0 flex flex-col transition-opacity duration-300 \${activeTab === 'главная' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'}\`}>
                <HomeScreen tgUser={tgUser} installedWidgets={installedWidgets} setInstalledWidgets={setInstalledWidgets} />
              </div>

              <div className={\`absolute inset-0 flex flex-col transition-opacity duration-300 \${activeTab === 'история' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'}\`}>
                <HistoryScreen />
              </div>
            </div>`;

content = content.replace(regex, newCode);
fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App.tsx updated to preserve screen state');
