'use strict';
// Pictures: SVG drawn by headless Chromium into PNG, plus the saved state (OUT.json.gz) next to it.
// Colours: strand face triangles tan, hidden backs brown, fills teal-dark, docked (copy in progress) pale teal, grown
// (glue-bonded) grey-blue, free dark grey. A coloured bar inside each glued side (dashed: upper case).
const fs=require('fs'),path=require('path'),zlib=require('zlib'),{execFileSync}=require('child_process');
const {SFACE,SBACK,DOCKED,GROWN,gname}=require('./sim');
const PAL=['#e6194b','#3cb44b','#ffe119','#4363d8','#f58231','#911eb4','#46f0f0','#f032e6','#bcf60c','#fabebe','#008080','#e6beff'];
// titles may carry type names ('&', '<'): escaped for the SVG
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const gcol=g=>g===0?'#56646e':PAL[((g-1)>>1)%PAL.length];
const chrome=()=>{const root='/opt/pw-browsers';if(!fs.existsSync(root))return null;
  return fs.readdirSync(root).filter(d=>d.startsWith('chromium')).map(d=>`${root}/${d}/chrome-linux/chrome`).find(fs.existsSync)||null;};
function svgToPng(svgFile,out,w,h){const c=chrome();if(!c){console.warn('no chromium: kept',svgFile);return;}
  execFileSync(c,['--headless','--no-sandbox','--disable-gpu','--hide-scrollbars',`--screenshot=${path.resolve(out)}`,`--window-size=${w},${h}`,'file://'+path.resolve(svgFile)],{stdio:'ignore'});fs.unlinkSync(svgFile);}
// focus = {units, radius, align?: {u, a0}} zooms on those units (align turns the picture so unit u keeps angle a0)
function render(s,out,title,focus=null,labels=false){
  const W=s.p.W,S=560;let k=S/W,fx=0,fy=0;const keep=new Set();
  if(focus){const u0=focus.units[0];let sx=0,sy=0;for(const u of focus.units){sx+=s._dx(s.px[u]-s.px[u0]);sy+=s._dy(s.py[u]-s.py[u0]);}
    fx=s.px[u0]+sx/focus.units.length;fy=s.py[u0]+sy/focus.units.length;
    for(let u=0;u<s.n;u++)if(Math.hypot(s._dx(s.px[u]-fx),s._dy(s.py[u]-fy))<focus.radius*1.5)keep.add(u);k=S/(2*focus.radius);}
  const svg=[`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S+30}"><rect width="${S}" height="${S+30}" fill="#f5f7f8"/><rect width="${S}" height="${S}" fill="#15222d"/><clipPath id="v"><rect width="${S}" height="${S}"/></clipPath><g clip-path="url(#v)">`];
  const th=focus&&focus.align?focus.align.a0-s.angle(focus.align.u):0,cs=Math.cos(th),sn=Math.sin(th);
  for(let u=0;u<s.n;u++){if(focus&&!keep.has(u))continue;const r=s.roles(u);
    const P=q=>{if(!focus)return [(s._wx(s.px[u])+s.ox[u*3+q])*k,(W-s._wy(s.py[u])-s.oy[u*3+q])*k];
      const x=s._dx(s.px[u]-fx)+s.ox[u*3+q],y=s._dy(s.py[u]-fy)+s.oy[u*3+q];return [(focus.radius+cs*x-sn*y)*k,(focus.radius-(sn*x+cs*y))*k];};
    const fill=r.role===DOCKED?'#9fd8cf':r.role===SFACE?'#f6cf8a':r.role===SBACK?(r.fill?'#3f9e8f':'#c98f2e'):r.role===GROWN?'#8a9bb0':'#3a4852';
    svg.push(`<polygon points="${[0,1,2].map(q=>P(q).map(z=>z.toFixed(1)).join(',')).join(' ')}" fill="${fill}" stroke="#1b2a33" stroke-width="0.8"/>`);
    const c=[[0,1,2].reduce((a,q)=>a+P(q)[0],0)/3,[0,1,2].reduce((a,q)=>a+P(q)[1],0)/3];
    for(let i=0;i<3;i++){const g=s.glue[u*3+i];if(!g)continue;const a=P(i),b=P((i+1)%3),sh=0.22;
      const A=[a[0]+(c[0]-a[0])*sh,a[1]+(c[1]-a[1])*sh],B=[b[0]+(c[0]-b[0])*sh,b[1]+(c[1]-b[1])*sh];
      svg.push(`<line x1="${A[0].toFixed(1)}" y1="${A[1].toFixed(1)}" x2="${B[0].toFixed(1)}" y2="${B[1].toFixed(1)}" stroke="${gcol(g)}" stroke-width="${focus?4:2}" stroke-dasharray="${g%2?'':'3,2'}"/>`);
      if(labels&&g){const m=[(A[0]+B[0])/2*0.7+c[0]*0.3,(A[1]+B[1])/2*0.7+c[1]*0.3];svg.push(`<text x="${m[0].toFixed(1)}" y="${(m[1]+5).toFixed(1)}" font-family="Arial" font-weight="bold" font-size="${Math.max(9,k*0.22).toFixed(0)}" text-anchor="middle" fill="#fff">${gname(g)}</text>`);}}}
  svg.push('</g>');
  svg.push(`<text x="8" y="${S+20}" font-family="Arial" font-size="13" fill="#233542">${esc(title)}</text></svg>`);
  const svgf=out.replace(/\.png$/,'.svg');fs.mkdirSync(path.dirname(path.resolve(out)),{recursive:true});fs.writeFileSync(svgf,svg.join('\n'));svgToPng(svgf,out,S,S+30+90);
  fs.writeFileSync(out.replace(/\.png$/,'.json.gz'),zlib.gzipSync(JSON.stringify(s.saveState())));}
