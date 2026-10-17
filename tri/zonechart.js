'use strict';
// The decay map read (explore run 20261017-2304; observation only): per pair demo output with 'zone:' lines (PADZ), the
// share of type set A among A and B in each of the ten bins of x. Types are comma lists, any rotation (ZC_A, ZC_B).
//   node tri/zonechart.js FILES                   a line per file at its last census (ZC_T=t: that census): A's share in the
//                                                 zone's half (bins 0-4) and the other (5-9), A+B cells, other bonded cells
//   node tri/zonechart.js out.png FILES           a chart: a row per file, time across, bins of x up (bin 0 at the bottom;
//                                                 the dashed line is the zone's edge), red A, blue B, grey neither; bins
//                                                 with more bonded cells of other types than of A and B are drawn pale
// ZC_TITLE=text a title; ZC_NAMES='a,b,...' row names (default: file names); ZC_EDGE=k the edge's bin (5)
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process'),{canon}=require('./sim');
const set=v=>new Set((v||'').split(',').filter(Boolean).map(canon)),A=set(process.env.ZC_A),B=set(process.env.ZC_B);
if(!A.size||!B.size)throw Error('ZC_A and ZC_B: comma lists of types');
let args=process.argv.slice(2);const out=args[0]&&args[0].endsWith('.png')?args.shift():null;
const read=f=>fs.readFileSync(f,'utf8').split('\n').filter(l=>l.startsWith('zone: ')).map(l=>{const parts=l.split(' | '),t=+parts[0].match(/t=(\d+)/)[1],r={t,a:Array(10).fill(0),b:Array(10).fill(0),o:Array(10).fill(0)};
  for(const p of parts.slice(1)){const w=p.split(' '),c=w.slice(1).map(Number);if(w[0]==='blanks')continue;const q=w[0]==='other'?r.o:A.has(w[0])?r.a:B.has(w[0])?r.b:r.o;c.forEach((k,i)=>{q[i]+=k;});}
  return r;});
const sum=(a,i,j)=>a.slice(i,j).reduce((x,y)=>x+y,0),E=+(process.env.ZC_EDGE||5);
if(!out){for(const f of args){const R=read(f),T=+(process.env.ZC_T||0),r=T?R.find(x=>x.t===T):R[R.length-1];if(!r){console.log(f,'no zone line');continue;}
    const h=(i,j)=>{const a=sum(r.a,i,j),b=sum(r.b,i,j);return `${a+b?(a/(a+b)).toFixed(2):'-'} (${a+b}, other ${sum(r.o,i,j)})`;};
    console.log(`${path.basename(f,'.txt')} t=${r.t} A share: zone ${h(0,E)} | rest ${h(E,10)}`);}
  process.exit(0);}
const rows=args.map(f=>[path.basename(f,'.txt'),read(f)]),NM=(process.env.ZC_NAMES||'').split(',').filter(Boolean),T=Math.max(...rows.map(([,R])=>R.length?R[R.length-1].t:0)),W=900,h=100,top=40,X=t=>70+t/T*(W-90);
const svg=[`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${top+rows.length*(h+14)+40}"><rect width="100%" height="100%" fill="#fff"/>`,
  `<text x="10" y="24" font-family="Arial" font-size="15" font-weight="bold">${(process.env.ZC_TITLE||'share of A (red) against B (blue) by x').replace(/&/g,'&amp;').replace(/</g,'&lt;')}</text>`];
rows.forEach(([name,R],k)=>{const y0=top+k*(h+14);svg.push(`<text x="6" y="${y0+h/2}" font-family="Arial" font-size="12">${NM[k]||name}</text>`);
  R.forEach((r,j)=>{const x0=X(j?R[j-1].t:0),x1=X(r.t);for(let i=0;i<10;i++){const a=r.a[i],b=r.b[i],n=a+b,f=n?a/n:0,c=n?`rgb(${Math.round(60+180*f)},${Math.round(60*(1-Math.abs(2*f-1)))},${Math.round(240-180*f)})`:'#ccc';
    svg.push(`<rect x="${x0.toFixed(1)}" y="${(y0+h-(i+1)*h/10).toFixed(1)}" width="${(x1-x0+0.5).toFixed(1)}" height="${(h/10+0.5).toFixed(1)}" fill="${c}"${n&&r.o[i]>n?' fill-opacity="0.35"':''}/>`);}});
  svg.push(`<line x1="70" x2="${W-20}" y1="${y0+h-E*h/10}" y2="${y0+h-E*h/10}" stroke="#000" stroke-dasharray="6,4"/>`);});
for(let q=0;q<=4;q++)svg.push(`<text x="${X(q*T/4)}" y="${top+rows.length*(h+14)+12}" font-family="Arial" font-size="11" text-anchor="middle">${q*T/4000}k</text>`);
svg.push('</svg>');const svgf=out.replace(/\.png$/,'.svg');fs.writeFileSync(svgf,svg.join('\n'));
const c=fs.readdirSync('/opt/pw-browsers').filter(d=>d.startsWith('chromium')).map(d=>'/opt/pw-browsers/'+d+'/chrome-linux/chrome').find(fs.existsSync);
execFileSync(c,['--headless','--no-sandbox','--disable-gpu','--hide-scrollbars',`--screenshot=${path.resolve(out)}`,`--window-size=${W},${top+rows.length*(h+14)+130}`,'file://'+path.resolve(svgf)],{stdio:'ignore'});fs.unlinkSync(svgf);
