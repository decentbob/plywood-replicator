'use strict';
// Chart of line worlds (build run 20261016-0727; observation only): per pair demo output with 'types:' lines, heads by
// root letter (stacked shares; letters on 15% or more coloured, the majority letter written at each turn; a type with a C
// attach side and no '&' on it is a second cell, also when it carries a root: a catcher) and three lines: catchers among
// second cells (black), and among all root carriers those whose own side is the root's complement, plain (nursery, blue)
// or with '!' alone (guarded nursery, red). Time axis 0-480k (LC_T=steps: another end; build run 20261016-1227), LC_TITLE=text
// another title; rows are named by file (w1: seed 1), LC_NAMES='a,b,...' names them instead; LC_MAX=n (explore run
// 20261016-1602): bars show head counts on a scale of 0-n instead of shares (the lines stay shares).
// LC_SHAPE=1 (build run 20261016-1902): each row is two stacked bars instead, head-shaped cells (front 'c@', top half)
// and catcher-shaped cells (front 'C@', bottom half), by their own side as census --shape reads it: guarded nursery (red),
// plain nursery (pink), plain (blue), a site of another letter (orange), no root (grey); the half's root letter on most
// of its cells is written at each change
// LC_PARTNER=1 (build run 20261017-0726): each row stacks the rootless partners (one attach side 'C@', no '&') by the
// letters of their sides that are neither the front nor a lysis side (letters on 15% or more coloured, 'immune', both free
// sides lysis, dark grey; the majority letter written at each turn), and a black line: chain cells (an attach side that
// complements another side of the same type) as a share of the cells listed
//   node tri/linechart.js out.png runs/p36/w1.txt [more files]
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const sides=t=>t.match(/[-a-zA-Z][.@&|?!]*/g),cp=L=>L===L.toLowerCase()?L.toUpperCase():L.toLowerCase();
const PAL=['#e6194b','#3cb44b','#ffe119','#4363d8','#f58231','#911eb4','#46f0f0','#f032e6','#bcf60c','#fabebe','#008080','#e6beff','#9a6324','#800000','#aaffc3','#808000'];
const [out,...files]=process.argv.slice(2);const rows=[];
for(const f of files){const R=[];for(const line of fs.readFileSync(f,'utf8').split('\n')){const m=line.match(/^types: t=(\d+) .*?\| (.*)$/);if(!m)continue;
  const r={t:+m[1],H:{},nh:0,ns:0,cat:0,heads:[]};
  for(const e of m[2].split(', ')){const [c,t]=e.split(' ');if(!t)continue;const n=+c,s=sides(t);if(!s||s.length!==3)continue;
    const i=s.findIndex(x=>x[0]==='C'&&x.includes('@')&&!x.includes('&'));if(i>=0){r.ns+=n;if(s.some(x=>x.includes('@')&&x.includes('&')))r.cat+=n;continue;}
    const h=s.findIndex(x=>x.includes('@')&&x.includes('&'));if(h>=0){const L=s[h][0];r.H[L]=(r.H[L]||0)+n;r.nh+=n;r.heads.push([L,s.filter((x,j)=>j!==h),n]);}}
  let rt=0,nu=0,ng=0;for(const e of m[2].split(', ')){const [c,t]=e.split(' ');if(!t)continue;const n=+c,s=sides(t);if(!s||s.length!==3)continue;
    const h=s.findIndex(x=>x.includes('@')&&x.includes('&'));if(h<0)continue;rt+=n;const z=cp(s[h][0]),o=s.filter((x,i)=>i!==h);if(o.some(x=>x===z))nu+=n;if(o.some(x=>x===z+'!'))ng+=n;}
  r.nur=rt?nu/rt:0;r.nurG=rt?ng/rt:0;
  R.push(r);}rows.push([path.basename(f,'.txt'),R]);}
