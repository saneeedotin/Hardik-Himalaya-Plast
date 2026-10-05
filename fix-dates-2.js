const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
let changed = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  content = content.replace(/\.toLocaleDateString\("en-GB"\)/g, '.toLocaleDateString("en-IN")');
  content = content.replace(/\.toLocaleDateString\(\)/g, '.toLocaleDateString("en-IN")');
  
  if (original !== content) {
    fs.writeFileSync(file, content);
    changed++;
    console.log('Fixed', file);
  }
});
console.log('Total fixed:', changed);
