#!/usr/bin/env node
// Renders DESIGN.md as a styled HTML fragment (title + style + body) at dist/design.artifact.html,
// and as a complete page at dist/design.html. The stylesheet is the one the original design
// artifact used, so the published document keeps its look across revisions.
const fs = require('fs');
const { execFileSync } = require('child_process');
const body = execFileSync('node', ['tools/md2html.js', 'DESIGN.md'], { encoding: 'utf8' });
const style = `:root{color-scheme:light dark;--md-bg:#fff;--md-text:rgba(0,0,0,.8);--md-muted:rgba(0,0,0,.6);--md-fill:rgba(0,0,0,.04);--md-fill-strong:rgba(0,0,0,.06);--md-rule:rgba(0,0,0,.1);--md-rule-strong:rgba(0,0,0,.16);--md-link:hsl(210 100% 45%)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--md-bg:#0d0d0d;--md-text:rgba(255,255,255,.85);--md-muted:rgba(255,255,255,.6);--md-fill:rgba(255,255,255,.06);--md-fill-strong:rgba(255,255,255,.09);--md-rule:rgba(255,255,255,.14);--md-rule-strong:rgba(255,255,255,.22);--md-link:hsl(210 100% 72%)}}
:root[data-theme="dark"]{color-scheme:dark;--md-bg:#0d0d0d;--md-text:rgba(255,255,255,.85);--md-muted:rgba(255,255,255,.6);--md-fill:rgba(255,255,255,.06);--md-fill-strong:rgba(255,255,255,.09);--md-rule:rgba(255,255,255,.14);--md-rule-strong:rgba(255,255,255,.22);--md-link:hsl(210 100% 72%)}
:root[data-theme="light"]{color-scheme:light}
body{background:var(--md-bg);color:var(--md-text);max-width:720px;margin:0 auto;padding-block:32px;padding-inline:20px;display:flex;flex-direction:column;gap:10px;font:14px/1.55 -apple-system,BlinkMacSystemFont,'SF Pro','Segoe UI',sans-serif;overflow-wrap:break-word}
body>:first-child{margin-top:0}
h1,h2,h3,h4,h5,h6{margin:6px 0 0;line-height:1.25;font-weight:600;text-wrap:balance}
h1{font-size:1.35em}h2{font-size:1.15em;color:var(--md-muted);margin-top:14px}h3,h4,h5,h6{font-size:1em}
p,ul,ol,blockquote,table,pre,hr{margin:0}
strong{font-weight:600}
a{color:var(--md-link);text-decoration:none}a:hover{text-decoration:underline}
ul,ol{display:flex;flex-direction:column;gap:6px;padding-left:22px}ul{list-style:disc}ol{list-style:decimal}
blockquote{display:flex;flex-direction:column;gap:10px;border-left:2px solid var(--md-rule);padding-left:10px;color:var(--md-muted)}
:not(pre)>code{background:var(--md-fill);padding:1px 3px;border-radius:4px;font:.92em 'SF Mono',ui-monospace,Menlo,Consolas,monospace}
pre{background:var(--md-fill);padding:10px 12px;border-radius:6px;overflow-x:auto;font:12px/1.5 'SF Mono',ui-monospace,Menlo,Consolas,monospace;margin-block:4px}
pre code{background:none;padding:0;font:inherit}
.tbl{overflow-x:auto}
table{width:100%;border-collapse:separate;border-spacing:2px;font:inherit}
th,td{padding:6px 8px;border-radius:3px;text-align:left;vertical-align:top}
th{background:var(--md-fill-strong);font-weight:600}td{background:var(--md-fill)}
:is(th,td) :not(pre)>code{background:transparent}
hr{border:0;border-top:1px solid var(--md-rule-strong);margin-block:10px}`;
const wrapped = body.replace(/<table>/g, '<div class="tbl"><table>').replace(/<\/table>/g, '</table></div>');
const fragment = `<title>Polygon Chemistry</title>\n<style>\n${style}\n</style>\n${wrapped}`;
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/design.artifact.html', fragment);
fs.writeFileSync('dist/design.html', `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n<title>Polygon Chemistry design</title>\n<style>\n${style}\n</style>\n</head><body>\n${wrapped}\n</body></html>`);
console.log('wrote dist/design.artifact.html and dist/design.html');