const W=1100,h=110,top=40,T=+(process.env.LC_T||480000),MX=+(process.env.LC_MAX||0),NM=(process.env.LC_NAMES||'').split(',').filter(Boolean),X=t=>60+t/T*(W-80);const svg=[`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${top+rows.length*(h+24)+110}"><rect width="100%" height="100%" fill="#fff"/>`,
 `<text x="10" y="24" font-family="Arial" font-size="16" font-weight="bold">${(process.env.LC_TITLE||'').replace(/&/g,'&amp;').replace(/</g,'&lt;')||"The line's world (PAW=2), seeds 1-8 to 480k: heads by root letter; lines: catchers (black), nursery (blue), guarded nursery (red)"}</text>`];
const col={};let ci=0;const colour=L=>col[L]||(col[L]=PAL[ci++%PAL.length]);
const SH=process.env.LC_SHAPE==='1',PT=process.env.LC_PARTNER==='1',RC={G:'#d00000',N:'#ff9eb0',P:'#4363d8',S:'#f58231',O:'#999'};
if(SH)files.forEach((f,k)=>{const R=[];for(const line of fs.readFileSync(f,'utf8').split('\n')){const m=line.match(/^types: t=(\d+) .*?\| (.*)$/);if(!m)continue;const r={t:+m[1],c:{n:0,R:{}},C:{n:0,R:{}}};
    for(const e of m[2].split(', ')){const [c,t]=e.split(' ');if(!t)continue;const n=+c,s=sides(t);if(!s||s.length!==3)continue;const i=s.findIndex(x=>(x[0]==='c'||x[0]==='C')&&x.includes('@')&&!x.includes('&'));if(i<0)continue;
      const q=r[s[i][0]],hh=s.findIndex(x=>x.includes('@')&&x.includes('&'));q.n+=n;let role='O';if(hh>=0){const L=s[hh][0],o=s[3-i-hh];q.R[L]=(q.R[L]||0)+n;role=o[0]===cp(L)&&!o.includes('.')?(o.includes('!')?'G':'N'):o[0]==='-'?'P':'S';}q[role]=(q[role]||0)+n;}
    R.push(r);}rows[k].push(R);});
if(PT)files.forEach((f,k)=>{const R=[];for(const line of fs.readFileSync(f,'utf8').split('\n')){const m=line.match(/^types: t=(\d+) .*?\| (.*)$/);if(!m)continue;const r={t:+m[1],P:{},np:0,ch:0,cells:0};
    for(const e of m[2].split(', ')){const [c,t]=e.split(' ');if(!t)continue;const n=+c,s=sides(t);if(!s||s.length!==3)continue;r.cells+=n;if(s.some(x=>x.includes('&')))continue;
      const i=s.findIndex(x=>x.includes('@'));if(i<0||s.filter(x=>x.includes('@')).length>1)continue;const o=s.filter((x,j)=>j!==i);
      if(o.some(y=>y[0]===cp(s[i][0])&&!y.includes('.'))){r.ch+=n;continue;}if(s[i][0]!=='C')continue;const L=o.filter(y=>!y.includes('!')).map(y=>y[0]).join('')||'immune';r.P[L]=(r.P[L]||0)+n;r.np+=n;}
    R.push(r);}rows[k].push(R);});
