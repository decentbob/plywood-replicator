#!/usr/bin/env node
'use strict';
// Render actual block polygons of a saved state (Sim.saveState JSON, or a raw record with finalState/initial) to SVG
// and, if the output ends in .png, rasterize it with the pre-installed Chromium. Observation only.
//   node tools/snapshot.js INPUT.json[.gz] OUT.png|OUT.svg [--key finalState] [--title TEXT]
const fs=require('fs'),path=require('path'),zlib=require('zlib'),{execFileSync}=require('child_process');
const {Sim,NV,TNAME}=require('../src/sim');
const args=process.argv.slice(2),opt=k=>{const i=args.indexOf(k);return i>=0?args[i+1]:null;};
const [input,out]=args;if(!input||!out)throw Error('usage: snapshot.js INPUT OUT.png|OUT.svg [--key K] [--title T]');
const raw=JSON.parse(input.endsWith('.gz')?zlib.gunzipSync(fs.readFileSync(input)):fs.readFileSync(input));
const st=raw.arrays?raw:raw[opt('--key')||'finalState']||raw.final||raw.initial;
const s=Sim.fromState(st),W=s.p.W,H=s.p.H,S=520,k=S/Math.max(W,H);
const rim=st.arrays.rimBond?Sim.fromState(st).rimBond:null;
const fill={A:'#9cc3e6',B:'#5f8fd6',C:'#8fcf9f',D:'#c9a0f0',E:'#ffe36e',J:'#f3b0d0',P:'#f0a35e',Q:'#e4785a',M:'#b7e3a0'};
const svg=[`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S+30}" viewBox="0 0 ${S} ${S+30}">`,`<rect width="${S}" height="${S+30}" fill="#f5f7f8"/>`,`<rect width="${S}" height="${S}" fill="#15222d"/>`];
for(let u=0;u<s.n;u++){
  const pts=[];for(let q=u*NV,e=q+s.corners(u);q<e;q++)pts.push(`${((s.px[u]+s.ox[q])*k).toFixed(1)},${((s.py[u]+s.oy[q])*k).toFixed(1)}`);
  const programmed=s.kind&&s.kind[u]>0;   // programmable blocks: a written kind is drawn darker
  svg.push(`<polygon points="${pts.join(' ')}" fill="${programmed?'#2f9e5a':fill[TNAME[s.type[u]]]||'#ccc'}" stroke="#2c4452" stroke-width=".6"/>`);
}
svg.push(`<text x="8" y="${S+20}" font-family="Arial,sans-serif" font-size="14" fill="#233542">${(opt('--title')||path.basename(input)+' t='+s.t).replace(/</g,'&lt;')}</text></svg>`);
const svgFile=out.endsWith('.png')?out.replace(/\.png$/,'.svg'):out;fs.writeFileSync(svgFile,svg.join('\n'));
if(out.endsWith('.png')){
  const chrome=fs.readdirSync('/opt/pw-browsers').filter(d=>d.startsWith('chromium')).map(d=>`/opt/pw-browsers/${d}/chrome-linux/chrome`).find(fs.existsSync);
  execFileSync(chrome,['--headless','--no-sandbox','--disable-gpu','--hide-scrollbars',`--screenshot=${path.resolve(out)}`,`--window-size=${S},${S+30+90}`,'file://'+path.resolve(svgFile)],{stdio:'ignore'});
}
console.log(out);
