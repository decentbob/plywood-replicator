'use strict';
// Census reader (build run 20261008-1351; observation only): reads pair demo outputs and prints, per 'types:' line (copy
// error on; PATN=n lists more types than the commonest 10), heads by root letter and second cells by site letter.
//   node tri/census.js runs/b/x1.txt [more files] [--every k]   (k: one row per k census lines, default 2)
// A head is a type with an attach side carrying '&' (its letter is the root letter); a second cell a type with the side
// 'C@' and no '&' (its site letter: the glue of the side after 'C@', counter-clockwise; '-' inert); anything else is
// 'other' (chains, plugs), listed by type. Counts are of the types the line lists, so rare types may be missing.
const fs=require('fs');
const args=process.argv.slice(2),ei=args.indexOf('--every'),every=ei>=0?+args[ei+1]:2,files=args.filter((a,i)=>a!=='--every'&&i!==ei+1);
const sides=t=>t.match(/[-a-zA-Z][.@&|?!]*/g);
const classify=t=>{const s=sides(t);if(!s||s.length!==3)return ['other',t];const h=s.find(x=>x.includes('@')&&x.includes('&'));if(h)return ['head',h[0]];
  const i=s.findIndex(x=>x==='C@');return i>=0?['second',s[(i+1)%3][0]]:['other',t];};
const top=(m,n)=>Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,n).map(([k,v])=>k+' '+v).join(' ')||'-';
for(const f of files){console.log('# '+f);let k=0;
  for(const line of fs.readFileSync(f,'utf8').split('\n')){const m=line.match(/^types: t=(\d+) .*?\| (.*)$/);if(!m||(k++%every))continue;
    const H={},S={},O={};let nh=0,ns=0;for(const e of m[2].split(', ')){const [c,t]=e.split(' ');const [cl,key]=classify(t),n=+c;
      if(cl==='head'){H[key]=(H[key]||0)+n;nh+=n;}else if(cl==='second'){S[key]=(S[key]||0)+n;ns+=n;}else O[key]=(O[key]||0)+n;}
    console.log(`t=${m[1]} heads ${nh}: ${top(H,4)} | second ${ns}: ${top(S,5)} | other: ${top(O,3)}`);}}