rows.forEach(([name,R,R2],k)=>{const y0=top+k*(h+24)+10;if(PT){svg.push(`<text x="6" y="${y0+h/2}" font-family="Arial" font-size="13">${NM[k]||name}</text><rect x="60" y="${y0}" width="${W-80}" height="${h}" fill="#eee"/>`);let last=null;
    for(const r of R2){if(!r.np)continue;const x0=X(r.t-5000),x1=X(r.t);let acc=0;for(const [L,n] of Object.entries(r.P).sort((a,b)=>b[1]-a[1])){const hh=n/r.np*h;
      svg.push(`<rect x="${x0.toFixed(1)}" y="${(y0+h-acc-hh).toFixed(1)}" width="${(x1-x0+0.5).toFixed(1)}" height="${hh.toFixed(1)}" fill="${L==='immune'?'#444':n/r.np>0.15?colour(L):'#bbb'}"/>`);acc+=hh;}
      const M=Object.keys(r.P).find(L=>r.P[L]>r.np/2);if(M&&M!==last){svg.push(`<text x="${(x0+2).toFixed(1)}" y="${y0-2}" font-family="Arial" font-size="11">${M}</text>`);last=M;}}
    svg.push(`<polyline fill="none" stroke="#000" stroke-width="1.6" points="${R2.map(r=>`${X(r.t).toFixed(1)},${(y0+h-(r.cells?r.ch/r.cells:0)*h).toFixed(1)}`).join(' ')}"/>`);return;}
  if(SH){svg.push(`<text x="6" y="${y0+h/2}" font-family="Arial" font-size="13">${NM[k]||name}</text><rect x="60" y="${y0}" width="${W-80}" height="${h}" fill="#eee"/>`);
    ['c','C'].forEach((F,half)=>{const yb=y0+half*h/2,hh=h/2-1;let last=null;for(const r of R2){const q=r[F],x0=X(r.t-5000),x1=X(r.t);if(!q.n)continue;let acc=0;
      for(const z of 'GNPSO'){const v=(q[z]||0)/q.n*hh;if(v>0)svg.push(`<rect x="${x0.toFixed(1)}" y="${(yb+acc).toFixed(1)}" width="${(x1-x0+0.5).toFixed(1)}" height="${v.toFixed(1)}" fill="${RC[z]}"/>`);acc+=v;}
      const M=Object.keys(q.R).find(L=>q.R[L]>q.n/2);if(M&&M!==last){svg.push(`<text x="${(x0+2).toFixed(1)}" y="${(yb+11).toFixed(1)}" font-family="Arial" font-size="10" fill="#fff">${M}</text>`);last=M;}}});return;}svg.push(`<text x="6" y="${y0+h/2}" font-family="Arial" font-size="13">${NM[k]||name.replace('w','seed ')}</text><rect x="60" y="${y0}" width="${W-80}" height="${h}" fill="#eee"/>`);
  for(let j=0;j<R.length;j++){const r=R[j],x0=X(r.t-5000),x1=X(r.t);if(!r.nh)continue;let acc=0;const tot=MX||r.nh;
    for(const [L,n] of Object.entries(r.H).sort((a,b)=>b[1]-a[1])){const hh=Math.min(n/tot*h,h-acc);svg.push(`<rect x="${x0.toFixed(1)}" y="${(y0+h-acc-hh).toFixed(1)}" width="${(x1-x0+0.5).toFixed(1)}" height="${hh.toFixed(1)}" fill="${n/r.nh>0.15?colour(L):'#bbb'}"/>`);
      if(n/r.nh>0.5&&(j===0||Object.keys(R[j-1].H).sort((a,b)=>R[j-1].H[b]-R[j-1].H[a])[0]!==L))svg.push(`<text x="${(x0+2).toFixed(1)}" y="${y0-2}" font-family="Arial" font-size="11">${L}</text>`);acc+=hh;}}
  const line=(g,c)=>svg.push(`<polyline fill="none" stroke="${c}" stroke-width="1.6" points="${R.filter(r=>r.nh||r.ns).map(r=>`${X(r.t).toFixed(1)},${(y0+h-g(r)*h).toFixed(1)}`).join(' ')}"/>`);
  line(r=>r.ns?r.cat/r.ns:0,'#000');line(r=>r.nur||0,'#1f4fff');line(r=>r.nurG||0,'#d00000');});
for(let t=0;t<=T;t+=T/8)svg.push(`<text x="${X(t)}" y="${top+rows.length*(h+24)+16}" font-family="Arial" font-size="11" text-anchor="middle">${t/1000}k</text>`);
svg.push('</svg>');const svgf=out.replace(/\.png$/,'.svg');fs.writeFileSync(svgf,svg.join('\n'));
const c=fs.readdirSync('/opt/pw-browsers').filter(d=>d.startsWith('chromium')).map(d=>'/opt/pw-browsers/'+d+'/chrome-linux/chrome').find(fs.existsSync);
execFileSync(c,['--headless','--no-sandbox','--disable-gpu','--hide-scrollbars',`--screenshot=${path.resolve(out)}`,`--window-size=${W},${top+rows.length*(h+24)+110}`,'file://'+path.resolve(svgf)],{stdio:'ignore'});fs.unlinkSync(svgf);
