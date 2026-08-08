const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function updateFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  if (filePath.includes('Layout') || filePath.includes('BismillahList') || filePath.includes('AlhamdulillahList')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Overview was previously updated to hardcoded dark mode, let's revert/fix it if it's there
  content = content.replace(/bg-slate-900\/40 backdrop-blur-xl/g, 'bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl');
  content = content.replace(/shadow-\[0_8px_32px_rgba\(0,0,0,0\.3\)\]/g, 'shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]');
  content = content.replace(/border-emerald-900\/50/g, 'border-gray-200 dark:border-emerald-900/50');
  content = content.replace(/text-slate-100/g, 'text-gray-900 dark:text-slate-100');
  content = content.replace(/text-slate-400/g, 'text-gray-500 dark:text-slate-400');
  content = content.replace(/bg-slate-800\/80/g, 'bg-gray-50 dark:bg-slate-800/80');
  content = content.replace(/border-slate-700/g, 'border-gray-200 dark:border-slate-700');
  content = content.replace(/bg-emerald-500\/10/g, 'bg-emerald-100 dark:bg-emerald-500/10');
  content = content.replace(/bg-blue-500\/10/g, 'bg-blue-100 dark:bg-blue-500/10');
  content = content.replace(/bg-purple-500\/10/g, 'bg-purple-100 dark:bg-purple-500/10');
  content = content.replace(/bg-amber-500\/10/g, 'bg-amber-100 dark:bg-amber-500/10');
  
  // Update other files that still have hardcoded bg-white
  content = content.replace(/bg-white([^"]*)border-gray-200/g, 'bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl$1border-gray-200 dark:border-emerald-900/50');
  content = content.replace(/bg-white([^"]*)border-gray-100/g, 'bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl$1border-gray-100 dark:border-emerald-900/50');
  content = content.replace(/text-gray-900/g, 'text-gray-900 dark:text-slate-100');
  content = content.replace(/text-gray-500/g, 'text-gray-500 dark:text-slate-400');
  content = content.replace(/text-gray-600/g, 'text-gray-600 dark:text-slate-300');
  content = content.replace(/bg-gray-50/g, 'bg-gray-50 dark:bg-slate-800/50');
  content = content.replace(/border-gray-200(?! dark:border)/g, 'border-gray-200 dark:border-slate-700');
  content = content.replace(/border-gray-300(?! dark:border)/g, 'border-gray-300 dark:border-slate-700');

  // Fix up double replacements
  content = content.replace(/dark:text-slate-100 dark:text-slate-100/g, 'dark:text-slate-100');
  content = content.replace(/dark:text-slate-400 dark:text-slate-400/g, 'dark:text-slate-400');
  content = content.replace(/dark:bg-slate-800\/50 dark:bg-slate-800\/50/g, 'dark:bg-slate-800/50');
  content = content.replace(/dark:border-slate-700 dark:border-slate-700/g, 'dark:border-slate-700');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

walkDir(path.join(__dirname, 'src/pages'), updateFile);
