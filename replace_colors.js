const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

let filesChanged = 0;

walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content
      // Replace main card backgrounds
      .replace(/dark:bg-\[#121820\]/g, 'dark:bg-[#0a0a0a]')
      // Replace app/input backgrounds
      .replace(/dark:bg-\[#0a0f16\]/g, 'dark:bg-black')
      .replace(/dark:bg-\[#0B1120\]/g, 'dark:bg-black')
      // Replace border colors to match neutral tone
      .replace(/dark:border-slate-800\/80/g, 'dark:border-zinc-800/80')
      .replace(/dark:border-slate-800/g, 'dark:border-zinc-800')
      .replace(/dark:border-slate-700/g, 'dark:border-zinc-800');

    if (filePath.endsWith('globals.css')) {
      newContent = newContent
        .replace(/--background: #090d12;/g, '--background: #000000;')
        .replace(/--card: #121820;/g, '--card: #0a0a0a;')
        .replace(/background-color: #090d12;/g, 'background-color: #000000;')
        // Update borders and muted tones in css
        .replace(/--muted: #1a222c;/g, '--muted: #18181b;')
        .replace(/--border: #1e2632;/g, '--border: #27272a;');
    }

    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      filesChanged++;
    }
  }
});

console.log('Modified ' + filesChanged + ' files.');
