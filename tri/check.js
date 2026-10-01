'use strict';
// Capability checks: one line per capability that ROADMAP's module table marks as working (plus partial ones, which
// report but do not fail). Each check runs an existing demo (tri/demos.js, pictures off) on fixed seeds and reads the
// demo's own last report line; a capability claimed "N of 4 worlds" needs that many seeds to pass.
//   node tri/check.js [name ...]     (names: the `id` column; default all; at most 4 processes; about 8 minutes)
// Exit code 1 if a working capability fails.
const {spawn}=require('child_process'),path=require('path');
const num=(L,re)=>{const m=L.match(re);return m?+m[1]:NaN;};
const count=(L,re)=>(L.match(re)||[]).length;
// each check: id, capability, demo name, seeds, steps, extra, need (seeds that must pass), secs (rough time per world,
// for scheduling), pass(last report line, all output) -> [ok, short evidence]; partial: reported, never fails
const CHECKS=[
  {id:'copy',cap:'Genome: typed chain copying (zip)',demo:'copy',seeds:[1],steps:10000,secs:4,
    pass:L=>{const n=count(L,/BBAABA\//g);return [n>=2,`${n} complete copies BBAABA`];}},
  {id:'lid',cap:'Factory: lid pocket casts (signals: heard trigger)',demo:'lid',seeds:[1],steps:4000,secs:2,
    pass:L=>{const c=num(L,/casts=(\d+)/);return [c>=5,`${c} casts`];}},
  {id:'factory',cap:'Factory: lid pockets feed copying (cast dockers only)',demo:'factory',seeds:[1],steps:30000,extra:'Aa',secs:15,
    pass:L=>{const n=num(L,/AAAAA=(\d+)/);return [n>=2,`${n} copies AAAAA`];}},
  {id:'factory-none',cap:'  control: no pockets, no copies',demo:'factory',seeds:[1],steps:30000,extra:'none',secs:10,
    pass:L=>{const n=num(L,/AAAAA=(\d+)/);return [n===0,`${n} copies`];}},
  {id:'energy',cap:'Energy: a carrier per swing, recharged in light',demo:'energy',seeds:[1],steps:10000,secs:2,
    pass:L=>{const c=num(L,/casts=(\d+)/),f=num(L,/fuelUsed=(\d+)/),r=num(L,/recharges=(\d+)/);return [c>=5&&f===c&&r>=1,`${c} casts, ${f} fuel, ${r} recharges`];}},
  {id:'energy-dark',cap:'  control: dark, no casts',demo:'energy',seeds:[1],steps:10000,extra:'dark',secs:2,
    pass:L=>{const c=num(L,/casts=(\d+)/);return [c===0,`${c} casts`];}},
  {id:'conveyor',cap:'Machines: conveyor hand-off',demo:'conveyor',seeds:[1],steps:3000,secs:1,
    pass:L=>{const h=num(L,/handoffs=(\d+)/),d=num(L,/drops=(\d+)/);return [h>=5&&d>=5,`${h} hand-offs, ${d} drops`];}},
  {id:'gate',cap:'Machines: gated ring door',demo:'gate',seeds:[1],steps:10000,extra:'12',secs:3,
    pass:L=>{const c=num(L,/crossings=(\d+)/),u=num(L,/unlatches=(\d+)/);return [c>=5&&u>=1,`${c} crossings, ${u} unlatches`];}},
  {id:'import',cap:'Import: revolving door carries blanks in',demo:'import',seeds:[1],steps:20000,secs:5,
    pass:L=>{const x=num(L,/xxx=(\d+)/),j=num(L,/junk=(\d+)/);return [x>=8&&j<=1,`${x} blanks in, ${j} junk`];}},
  {id:'grow',cap:'Kits: a lid pocket grows from a seed and casts',demo:'grow',seeds:[1],steps:16000,extra:'12',secs:12,
    pass:(L,o)=>{const m=o.match(/complete at (\S+) products (\d+)/);return [!!m&&m[1]!=='not'&&+m[2]>=1,m?`complete at ${m[1]}, ${m[2]} products`:'no result'];}},
  {id:'grow-stamp',cap:'Stamp: a stamp pocket grows from its kit and casts',demo:'grow',seeds:[1],steps:20000,extra:'4s',secs:5,
    pass:(L,o)=>{const m=o.match(/complete at (\S+) products (\d+)/);return [!!m&&m[1]!=='not'&&+m[2]>=1,m?`complete at ${m[1]}, ${m[2]} products`:'no result'];}},
  {id:'stamp',cap:'Stamp: pockets cast a ring\'s parts, the ring grows',demo:'stamp',seeds:[1],steps:60000,secs:25,
    pass:L=>{const m=L.match(/closed=at (\d+)/);return [!!m,m?`closed at ${m[1]}`:'not closed'];}},
  {id:'ring',cap:'Membrane growth: ring kit closes (R=3)',demo:'ring',seeds:[1,2,3,4],need:3,steps:60000,extra:'3',secs:8,
    pass:L=>{const m=L.match(/closed=at (\d+)/);return [!!m,m?`closed at ${m[1]}`:'open '+(L.match(/cells=(\S+)/)||[])[1]];}},
  {id:'heir',cap:'Heritable machines: copies regrow their pocket',demo:'heir',seeds:[1],steps:30000,secs:25,
    pass:L=>{const n=[...L.matchAll(/[aA]{5}\+(\d+)/g)].filter(m=>+m[1]>=16).length;return [n>=3,`${n} strands with a whole pocket`];}},
  {id:'cycle',cap:'Heritable machines: two-pocket cycle, third generation',demo:'cycle',seeds:[1],steps:120000,secs:150,
    pass:L=>{const a=count(L,/aaaaa\[/g),z=count(L,/AAAAA\[0\/16\]/g);return [a>=2&&z>=1,`${a} strands aaaaa, ${z} AAAAA with a whole pocket`];}},
  {id:'wrap',cap:'Encapsulation: a chain grows a membrane around itself',demo:'wrap',seeds:[2],steps:100000,secs:30,
    pass:L=>{const ok=/released rings 1 \[chain inside\]/.test(L);return [ok,ok?'chain inside its released ring':L.slice(L.indexOf(' ')+1,120)];}},
  {id:'cells',cap:'Heritable cells: founder and copy each wrap themselves',demo:'cells',seeds:[1,2,3,4],need:3,steps:100000,extra:'36',secs:70,
    pass:L=>{const c=count(L,/\(in a cell\)/g),d=num(L,/docks=(\d+)/);return [c>=2,`${c} chains in cells, ${d} docks`];}},
  {id:'live',cap:'Grown import door: membrane with door, imports',demo:'live',seeds:[1,2,3,4],need:3,steps:150000,extra:'6x2',secs:80,
    pass:L=>{const m=L.match(/\[chain in, xxx in (\d+), junk in (\d+)\]/);return [!!m&&+m[1]>=8,m?`${m[1]} blanks in, ${m[2]} junk`:'no closed ring with the chain'];}},
  {id:'cell',cap:'Protocell (prepared): import, cast, copy inside',demo:'cell',seeds:[2],steps:40000,secs:26,
    pass:L=>{const n=count(L,/AAAAA/g),i=num(L,/imports=(\d+)/);return [n>=2&&i>=10,`${n} copies, ${i} imports`];}},
  {id:'grown',cap:'Protocell grown from the genome: copy inside',demo:'grown',seeds:[2],steps:200000,secs:350,
    pass:L=>{const ok=/membrane closed pocket 16\/16/.test(L)&&/AAAAA\(in\)/.test(L);return [ok,`${(L.match(/membrane \S+ pocket \S+/)||['?'])[0]}, strands ${(L.match(/strands \[[^\]]*\]/)||['?'])[0].slice(8)}`];}},
  {id:'bud',cap:'Budding: empty daughter rings detach',demo:'bud',seeds:[3],steps:50000,secs:12,
    pass:L=>{const m=L.match(/released rings \[([^\]]*)\]/);return [!!m&&m[1].trim()!=='',m?`released [${m[1]}]`:'none'];}},
  {id:'split',cap:'Feeding and division: the bud grows a cap, splits sealed',demo:'split',seeds:[1],steps:30000,secs:20,
    pass:L=>{const ok=/cap=3\/3/.test(L)&&/SPLIT/.test(L)&&/doors P:shut D:shut/.test(L);return [ok,`${(L.match(/cap=\S+/)||['?'])[0]} ${(L.match(/SPLIT at \d+|joined/)||['?'])[0]} ${(L.match(/doors P:\S+ D:\S+/)||['?'])[0]}`];}},
  {id:'split-g',cap:'Segregation: the bud anchors a genome copy, splits',demo:'split',seeds:[1],steps:60000,extra:'g',secs:47,
    pass:L=>{const ok=/anchored in D/.test(L)&&/SPLIT/.test(L)&&/doors P:shut D:shut/.test(L);return [ok,`${/anchored in D/.test(L)?'copy anchored in D':'no copy in D'}, ${(L.match(/SPLIT at \d+|joined/)||['?'])[0]} ${(L.match(/doors P:\S+ D:\S+/)||['?'])[0]}`];}},
  {id:'split-o',cap:'Offspring that lives alone: own pocket, import, copy',demo:'split',seeds:[1,2,3,4],need:3,steps:200000,extra:'o',secs:190,
    pass:L=>{const o=(L.match(/organelle=(\S+)/)||[])[1],sp=/SPLIT/.test(L),im=num(L,/imports=(\d+)/),cp=/aaaa\*?\(in D\)/.test(L);
      return [sp&&cp&&im>=10,`pocket ${o}, ${sp?'split':'joined'}, ${im} imports, ${cp?'a genome copy':'no copy'} in D`];}},
];

function run(c,seed){return new Promise(res=>{const args=[path.join(__dirname,'demos.js'),c.demo,String(seed),String(c.steps),path.join('runs','check')];if(c.extra)args.push(c.extra);
  const p=spawn(process.execPath,args,{env:{...process.env,TRI_NOPIC:'1'}});let out='',err='';const t0=Date.now();
  p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>err+=d);
  p.on('close',code=>{const lines=out.split('\n').filter(l=>l.startsWith('t='));const L=lines[lines.length-1]||'';
    let ok=false,ev='';if(code!==0)ev='crashed: '+(err.trim().split('\n').find(l=>/Error/.test(l))||'exit '+code);else[ok,ev]=c.pass(L,out);
    res({ok,ev,secs:(Date.now()-t0)/1000});});});}

async function main(){const want=process.argv.slice(2),sel=CHECKS.filter(c=>!want.length||want.includes(c.id));
  if(want.length&&sel.length!==want.length)throw Error('unknown check; one of '+CHECKS.map(c=>c.id).join(' '));
  // jobs longest first, at most 4 at once
  const jobs=sel.flatMap(c=>c.seeds.map(seed=>({c,seed}))).sort((a,b)=>b.c.secs-a.c.secs),res=new Map(),t0=Date.now();
  let next=0;const worker=async()=>{while(next<jobs.length){const j=jobs[next++];res.set(j,await run(j.c,j.seed));}};
  await Promise.all([1,2,3,4].map(worker));let fails=0;
  for(const c of sel){const rs=c.seeds.map(seed=>[seed,res.get(jobs.find(j=>j.c===c&&j.seed===seed))]),k=rs.filter(([,r])=>r.ok).length,need=c.need||c.seeds.length,ok=k>=need;
    if(!ok&&!c.partial)fails++;const tag=ok?'PASS':c.partial?'PART':'FAIL',w=c.seeds.length>1?` ${k}/${c.seeds.length} worlds (need ${need}):`:':';
    console.log(`${tag} ${c.id.padEnd(12)} ${c.cap}${w} ${rs.map(([seed,r])=>(c.seeds.length>1?`[${seed}${r.ok?'+':'-'}] `:'')+r.ev).join('; ')} (${Math.max(...rs.map(([,r])=>r.secs)).toFixed(0)} s)`);}
  console.log(`${sel.length-fails} of ${sel.length} checks pass (partial ones never fail); ${((Date.now()-t0)/1000).toFixed(0)} s`);process.exitCode=fails?1:0;}
main();
