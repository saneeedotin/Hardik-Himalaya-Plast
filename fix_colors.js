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
      .replace(/dark:bg-\[#0a0a0a\]/g, 'dark:bg-zinc-950')
      .replace(/dark:bg-\[#121820\]/g, 'dark:bg-zinc-950')
      .replace(/dark:bg-\[#0a0f16\]/g, 'dark:bg-black')
      .replace(/dark:bg-\[#0B1120\]/g, 'dark:bg-black');

    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      filesChanged++;
    }
  }
});

console.log('Modified ' + filesChanged + ' files to fix Tailwind arbitrary values.');
