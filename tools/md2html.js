#!/usr/bin/env node
// Minimal Markdown -> HTML for the subset used in DESIGN.md: ATX headings, paragraphs, unordered and
// ordered lists, pipe tables, fenced code, horizontal rules, blockquotes, and inline code/bold/italic/links.
// Usage: node tools/md2html.js DESIGN.md > out.html   (emits a body fragment only)
const fs = require('fs');
const src = fs.readFileSync(process.argv[2], 'utf8').split('\n');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function inline(s) {
  const codes = [];
  s = esc(s).replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return '@@' + (codes.length - 1) + '@@'; });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[\s(])\*([^*]+)\*/g, '$1<em>$2</em>');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return s.replace(/@@(\d+)@@/g, (_, i) => '<code>' + codes[i] + '</code>');
}
const out = [];
let i = 0, para = [];
const flush = () => { if (para.length) { out.push('<p>' + inline(para.join(' ')) + '</p>'); para = []; } };
while (i < src.length) {
  const line = src[i];
  if (/^```/.test(line)) { flush(); const buf = []; i++; while (i < src.length && !/^```/.test(src[i])) buf.push(src[i++]); i++; out.push('<pre><code>' + esc(buf.join('\n')) + '</code></pre>'); continue; }
  const h = line.match(/^(#{1,6})\s+(.*)$/);
  if (h) { flush(); out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); i++; continue; }
  if (/^---+\s*$/.test(line)) { flush(); out.push('<hr>'); i++; continue; }
  if (/^\|/.test(line)) {
    flush(); const rows = []; while (i < src.length && /^\|/.test(src[i])) rows.push(src[i++]);
    const cells = (r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
    const head = cells(rows[0]); const body = rows.slice(2).map(cells);
    out.push('<table><thead><tr>' + head.map((c) => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>' +
      body.map((r) => '<tr>' + r.map((c) => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table>');
    continue;
  }
  if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
    flush(); const ordered = /^\s*\d+\./.test(line); const items = [];
    while (i < src.length && (/^\s*[-*]\s+/.test(src[i]) || /^\s*\d+\.\s+/.test(src[i]) || /^\s{2,}\S/.test(src[i]))) {
      if (/^\s*([-*]|\d+\.)\s+/.test(src[i])) items.push(src[i].replace(/^\s*([-*]|\d+\.)\s+/, ''));
      else items[items.length - 1] += ' ' + src[i].trim();
      i++;
    }
    out.push((ordered ? '<ol>' : '<ul>') + items.map((t) => '<li>' + inline(t) + '</li>').join('') + (ordered ? '</ol>' : '</ul>'));
    continue;
  }
  if (/^>\s?/.test(line)) { flush(); const buf = []; while (i < src.length && /^>\s?/.test(src[i])) buf.push(src[i++].replace(/^>\s?/, '')); out.push('<blockquote><p>' + inline(buf.join(' ')) + '</p></blockquote>'); continue; }
  if (line.trim() === '') { flush(); i++; continue; }
  para.push(line.trim()); i++;
}
flush();
process.stdout.write(out.join('\n') + '\n');
