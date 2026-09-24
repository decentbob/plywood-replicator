#!/usr/bin/env node
// Builds two single-file pages from index.html + src/sim.js + src/rchem.js:
//   dist/polygon-chemistry.html           a complete standalone page
//   dist/polygon-chemistry.artifact.html  the same page without the document skeleton (for hosts that wrap it)
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const sim = fs.readFileSync('src/sim.js', 'utf8');
const rchem = fs.readFileSync('src/rchem.js', 'utf8');
const full = html.replace('<script src="src/sim.js"></script>', '<script>\n' + sim + '\n</script>').replace('<script src="src/rchem.js"></script>', '<script>\n' + rchem + '\n</script>');
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/polygon-chemistry.html', full);
const head = full.match(/<head>([\s\S]*?)<\/head>/)[1].replace(/<meta[^>]*>\s*/g, '');
const body = full.match(/<body>([\s\S]*?)<\/body>/)[1];
fs.writeFileSync('dist/polygon-chemistry.artifact.html', head.trim() + '\n' + body.trim() + '\n');
console.log('wrote dist/polygon-chemistry.html and dist/polygon-chemistry.artifact.html (' + (full.length / 1024).toFixed(0) + ' KB)');
