'use strict';
// Capability checks: one line per capability that ROADMAP's module table marks as working (plus partial ones, which
// report but do not fail). Each check runs an existing demo (tri/demos.js, pictures off) on fixed seeds and reads the
// demo's own last report line; a capability claimed "N of 4 worlds" needs that many seeds to pass.
//   node tri/check.js [name ...]     (names: the `id` column; default all; at most 4 processes; about 35 minutes;
//   each check prints when its last world finishes, so lines come in finishing order; CHECK_SAVE=dir keeps each world's
//   whole output there, e.g. to show that a change leaves outputs byte for byte the same)
// Exit code 1 if a working capability fails.
const {spawn}=require('child_process'),path=require('path');
const num=(L,re)=>{const m=L.match(re);return m?+m[1]:NaN;};
const count=(L,re)=>(L.match(re)||[]).length;
// each check: id, capability, demo name, seeds, steps, extra, env (variables for the demo), need (seeds that must pass), secs (rough time per world,
// for scheduling), pass(last report line, all output) -> [ok, short evidence]; partial: reported, never fails
const CHECKS=[
  {id:'copy',cap:'Genome: typed chain copying (zip)',demo:'copy',seeds:[1,2,3,4],need:3,steps:20000,secs:8,
    pass:L=>{const n=count(L,/BBAABA\//g);return [n>=2,`${n} complete copies BBAABA`];}},
  {id:'ring',cap:'Membrane growth: ring kit closes (R=3)',demo:'ring',seeds:[1,2,3,4],need:3,steps:60000,extra:'3',secs:8,
    pass:L=>{const m=L.match(/closed=at (\d+)/);return [!!m,m?`closed at ${m[1]}`:'open '+(L.match(/cells=(\S+)/)||[])[1]];}},
  {id:'imprint',cap:'Contact copying: a ring with one of each part closes, a second grows from copies',demo:'imprint',seeds:[1,2,3,4],need:3,steps:200000,secs:180,
    pass:(L,o)=>{const m=o.match(/result: ring cells (\d+) (\d+) of 30, closed at (\S+) \/ (\S+)/);return [!!m&&m[3]!=='not'&&m[4]!=='not',m?`rings ${m[1]}/${m[2]} cells, closed ${m[3]} / ${m[4]}`:'no result'];}},
  {id:'imprint-genome',cap:'Contact copying: a strand copied from copies of its own triangles',demo:'imprint',seeds:[1,2,3,4],need:3,steps:30000,extra:'g',secs:25,
    pass:(L,o)=>{const n=num(o,/result: (\d+) free strands/);return [n>=4,`${n} strands`];}},
  {id:'imprint-genome-c',cap:'  control: plain blanks, no copies',demo:'imprint',seeds:[1],steps:30000,extra:'gc',secs:15,
    pass:(L,o)=>{const n=num(o,/result: (\d+) free strands/);return [n===1,`${n} strands`];}},
  {id:'imprint-cell',cap:'Genome on copies inside a sealed cell (spent walls: every copy goes to the genome)',demo:'imprint',seeds:[1,2,3,4],need:3,steps:60000,extra:'60m',secs:50,
    pass:(L,o)=>{const m=o.match(/result: (\d+) free strands \(founder included\), copies (\d+): genome (\d+), wall (\d+)/);return [!!m&&+m[1]>=4&&+m[4]===0,m?`${m[1]} strands, copies to genome ${m[3]}, wall ${m[4]}`:'no result'];}},
  {id:'imprint-cell-n',cap:'  control: plain walls take most blanks',demo:'imprint',seeds:[1],steps:60000,extra:'60mn',secs:50,
    pass:(L,o)=>{const m=o.match(/result: (\d+) free strands \(founder included\), copies (\d+): genome (\d+), wall (\d+)/);return [!!m&&+m[1]<=3&&+m[4]>+m[3],m?`${m[1]} strands, copies to genome ${m[3]}, wall ${m[4]}`:'no result'];}},
  {id:'imprint-pore',cap:'A cell fed through a pore: copy blanks from outside copy only its genome (spent walls)',demo:'imprint',seeds:[1,2,3,4],need:3,steps:100000,extra:'150p',secs:70,
    pass:(L,o)=>{const m=o.match(/result: (\d+) free strands \(founder included\), (\d+) inside, copies (\d+): genome (\d+), wall (\d+)/);return [!!m&&+m[2]>=4&&+m[5]===0,m?`${m[2]} strands inside (${m[1]} in all), copies to genome ${m[4]}, wall ${m[5]}`:'no result'];}},
  {id:'imprint-hood',cap:'A hooded pore keeps the strands in: blanks reach the pore along a corridor no strand can turn into',demo:'imprint',seeds:[1,2,3,4],need:3,steps:100000,extra:'150ph',secs:70,
    pass:(L,o)=>{const m=o.match(/result: (\d+) free strands \(founder included\), (\d+) inside, copies (\d+): genome (\d+), wall (\d+)/);return [!!m&&+m[2]>=4&&+m[2]===+m[1],m?`${m[2]} of ${m[1]} strands inside, copies to genome ${m[4]}`:'no result'];}},
  {id:'imprint-held',cap:'Only a held strand is copied (option heldCopy): 3 rival strands outside stay sterile, the cell keeps its copies',demo:'imprint',seeds:[1,2,3,4],need:3,steps:100000,extra:'150pzox',secs:70,
    pass:(L,o)=>{const m=o.match(/result: (\d+) free strands \(founder included\), (\d+) inside, copies (\d+): genome (\d+), wall (\d+)/);return [!!m&&+m[2]>=4,m?`${m[2]} strands inside (${m[1]} in all)`:'no result'];}},
  {id:'imprint-held-c',cap:'  control: without the option the rivals multiply outside and the cell keeps few',demo:'imprint',seeds:[1],steps:100000,extra:'150pzx',secs:70,
    pass:(L,o)=>{const m=o.match(/result: (\d+) free strands \(founder included\), (\d+) inside/);return [!!m&&+m[2]<=3&&+m[1]>=10,m?`${m[2]} inside of ${m[1]}`:'no result'];}},
  {id:'imprint-held-w',cap:'A 7-cell pore leaks every copy, the held founder keeps copying (heldCopy)',demo:'imprint',seeds:[1,2,3,4],need:3,steps:100000,extra:'150pzow',secs:70,
    pass:(L,o)=>{const m=o.match(/result: (\d+) free strands \(founder included\), (\d+) inside/);return [!!m&&+m[1]>=5,m?`${m[1]} strands made (${m[2]} inside)`:'no result'];}},
  {id:'imprint-pore-c',cap:'  control: no pore, no blank gets in',demo:'imprint',seeds:[1],steps:60000,extra:'150pc',secs:40,
    pass:(L,o)=>{const m=o.match(/result: (\d+) free strands \(founder included\), (\d+) inside, copies (\d+)/);return [!!m&&+m[3]===0&&+m[1]===1,m?`${m[1]} strand, ${m[3]} copies`:'no result'];}},
  {id:'imprint-pore-n',cap:'  control: plain walls take the blanks',demo:'imprint',seeds:[1],steps:60000,extra:'150pn',secs:40,
    pass:(L,o)=>{const m=o.match(/result: (\d+) free strands \(founder included\), (\d+) inside, copies (\d+): genome (\d+), wall (\d+)/);return [!!m&&+m[2]<=2&&+m[5]>+m[4],m?`${m[2]} inside, copies to genome ${m[4]}, wall ${m[5]}`:'no result'];}},
  {id:'budpore',cap:'Bud pair on copies: the bud catches a copy mid-wall, splits with food left (50+ blanks)',demo:'budpore',seeds:[1,2,3,4],need:3,steps:200000,extra:'300',secs:300,
    pass:(L,o)=>{const m=o.match(/split at (\d+) with (\d+) blanks left/),c=o.match(/anchored strand (\d+) \(copies (\d+)\)/);return [!!m&&+m[2]>=50,(m?`split at ${m[1]}, ${m[2]} blanks left`:'not split')+(c?`; bud copies after the split ${c[2]}`:'')];}},
  {id:'budpore-held',cap:'The bud copies its genome after the split (heldCopy; both anchors on high ends, P\'s on side 52:1 from the dry-run): 5+ copies on its caught strand',demo:'budpore',seeds:[1,2,3,4],need:3,steps:200000,extra:'300',secs:300,env:{BUDAG:'Z',BUDPFE:'z',BUDPA:'52:1',TRI_PARAMS:'{"heldCopy":true}'},
    pass:(L,o)=>{const m=o.match(/split at (\d+) with (\d+) blanks left/),c=o.match(/anchored strand (\d+) \(copies (\d+)\)/);return [!!m&&!!c&&+c[2]>=5,(m?`split at ${m[1]}, ${m[2]} blanks left`:'not split')+(c?`; bud copies after the split ${c[2]}`:'')];}},
  {id:'budpore-kind',cap:'The kind\'s own layout (R 5 pair, 7-cell pores, heldCopy, anchors Z on arc cell 6): the bud catches a strand, splits, copies it 3+ times',demo:'budpore',seeds:[1,2,3,4],need:3,steps:200000,extra:'300c',secs:150,
    env:{BUDRP:'5',BUDRD:'5',BUDPG:'-1.75,1.75',BUDDG:'-1.75,1.75',BUDPFE:'z',BUDLX:'2',BUDAG:'Z',BUDNI:'20',BUDPS:'2',BUDPA:'16:0',BUDA:'90:2',TRI_PARAMS:'{"heldCopy":true}'},
    pass:(L,o)=>{const m=o.match(/split at (\d+) with (\d+) blanks left/),c=o.match(/anchored strand (\d+) \(copies (\d+)\)/);return [!!m&&!!c&&+c[2]>=3,(m?`split at ${m[1]}`:'not split')+(c?`; bud copies after the split ${c[2]}`:'')];}},
  {id:'budpore-c',cap:'Sealed bud pair: the parent feeds from food inside, its founder under the doorway; the bud catches a copy and splits',demo:'budpore',seeds:[1,2,3,4,5,6,7,8],need:6,steps:100000,extra:'100c',secs:150,
    pass:(L,o)=>{const m=o.match(/split at (\d+) with (\d+) blanks left, strands in D at the split (\d+)/),c=o.match(/anchored strand (\d+) \(copies (\d+)\)/);return [!!m,(m?`split at ${m[1]}, ${m[3]} strands in D`:'not split')+(c?`; bud copies after the split ${c[2]}`:'')];}},
  {id:'budpool',cap:'The closure kind\'s bud grows from a pool of its 47 part types (8 each, 40 of the last; 8 blanks), splits on a stand-in catch',demo:'budpool',seeds:[1,2,3,4],need:3,steps:250000,secs:220,
    pass:(L,o)=>{const m=o.match(/result: cells=(\d+)\/47 complete=(\S+) split=(\S+) refilled=\S+ copies=(\d+) .*stray=(\d+)/);return [!!m&&m[3]!=='not'&&+m[5]===0,m?`${m[1]}/47 cells, split ${m[3]}, ${m[4]} copies, ${m[5]} stray`:'no result'];}},
  {id:'budpool-e',cap:'  the same with no part of the last type: its pore side copied by the pool (E source inside the pair; 16 blanks)',demo:'budpool',seeds:[1,2,3,4],need:3,steps:250000,secs:220,env:{BPES:'1',BPE:'0',BPB:'16'},
    pass:(L,o)=>{const m=o.match(/result: cells=(\d+)\/47 complete=(\S+) split=(\S+) .*stray=(\d+) .*Esource=(\d+) lastFromSource=(\w+)/);return [!!m&&m[3]!=='not'&&+m[4]===0&&m[6]==='true',m?`${m[1]}/47 cells, split ${m[3]}, ${m[5]} copies of E's pore side, ${m[4]} stray`:'no result'];}},
  {id:'budcycle',cap:'One generation of the kind from its own kit: the parent copies its held founder, grows its bud from the pool; the bud catches a real copy, splits and is complete',demo:'budcycle',seeds:[1,2,3,4],need:3,steps:300000,secs:600,env:{BCAFTER:'2000'},
    pass:(L,o)=>{const m=o.match(/result: cells=(\d+)\/47 complete=(\S+) catch=(\S+) early=(\d) catchCells=(\d+) split=(\S+) .*budCopies=(\d+) .*newRoots=(\S+) .*stray=(\d+)/);
      return [!!m&&m[2]!=='not'&&m[3]!=='not'&&m[6]!=='not'&&+m[9]===0,m?`split ${m[6]} (catch at ${m[5]} cells), complete ${m[2]}, bud copies ${m[7]}, new roots ${m[8]}, ${m[9]} stray`:'no result'];}},
  {id:'budcycle-2',cap:'Two generations from the kit: a bud grown on a bud\'s seed site completes and lets go after its catch',demo:'budcycle',seeds:[1,2,3,4],need:3,steps:600000,secs:1200,env:{BCAFTER:'300000',BCSTOP2:'1'},
    pass:(L,o)=>{const m=o.match(/result: .*split=(\S+) .*gen2=(\S+) stray=(\d+)/);return [!!m&&m[2]!=='not'&&+m[3]===0,m?`first split ${m[1]}, second generation let go at ${m[2]}, ${m[3]} stray`:'no result'];}},
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
