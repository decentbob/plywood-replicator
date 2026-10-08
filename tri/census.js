'use strict';
// Census reader (build run 20261008-1351; observation only): reads pair demo outputs and prints, per 'types:' line (copy
// error on; PATN=n lists more types than the commonest 10), heads by root letter and second cells by site letter.
//   node tri/census.js runs/b/x1.txt [more files] [--every k]   (k: one row per k census lines, default 2)
//   node tri/census.js --loop runs/b/x1.txt [more files]         (build run 20261008-1650: the loop at length, one summary per
//     world: the majority site letter (on more than half of second cells) and each turn of it, root letters other than Z on
//     20% or more of heads (commons episodes), the sealed site (the close-only mark on the site side), the trap ('z!' on a second cell; twice: 'z!' on two sides), plugs (attach
//     letter Z, no '&'), other types (chains: attach letter neither C nor Z), the first census without heads)
//   node tri/census.js --pool runs/b/x1.txt [more files] [--every k]  (explore run 20261008-1951: the pool-raised class of
//     the stockless world, where the lock is a site on the second cell: per row the majority root letter R, nursery heads
//     (a plain side with R's complement: born in place), second cells with a working lock for R (a free side of R's
//     complement, not close-only or '!'), sealed (a glued close-only side and no working lock), trapped (R's complement
//     with '!'); then a summary: each turn of the majority root, the first census with nurseries on more than half of heads)
// A head is a type with an attach side carrying '&' (its letter is the root letter); a second cell a type with an attach side
// of letter C and no '&' (its site letter: the glue of the side after that one, counter-clockwise; '-' inert); anything else is
// 'other' (chains, plugs), listed by type. Counts are of the types the line lists, so rare types may be missing.
const fs=require('fs');
const loop=process.argv.includes('--loop'),pool=process.argv.includes('--pool'),args=process.argv.slice(2).filter(a=>a!=='--loop'&&a!=='--pool'),ei=args.indexOf('--every'),every=ei>=0?+args[ei+1]:2,files=args.filter((a,i)=>ei<0||(i!==ei&&i!==ei+1));
const sides=t=>t.match(/[-a-zA-Z][.@&|?!]*/g);
const classify=t=>{const s=sides(t);if(!s||s.length!==3)return ['other',t];const h=s.find(x=>x.includes('@')&&x.includes('&'));if(h)return ['head',h[0]];
  const i=s.findIndex(x=>x[0]==='C'&&x.includes('@'));return i>=0?['second',s[(i+1)%3][0]]:['other',t];};
const top=(m,n)=>Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,n).map(([k,v])=>k+' '+v).join(' ')||'-';
if(loop)files.forEach(summary);else if(pool)files.forEach(poolSummary);else for(const f of files){console.log('# '+f);let k=0;
  for(const line of fs.readFileSync(f,'utf8').split('\n')){const m=line.match(/^types: t=(\d+) .*?\| (.*)$/);if(!m||(k++%every))continue;
    const H={},S={},O={};let nh=0,ns=0;for(const e of m[2].split(', ')){const [c,t]=e.split(' ');if(!t)continue;const [cl,key]=classify(t),n=+c;
      if(cl==='head'){H[key]=(H[key]||0)+n;nh+=n;}else if(cl==='second'){S[key]=(S[key]||0)+n;ns+=n;}else O[key]=(O[key]||0)+n;}
    console.log(`t=${m[1]} heads ${nh}: ${top(H,4)} | second ${ns}: ${top(S,5)} | other: ${top(O,3)}`);}}
function summary(f){const R=[];
  for(const line of fs.readFileSync(f,'utf8').split('\n')){const m=line.match(/^types: t=(\d+) .*?\| (.*)$/);if(!m)continue;
    const r={t:+m[1],H:{},nh:0,S:{},ns:0,se:0,tr:0,tr2:0,pl:0,O:{},no:0};
    for(const e of m[2].split(', ')){const [c,t]=e.split(' ');if(!t)continue;const n=+c,s=sides(t);if(!s||s.length!==3)continue;
      const h=s.find(x=>x.includes('@')&&x.includes('&'));if(h){r.H[h[0]]=(r.H[h[0]]||0)+n;r.nh+=n;continue;}
      const i=s.findIndex(x=>x[0]==='C'&&x.includes('@'));if(i>=0){const L=s[(i+1)%3][0],z=s.filter(x=>x[0]==='z'&&x.includes('!')).length;
        r.S[L]=(r.S[L]||0)+n;r.ns+=n;if(s[(i+1)%3].includes('.'))r.se+=n;if(z)r.tr+=n;if(z>1)r.tr2+=n;continue;}
      if(s.some(x=>x[0]==='Z'&&x.includes('@')))r.pl+=n;else{r.O[t]=(r.O[t]||0)+n;r.no+=n;}}
    R.push(r);}
  if(!R.length){console.log(f+': no types: lines');return;}
  const k=t=>(t/1000)+'k',pc=x=>(100*x).toFixed(0)+'%',seq=[],eps=[],dead=R.find(r=>r.t>20000&&r.nh===0);let cur=null,open={};
  for(const r of R){const M=Object.keys(r.S).find(L=>r.S[L]>r.ns/2);if(M&&M!==cur){seq.push(M+' '+k(r.t));cur=M;}
    for(const L of Object.keys(open))if(!(r.nh&&(r.H[L]||0)>=0.2*r.nh)){eps.push(open[L]);delete open[L];}
    for(const L of Object.keys(r.H))if(L!=='Z'&&r.H[L]>=0.2*r.nh){const f=r.H[L]/r.nh,o=open[L]||(open[L]={L,from:r.t,to:r.t,pk:0});o.to=r.t;o.pk=Math.max(o.pk,f);}}
  eps.push(...Object.values(open));const e=R[R.length-1],live=R.filter(r=>r.ns),ts=live.map(r=>r.tr/r.ns),mx=(a,g)=>a.reduce((b,r)=>g(r)>g(b)?r:b,a[0]);
  const pk=mx(R,r=>r.pl),po=mx(R,r=>r.nh+r.ns?r.no/(r.nh+r.ns+r.pl+r.no):0),pt=Object.entries(po.O).sort((a,b)=>b[1]-a[1])[0],pd=mx(live,r=>r.tr2/r.ns);
  console.log(`# ${f}: ${dead?'no heads from '+k(dead.t):'alive'} at ${k(e.t)} (heads ${e.nh}: ${top(e.H,3)}; second ${e.ns}: ${top(e.S,3)})
  site turns ${seq.length-1}: ${seq.join(', ')}
  commons episodes ${eps.length}: ${eps.map(o=>`${o.L} ${k(o.from)}-${k(o.to)} peak ${pc(o.pk)}`).join(', ')||'-'}
  trap share: end ${e.ns?pc(e.tr/e.ns):'-'}, min ${ts.length?pc(Math.min(...ts)):'-'}, mean ${ts.length?pc(ts.reduce((a,b)=>a+b,0)/ts.length):'-'}; two traps at most ${pd?pc(pd.tr2/pd.ns)+' ('+k(pd.t)+')':'-'}
  sealed site (close-only): end ${e.ns?pc(e.se/e.ns):'-'}, on more than half from ${(live.find(r=>r.se>r.ns/2)||{t:null}).t===null?'never':k(live.find(r=>r.se>r.ns/2).t)}
  plugs at most ${pk.pl} (${k(pk.t)}); other types at most ${po.no} (${k(po.t)}${pt?': '+pt[0]+' '+pt[1]:''}); heads min ${Math.min(...R.filter(r=>r.t>20000&&!(dead&&r.t>=dead.t)).map(r=>r.nh))}`);}