// a grid of PNG pictures with a title (inline images, rendered like render())
function montage(out,cols,title,files){
  const imgs=files.filter(f=>fs.existsSync(f)).map(f=>`data:image/png;base64,${fs.readFileSync(f).toString('base64')}`),w=560,h=680,rows=Math.ceil(imgs.length/cols),W=cols*(w+6),Hh=rows*(h+6)+40;
  const svg=[`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Hh}"><rect width="${W}" height="${Hh}" fill="#fff"/><text x="10" y="26" font-family="Arial" font-size="18" font-weight="bold">${esc(title)}</text>`];
  imgs.forEach((d,i)=>svg.push(`<image href="${d}" x="${(i%cols)*(w+6)}" y="${40+Math.floor(i/cols)*(h+6)}" width="${w}" height="${h}"/>`));svg.push('</svg>');
  const svgf=out.replace(/\.png$/,'.svg');fs.writeFileSync(svgf,svg.join(''));svgToPng(svgf,out,W,Hh+90);}
// popChart (observation, build run 20261005-1051): small multiples of budcycle's 'pop:' lines (BCP), one line per world:
// node tri/render.js pop OUT.png "title" label=runs/x/out.txt ... (a label starting with '~': a dashed line, coloured in its own order: a
// control beside its treatment)
const POPM=[['bodies',/bodies (\d+)/],['blanks',/blanks (\d+)/],['monomers',/monomers (\d+)/],['parts',/parts (\d+)/],['let-gos (cumulative)',/\(\+(\d+)\)/,1]];
function popChart(out,title,runs){const SER=['#2a78d6','#eb6834','#1baf7a','#eda100','#e87ba4','#008300'],pw=300,ph=170,pad=44,cols=POPM.length;
  const data=runs.map(([lab,f])=>{const L=fs.readFileSync(f,'utf8').split('\n').filter(l=>l.startsWith('pop:'));const dash=lab.startsWith('~');return {lab:dash?lab.slice(1):lab,dash,rows:L.map(l=>[+l.match(/t=(\d+)/)[1],...POPM.map(m=>+(l.match(m[1])||[0,0])[1])])};});
  data.forEach((d,i)=>{d.col=SER[data.slice(0,i).filter(e=>e.dash===d.dash).length%SER.length];d.da=d.dash?' stroke-dasharray="5 3"':'';});
  for(const d of data)POPM.forEach((m,k)=>{if(m[2]){let c=0;for(const r of d.rows){c+=r[k+1];r[k+1]=c;}}});
  const tmax=Math.max(...data.flatMap(d=>d.rows.map(r=>r[0]))),W=cols*(pw+pad)+pad,H=ph+130,svg=[`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="Arial"><rect width="${W}" height="${H}" fill="#fff"/><text x="${pad}" y="24" font-size="16" font-weight="bold" fill="#233542">${title}</text>`];
  data.forEach((d,i)=>svg.push(`<line x1="${pad+i*110}" y1="39.5" x2="${pad+i*110+18}" y2="39.5" stroke="${d.col}" stroke-width="3"${d.da}/><text x="${pad+i*110+24}" y="44" font-size="12" fill="#233542">${d.lab}</text>`));
  POPM.forEach((m,k)=>{const x0=pad+k*(pw+pad),y0=70,ymax=Math.max(1,...data.flatMap(d=>d.rows.map(r=>r[k+1]))),X=t=>x0+t/tmax*pw,Y=v=>y0+ph-v/ymax*ph;
    svg.push(`<text x="${x0}" y="${y0-8}" font-size="13" fill="#233542">${m[0]}</text><line x1="${x0}" y1="${y0+ph}" x2="${x0+pw}" y2="${y0+ph}" stroke="#c9ced3"/>`);
    for(const f of [0.5,1])svg.push(`<line x1="${x0}" y1="${Y(ymax*f)}" x2="${x0+pw}" y2="${Y(ymax*f)}" stroke="#eef0f2"/><text x="${x0-4}" y="${Y(ymax*f)+4}" font-size="10" text-anchor="end" fill="#6b7680">${Math.round(ymax*f)}</text>`);
    for(let s=0;s<=tmax;s+=1e6)svg.push(`<text x="${X(s)}" y="${y0+ph+14}" font-size="10" text-anchor="middle" fill="#6b7680">${s/1e6}M</text>`);
    data.forEach((d,i)=>svg.push(`<polyline fill="none" stroke="${d.col}" stroke-width="2"${d.da} stroke-linejoin="round" points="${d.rows.map(r=>X(r[0]).toFixed(1)+','+Y(r[k+1]).toFixed(1)).join(' ')}"/>`));});
  svg.push(`<text x="${pad}" y="${H-14}" font-size="11" fill="#6b7680">steps (millions); one line per world, from its 'pop:' lines</text></svg>`);
  const svgf=out.replace(/\.png$/,'.svg');fs.writeFileSync(svgf,svg.join(''));svgToPng(svgf,out,W,H+90);}
if(require.main===module&&process.argv[2]==='pop')popChart(process.argv[3],process.argv[4],process.argv.slice(5).map(a=>a.split('=')));
module.exports={render,montage,gcol,popChart};
