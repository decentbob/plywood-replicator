'use strict';
// Capability checks: one line per capability that ROADMAP's module table marks as working (plus partial ones, which
// report but do not fail). Each check runs an existing demo (tri/demos.js, pictures off) on fixed seeds and reads the
// demo's own last report line; a capability claimed "N of 4 worlds" needs that many seeds to pass.
//   node tri/check.js [name ...]     (names: the `id` column; default all; at most 4 processes; about an hour, budcycle-3 the longest;
//   each check prints when its last world finishes, so lines come in finishing order; CHECK_SAVE=dir keeps each world's
//   whole output there, e.g. to show that a change leaves outputs byte for byte the same)
// Exit code 1 if a working capability fails.
const {spawn}=require('child_process'),path=require('path');
const num=(L,re)=>{const m=L.match(re);return m?+m[1]:NaN;};
const count=(L,re)=>(L.match(re)||[]).length;
// each check: id, capability, demo name, seeds, steps, extra, env (variables for the demo), need (seeds that must pass), secs (rough time per world,
// for scheduling), pass(last report line, all output) -> [ok, short evidence]; partial: reported, never fails
const CHECKS=[
  // retired 2026-10-04 (autorun run 20261004-0820, core-review: heldCopy became the rule; INNOVATIONS keeps their
  // entries, git `882b7d4` their code): imprint-cell(-n) and imprint-held(-c) (superseded by imprint-pore, which holds
  // its founder), imprint-hood and imprint-held-w (pore leaks: leaked strands are sterile now), budpore, budpore-c,
  // budpore-held, budpore-kind (doorway pairs: the corner bud needs no doorway), budpool-e (the sealed pair's last
  // cell), budcycle-2 (two generations with the pool harness: budcycle-free has none)
  {id:'copy',cap:'Genome: typed chain copying (zip; the founder held by its high end)',demo:'copy',seeds:[1,2,3,4],need:3,steps:20000,secs:8,
    pass:L=>{const n=count(L,/BBAABA\//g);return [n>=2,`${n} complete copies BBAABA`];}},
  {id:'ring',cap:'Membrane growth: ring kit closes (R=3)',demo:'ring',seeds:[1,2,3,4],need:3,steps:60000,extra:'3',secs:8,
    pass:L=>{const m=L.match(/closed=at (\d+)/);return [!!m,m?`closed at ${m[1]}`:'open '+(L.match(/cells=(\S+)/)||[])[1]];}},
  {id:'imprint',cap:'Contact copying: a ring with one of each part closes, a second grows from copies',demo:'imprint',seeds:[1,2,3,4],need:3,steps:200000,secs:180,
    pass:(L,o)=>{const m=o.match(/result: ring cells (\d+) (\d+) of 30, closed at (\S+) \/ (\S+)/);return [!!m&&m[3]!=='not'&&m[4]!=='not',m?`rings ${m[1]}/${m[2]} cells, closed ${m[3]} / ${m[4]}`:'no result'];}},
  {id:'imprint-genome',cap:'Contact copying: a strand copied from copies of its own triangles',demo:'imprint',seeds:[1,2,3,4],need:3,steps:30000,extra:'g',secs:25,
    pass:(L,o)=>{const n=num(o,/result: (\d+) free strands/);return [n>=4,`${n} strands`];}},
  {id:'imprint-genome-c',cap:'  control: plain blanks, no copies',demo:'imprint',seeds:[1],steps:30000,extra:'gc',secs:15,
    pass:(L,o)=>{const n=num(o,/result: (\d+) free strands/);return [n===1,`${n} strands`];}},
  {id:'imprint-pore',cap:'A cell fed through a pore: copy blanks from outside copy only its held genome (spent walls); 3 rival strands outside stay sterile',demo:'imprint',seeds:[1,2,3,4],need:3,steps:100000,extra:'150px',secs:70,
    pass:(L,o)=>{const m=o.match(/result: (\d+) free strands \(founder included\), (\d+) inside, copies (\d+): genome (\d+), wall (\d+)/);return [!!m&&+m[2]>=4&&+m[5]===0,m?`${m[2]} strands inside (${m[1]} in all), copies to genome ${m[4]}, wall ${m[5]}`:'no result'];}},
  {id:'imprint-pore-c',cap:'  control: no pore, no blank gets in',demo:'imprint',seeds:[1],steps:60000,extra:'150pc',secs:40,
    pass:(L,o)=>{const m=o.match(/result: (\d+) free strands \(founder included\), (\d+) inside, copies (\d+)/);return [!!m&&+m[3]===0&&+m[1]===1,m?`${m[1]} strand, ${m[3]} copies`:'no result'];}},
  {id:'imprint-pore-n',cap:'  control: plain walls take the blanks',demo:'imprint',seeds:[1],steps:60000,extra:'150pn',secs:40,
    pass:(L,o)=>{const m=o.match(/result: (\d+) free strands \(founder included\), (\d+) inside, copies (\d+): genome (\d+), wall (\d+)/);return [!!m&&+m[2]<=2&&+m[5]>+m[4],m?`${m[2]} inside, copies to genome ${m[4]}, wall ${m[5]}`:'no result'];}},
  {id:'budpool',cap:'The closure kind\'s bud grows from a pool of its 47 part types (8 each, 40 of the last; 8 blanks), splits on a stand-in catch',demo:'budpool',seeds:[1,2,3,4],need:3,steps:250000,secs:220,
    pass:(L,o)=>{const m=o.match(/result: cells=(\d+)\/47 complete=(\S+) split=(\S+) refilled=\S+ copies=(\d+) .*stray=(\d+)/);return [!!m&&m[3]!=='not'&&+m[5]===0,m?`${m[1]}/47 cells, split ${m[3]}, ${m[4]} copies, ${m[5]} stray`:'no result'];}},
  {id:'budcycle',cap:'One generation of the kind from its own kit: the parent copies its held founder, grows its bud from the pool; the bud catches a real copy, splits and is complete',demo:'budcycle',seeds:[1,2,3,4],need:3,steps:300000,secs:600,env:{BCAFTER:'2000',BCSEED:'-1',BCK:'0',BCHOLD:'1',BCB:'200',BCF:'0',BCS:'32',BCL:'0'},
    pass:(L,o)=>{const m=o.match(/result: cells=(\d+)\/47 complete=(\S+) catch=(\S+) early=(\d) catchCells=(\d+) split=(\S+) .*budCopies=(\d+) .*newRoots=(\S+) .*stray=(\d+)/);
      return [!!m&&m[2]!=='not'&&m[3]!=='not'&&m[6]!=='not'&&+m[9]===0,m?`split ${m[6]} (catch at ${m[5]} cells), complete ${m[2]}, bud copies ${m[7]}, new roots ${m[8]}, ${m[9]} stray`:'no result'];}},
  // run 20261004-2051 (explore): the lysis side '!' (RULES Core changes). A parent with a complete bud stuck on its seed
  // site (no food), 4 cutters 'z@!-|-|' (labelled), the anchor on cell 44 (openRange 50): the stuck bud comes apart into
  // its 47 parts and a later bud on the seed site is built from at least 40 of them
  {id:'lysis',cap:'Lysis: a stuck bud taken apart into its parts by a cutter at its waiting anchor; a new bud on the parent grows from them',demo:'lysis',seeds:[1,2,3,4],need:3,steps:1000000,secs:150,
    pass:(L,o)=>{const m=o.match(/result: lysedFirst=(\S+) .*max=(\d+) .*reused=(\d+) cuts=(\d+)/);return [!!m&&m[1]!=='not'&&+m[3]>=40,m?`apart at ${m[1]}, a later bud of ${m[2]} cells, ${m[3]} of them the stuck bud's parts, ${m[4]} cuts`:'no result'];}},
  // run 20261004-1021 (build): three generations on a slow supply (labelled environment drive: 400 inert pre-food turning
  // into copy blanks, the untyped building blocks, at 0.0003 per 100 steps; world 36) and a monomer loop (labelled: free genome monomers turn back into blanks, 0.002 per
  // 100 steps; without it 0 of 4, run 1021); the bud grows off its parent's corner
  // (closed walls, no harness). Replaces budcycle-free (two generations, 180 pre-food at 0.001, world 32; runs 0621-0751).
  {id:'budcycle-3',cap:'Three generations from the kit on a slow supply: a bud of the bud\'s bud complete, let go and holding a caught strand',demo:'budcycle',seeds:[1,2,3,4],need:3,steps:1200000,secs:2000,env:{BCAFTER:'900000',BCGEN:'3'},
    pass:(L,o)=>{const m=o.match(/result: .*split=(\S+) .*gen2=(\S+) gen3=(\S+) ownCopies=(\S+) stray=(\d+)/);return [!!m&&m[3]!=='not'&&+m[5]===0,m?`first split ${m[1]}, generation 2 at ${m[2]}, 3 at ${m[3]}, own copies after let-go (generation:copies) ${m[4]}, ${m[5]} stray`:'no result'];}},
];

function run(c,seed){return new Promise(res=>{const args=[path.join(__dirname,'demos.js'),c.demo,String(seed),String(c.steps),path.join('runs','check')];if(c.extra)args.push(c.extra);
  const p=spawn(process.execPath,args,{env:{...process.env,TRI_NOPIC:'1',...(c.env||{})}});let out='',err='';const t0=Date.now();
  p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>err+=d);
  p.on('close',code=>{const lines=out.split('\n').filter(l=>l.startsWith('t='));const L=lines[lines.length-1]||'';
    let ok=false,ev='';if(code!==0)ev='crashed: '+(err.trim().split('\n').find(l=>/Error/.test(l))||'exit '+code);else[ok,ev]=c.pass(L,out);
    if(process.env.CHECK_SAVE)require('fs').writeFileSync(path.join(process.env.CHECK_SAVE,`${c.id}_${seed}.txt`),out);   // whole output, to compare runs
    res({ok,ev,secs:(Date.now()-t0)/1000});});});}

async function main(){const want=process.argv.slice(2),sel=CHECKS.filter(c=>!want.length||want.includes(c.id));
  if(want.length&&sel.length!==want.length)throw Error('unknown check; one of '+CHECKS.map(c=>c.id).join(' '));
  // jobs longest first, at most 4 at once; each check's line is printed as soon as its last world finishes (a restart
  // loses only the checks still running)
  const jobs=sel.flatMap(c=>c.seeds.map(seed=>({c,seed}))).sort((a,b)=>b.c.secs-a.c.secs),res=new Map(),t0=Date.now(),left=new Map(sel.map(c=>[c,c.seeds.length]));
  let next=0,fails=0;const report=c=>{const rs=c.seeds.map(seed=>[seed,res.get(jobs.find(j=>j.c===c&&j.seed===seed))]),k=rs.filter(([,r])=>r.ok).length,need=c.need||c.seeds.length,ok=k>=need;
    if(!ok&&!c.partial)fails++;const tag=ok?'PASS':c.partial?'PART':'FAIL',w=c.seeds.length>1?` ${k}/${c.seeds.length} worlds (need ${need}):`:':';
    console.log(`${tag} ${c.id.padEnd(12)} ${c.cap}${w} ${rs.map(([seed,r])=>(c.seeds.length>1?`[${seed}${r.ok?'+':'-'}] `:'')+r.ev).join('; ')} (${Math.max(...rs.map(([,r])=>r.secs)).toFixed(0)} s)`);};
  const worker=async()=>{while(next<jobs.length){const j=jobs[next++];res.set(j,await run(j.c,j.seed));left.set(j.c,left.get(j.c)-1);if(!left.get(j.c))report(j.c);}};
  await Promise.all([1,2,3,4].map(worker));
  console.log(`${sel.length-fails} of ${sel.length} checks pass (partial ones never fail); ${((Date.now()-t0)/1000).toFixed(0)} s`);process.exitCode=fails?1:0;}
main();