function poolSummary(f){const R=[],cp=L=>L===L.toLowerCase()?L.toUpperCase():L.toLowerCase(),k=t=>(t/1000)+'k',pc=(a,b)=>b?(100*a/b).toFixed(0)+'%':'-';
  for(const line of fs.readFileSync(f,'utf8').split('\n')){const m=line.match(/^types: t=(\d+) .*?\| (.*)$/);if(!m)continue;
    const r={t:+m[1],H:{},nh:0,heads:[],cells:[],ns:0};
    for(const e of m[2].split(', ')){const [c,t]=e.split(' ');if(!t)continue;const n=+c,s=sides(t);if(!s||s.length!==3)continue;
      const h=s.findIndex(x=>x.includes('@')&&x.includes('&'));
      if(h>=0){const L=s[h][0];r.H[L]=(r.H[L]||0)+n;r.nh+=n;r.heads.push([L,s.filter((x,i)=>i!==h),n]);continue;}
      const i=s.findIndex(x=>x[0]==='C'&&x.includes('@'));if(i>=0){r.cells.push([[s[(i+1)%3],s[(i+2)%3]],n]);r.ns+=n;}}
    const M=Object.keys(r.H).sort((a,b)=>r.H[b]-r.H[a])[0];r.M=M;
    if(M){const z=cp(M),plain=x=>!/[@|.!&?]/.test(x);r.nur=r.heads.filter(([L,o])=>L===M&&o.some(x=>x[0]===z&&plain(x))).reduce((a,h)=>a+h[2],0);
      r.fit=0;r.seal=0;r.trap=0;for(const [o,n] of r.cells){const w=o.some(x=>x[0]===z&&!/[.!]/.test(x));if(w)r.fit+=n;else if(o.some(x=>x[0]!=='-'&&x.includes('.')))r.seal+=n;if(o.some(x=>x[0]===z&&x.includes('!')))r.trap+=n;}}
    R.push(r);}
  if(!R.length){console.log(f+': no types: lines');return;}
  console.log('# '+f);let j=0;
  for(const r of R){if(j++%every&&r!==R[R.length-1])continue;
    console.log(`t=${k(r.t)} heads ${r.nh} (${top(r.H,3)}) nursery ${pc(r.nur,r.H[r.M])} | second ${r.ns}: lock for ${r.M} ${pc(r.fit,r.ns)} sealed ${pc(r.seal,r.ns)} trap ${pc(r.trap,r.ns)}`);}
  const turns=[];let cur=null;for(const r of R){if(!r.nh)continue;if(r.H[r.M]>r.nh/2&&r.M!==cur){turns.push(r.M+' '+k(r.t));cur=r.M;}}
  const nu=R.find(r=>r.nh&&r.nur>r.nh/2),dead=R.find(r=>r.t>20000&&!r.nh),pre=R.filter(r=>r.ns&&(!nu||r.t<nu.t)),post=nu?R.filter(r=>r.ns&&r.t>=nu.t):[],mx=(a,g)=>a.length?Math.max(...a.map(g)):NaN;
  console.log(`  majority root ${turns.join(', ')} (${turns.length-1} turns); nursery on most heads from ${nu?k(nu.t):'never'}${dead?'; no heads from '+k(dead.t):''}
  before the nursery: sealed at most ${pc(mx(pre,r=>r.seal/r.ns),1)}, trap at most ${pc(mx(pre,r=>r.trap/r.ns),1)}; after: sealed at most ${post.length?pc(mx(post,r=>r.seal/r.ns),1):'-'}, trap at most ${post.length?pc(mx(post,r=>r.trap/r.ns),1):'-'}, lock for the root at least ${post.length?pc(Math.min(...post.map(r=>r.fit/r.ns)),1):'-'}`);}
