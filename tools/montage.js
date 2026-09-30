#!/usr/bin/env node
'use strict';
// Grid of PNG images (with an optional title) rendered by the pre-installed Chromium. Observation only.
//   node tools/montage.js OUT.png COLS "TITLE" IN1.png IN2.png ...
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const [out,cols,title,...ins]=process.argv.slice(2),C=+cols,w=560,h=620,rows=Math.ceil(ins.length/C);
const html=`<html><body style="margin:0;background:#fff;font-family:Arial"><div style="padding:8px 12px;font-size:18px;font-weight:bold">${title}</div>`+
  `<div style="display:grid;grid-template-columns:repeat(${C},${w}px);gap:6px;padding:0 6px">`+ins.map(f=>`<img src="file://${path.resolve(f)}" style="width:${w}px;height:${h}px;object-fit:cover;object-position:top">`).join('')+`</div></body></html>`;
const f=out.replace(/\.png$/,'.html');fs.writeFileSync(f,html);
const chrome=fs.readdirSync('/opt/pw-browsers').filter(d=>d.startsWith('chromium')).map(d=>`/opt/pw-browsers/${d}/chrome-linux/chrome`).find(fs.existsSync);
execFileSync(chrome,['--headless','--no-sandbox','--disable-gpu','--hide-scrollbars','--allow-file-access-from-files',`--screenshot=${path.resolve(out)}`,`--window-size=${C*(w+6)+12},${rows*(h+6)+60+90}`,'file://'+path.resolve(f)],{stdio:'ignore'});
fs.unlinkSync(f);console.log(out);
