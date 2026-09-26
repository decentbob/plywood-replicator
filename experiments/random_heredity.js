'use strict';
// All graph/member logic is observation or initial-condition preparation.
const fs = require('fs');
const crypto = require('crypto');
const {fork} = require('child_process');
const {RChem, randomTable, copyTable} = require('../src/rchem');
const {NV} = require('../src/sim');
const {drawR} = require('./rsearch');
const sha = x => crypto.createHash('sha256').update(x).digest('hex');
const hash = p => sha(fs.readFileSync(p));
const write = (p, x) => fs.writeFileSync(p, JSON.stringify(x) + '\n', {flag: 'wx'});
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const SOURCES = ['src/sim.js', 'src/rchem.js', 'experiments/rsearch.js',
  'experiments/random_heredity.js', 'experiments/random_heredity_test.js',
  'experiments/random_heredity_plan.md', 'experiments/out/rsearch_1_partial.jsonl'];

function graph(s, members) {
  const index = new Map(members.map((u, i) => [u, i]));
  return members.map(u => ({type: s._ti(u), sides: Array.from({length: 4}, (_, i) => {
    const q = s.bond[4 * u + i];
    return q < 0 || !index.has(q >> 2) ? null : [index.get(q >> 2), q & 3];
  })}));
}
function canonical(g) {
  // Connected side-labelled graphs have a unique traversal from a chosen root.
  // Taking the least complete encoding over roots is exact, not a short hash.
  const forms = g.map((_, root) => {
    const order = [root], ids = new Map([[root, 0]]);
    for (let k = 0; k < order.length; ++k) for (const q of g[order[k]].sides) {
      if (q && !ids.has(q[0])) { ids.set(q[0], order.length); order.push(q[0]); }
    }
    if (order.length !== g.length) throw new Error('Canonical graph must be connected');
    return JSON.stringify(order.map(i => [g[i].type, ...g[i].sides.map(q => q ? [ids.get(q[0]), q[1]] : null)]));
  });
  return forms.sort()[0];
}
function components(s) {
  const seen = new Set(), out = [];
  for (let u = 0; u < s.n; ++u) if (!seen.has(u)) {
    const comp = s.componentOf(u); comp.forEach(x => seen.add(x)); out.push(comp);
  }
  return out;
}
function catalog(s) {
  const out = new Map();
  for (const comp of components(s)) if (comp.length >= 3 && comp.length <= 10) {
    const g = graph(s, comp), sig = canonical(g), rec = out.get(sig) || {
      sig, count: 0, size: comp.length, composition: g.map(x => x.type).sort((a,b) => a-b).join(','),
      capture: s.capture(comp), graph: g};
    ++rec.count; out.set(sig, rec);
  }
  return out;
}
function control() {
  const params = {table: copyTable(0.00003, 0.01), seed: 1, nEach: 150, W: 25, H: 25,
    rBreak: 0.000005, bodyJostle: true, iters: 4, snapCorners: true};
  const variants = ['AAB', 'ABA'].map(seq => {
    const s = new RChem(params); s.seedChains([seq], 5);
    const comp = components(s).find(c => c.length === 3), g = graph(s, comp);
    const reverse = g.map(v => ({type: v.type, sides: [v.sides[0], v.sides[3], v.sides[2], v.sides[1]]
      .map(q => q ? [q[0], q[1] === 1 ? 3 : q[1] === 3 ? 1 : q[1]] : null)}));
    return {name: seq, capture: s.capture(comp), targets: [...new Set([canonical(g), canonical(reverse)])]};
  });
  return {name: 'copy', params, variants};
}
function inventory(s) {
  const sizes = components(s).map(x => x.length);
  const counts = new Array(s.p._tab.K).fill(0);
  for (let u = 0; u < s.n; ++u) ++counts[s._ti(u)];
  return {t: s.t, counts, free: sizes.filter(x => x === 1).length,
    bonded: sizes.filter(x => x > 1).reduce((a,b) => a+b, 0), largest: Math.max(...sizes)};
}
function overlaps(s) {
  // Convex polygon SAT using actual offsets, periodic nearest-image centers.
  let count = 0;
  for (let u = 0; u < s.n; ++u) for (let v = u + 1; v < s.n; ++v) {
    const dx = s._dx(s.px[v] - s.px[u]), dy = s._dy(s.py[v] - s.py[u]);
    if (Math.hypot(dx, dy) > s.rad[u] + s.rad[v]) continue;
    const a = Array.from({length: s.corners(u)}, (_, k) => [s.ox[u*NV+k], s.oy[u*NV+k]]);
    const b = Array.from({length: s.corners(v)}, (_, k) => [dx+s.ox[v*NV+k], dy+s.oy[v*NV+k]]);
    const separated = [a,b].some(poly => poly.some((p,i) => {
      const q = poly[(i+1)%poly.length], nx = p[1]-q[1], ny = q[0]-p[0];
      const aa = a.map(z => z[0]*nx+z[1]*ny), bb = b.map(z => z[0]*nx+z[1]*ny);
      return Math.max(...aa) <= Math.min(...bb)+1e-9 || Math.max(...bb) <= Math.min(...aa)+1e-9;
    }));
    if (!separated) ++count;
  }
  return count;
}
function prepareWorld(def, variant, arm, seed) {
  const s = new RChem({...def.params, seed}), founders = [];
  if (arm !== 'plain') for (const [fx,fy] of [[.25,.25],[.75,.25],[.25,.75],[.75,.75]]) {
    const members = s.transplant(def.variants[variant].capture, fx*s.p.W, fy*s.p.H);
    if (!members) throw new Error('Insufficient founder material');
    founders.push(...members);
  }
  if (arm === 'disrupted') for (const u of founders) for (let i=0;i<4;++i) if (s.bond[4*u+i]>=0) s._unlink(u,i);
  s._deriveAll(); s._computeOpen();
  return {s, founders};
}
class Observer {
  constructor(s, variants, founders) {
    this.s = s; this.targets = variants.map(v => new Set(v.targets));
    this.founders = new Set(founders); this.events = []; this.episodes = [];
    this.active = new Map(); this.touched = new Set();
    const link = s._link.bind(s), unlink = s._unlink.bind(s);
    s._link = (u,i,v,j) => { link(u,i,v,j); this.event(1,u,i,v,j); };
    s._unlink = (u,i) => { const q=s.bond[4*u+i]; unlink(u,i); if(q>=0)this.event(-1,u,i,q>>2,q&3); };
    this.scan();
  }
  event(kind,u,i,v,j) { this.events.push([this.s.t,kind,u,i,v,j]); this.touched.add(u); this.touched.add(v); }
  scan() {
    const s=this.s;
    for (const [key,e] of this.active) if(e.members.some(u=>this.touched.has(u))) {
      e.end=s.t; this.active.delete(key);
    }
    for (const comp of components(s)) {
      if(comp.length<3||comp.length>10)continue;
      const members=[...comp].sort((a,b)=>a-b), key=members.join(',');
      if(this.active.has(key))continue;
      const sig=canonical(graph(s,comp)), variant=this.targets.findIndex(set=>set.has(sig));
      if(variant<0)continue;
      const e={variant,members,sig,start:s.t,end:null,founderOverlap:members.filter(u=>this.founders.has(u)).length,
        states:members.map(u=>s.is[u])};
      this.active.set(key,e);this.episodes.push(e);
    }
    this.touched.clear();
  }
  tick() { if(this.touched.size)this.scan(); }
  result() { return {events:this.events,episodes:this.episodes}; }
}
function summarize(raw) {
  const unique = new Map(), persistent = new Map();
  for(const e of raw.episodes) {
    if(e.founderOverlap)continue;
    const key=e.members.join(','); if(!unique.has(key))unique.set(key,e);
    if((e.end??raw.steps)-e.start>=100&&!persistent.has(key))persistent.set(key,e);
  }
  const witnesses=[];
  for(const child of persistent.values()) {
    const cm=new Set(child.members);
    for(const parent of persistent.values()) {
      if(parent===child||parent.variant!==child.variant||parent.members.some(u=>cm.has(u)))continue;
      const pm=new Set(parent.members);
      const event=raw.events.find(([t,k,u,,v])=>k===1&&t>=parent.start+100&&t<child.start&&t<=(parent.end??raw.steps)&&
        ((pm.has(u)&&cm.has(v))||(pm.has(v)&&cm.has(u))));
      if(event){witnesses.push({variant:child.variant,parent:parent.members,child:child.members,event});break;}
    }
  }
  return {fresh:raw.targets.map((_,v)=>[...unique.values()].filter(e=>e.variant===v).length),
    persistent:raw.targets.map((_,v)=>[...persistent.values()].filter(e=>e.variant===v).length),witnesses,
    censored:raw.episodes.filter(e=>e.end===null&&raw.steps-e.start<100).length};
}
function checkProtocol(p) {
  for(const [file,h] of Object.entries(p.sourceHashes))if(hash(file)!==h)throw new Error(`Source changed: ${file}`);
}
function prepare(stem) {
  const rows=fs.readFileSync('experiments/out/rsearch_1_partial.jsonl','utf8').trim().split(/\r?\n/).map(JSON.parse);
  const candidates=[55,57,4,15,1,54].map(i=>{
    const row=rows.find(r=>r.i===i), params=drawR(i);
    if(JSON.stringify(params)!==JSON.stringify(row.params))throw new Error(`Historical parameters mismatch ${i}`);
    const table=randomTable(params);
    return {i,params,table,tableHash:sha(JSON.stringify(table)),historical:row};
  });
  write(`${stem}.protocol.json`,{schema:1,baseline:'0f2dbed',created:new Date().toISOString(),
    sourceHashes:Object.fromEntries(SOURCES.map(p=>[p,hash(p)])),candidates,control:control(),
    physics:{bodyJostle:true,iters:4,snapCorners:true},command:process.argv});
}
function recover(stem) {
  const p=read(`${stem}.protocol.json`);checkProtocol(p);
  const start=process.cpuUsage(), chosen=p.candidates[0], s=new RChem({...chosen.params,...p.physics,table:chosen.table});
  const totals=new Map(), samples=[];
  let last;
  for(let t=5000;t<=30000;t+=5000){s.run(5000);last=catalog(s);
    for(const [sig,c] of last)totals.set(sig,(totals.get(sig)||0)+c.count);
    samples.push({t,inventory:inventory(s),structures:[...last.values()]});
    console.log(`recovery ${t}/30000`);
  }
  const ranked=[...last.values()].map(c=>({...c,total:totals.get(c.sig)})).sort((a,b)=>b.total-a.total||a.sig.localeCompare(b.sig));
  let pair=null;
  for(let i=0;i<ranked.length&&!pair;++i)for(let j=i+1;j<ranked.length;++j)if(ranked[i].composition===ranked[j].composition){pair=[ranked[i],ranked[j]];break;}
  const definition=pair?{name:'table55',params:{...chosen.params,...p.physics,table:chosen.table},
    variants:pair.map((c,i)=>({name:`V${i}`,capture:c.capture,targets:[c.sig],composition:c.composition,total:c.total}))}:null;
  write(`${stem}.recovery.json`,{protocolHash:hash(`${stem}.protocol.json`),samples,ranked,definition,final:s.saveState(),
    cpuSeconds:Object.values(process.cpuUsage(start)).reduce((a,b)=>a+b)/1e6,command:process.argv});
  console.log(JSON.stringify({pair:definition?.variants.map(v=>({name:v.name,composition:v.composition,total:v.total}))}));
}
function runJob(job) {
  const start=process.cpuUsage(), {s,founders}=prepareWorld(job.def,job.variant,job.arm,job.seed);
  const initial=s.saveState(), initialOverlaps=overlaps(s), o=new Observer(s,job.def.variants,founders), samples=[inventory(s)];
  for(let t=0;t<job.steps;++t){s.step();o.tick();if(s.t%1000===0){samples.push(inventory(s));
    if(Object.values(process.cpuUsage(start)).reduce((a,b)=>a+b)/1e6 >= (job.cpuBudget??Infinity))break;}}
  const raw={...job,def:undefined,targets:job.def.variants.map(v=>v.targets),params:s.p,initial,initialOverlaps,founders,
    ...o.result(),samples,final:s.saveState(),requestedSteps:job.steps,steps:s.t,budgetCensored:s.t<job.steps,
    cpuSeconds:Object.values(process.cpuUsage(start)).reduce((a,b)=>a+b)/1e6};
  raw.summary=summarize(raw);return raw;
}
async function batch(stem,mode) {
  const protocol=read(`${stem}.protocol.json`);checkProtocol(protocol);
  const recovery=read(`${stem}.recovery.json`), defs=mode==='calibrate'?[protocol.control]:[protocol.control,recovery.definition];
  if(defs.some(x=>!x))throw new Error('No same-composition variant pair recovered');
  let previousCPU=0;
  if(mode==='screen')for(let v=0;v<2;++v){
    const cal=read(`${stem}.calibrate_copy_v${v}_201_seeded.json`);previousCPU+=cal.cpuSeconds;
    if(cal.budgetCensored||summarize(cal).fresh[v]<1)throw new Error('Positive control calibration failed');
  }
  const jobs=[];
  for(const def of defs)for(let variant=0;variant<2;++variant)for(const seed of mode==='calibrate'?[201]:[202,203])
    for(const arm of mode==='calibrate'?['seeded']:['seeded','disrupted','plain']){
      const id=`${mode}_${def.name}_v${variant}_${seed}_${arm}`,out=`${stem}.${id}.json`;
      if(fs.existsSync(out))throw new Error(`Output exists: ${out}`);
      jobs.push({id,out,def,variant,seed,arm,steps:mode==='calibrate'?10000:50000});
    }
  write(`${stem}.${mode}.manifest.json`,{created:new Date().toISOString(),protocolHash:hash(`${stem}.protocol.json`),
    recoveryHash:hash(`${stem}.recovery.json`),jobs,workers:2,command:process.argv});
  let next=0,cpu=recovery.cpuSeconds+previousCPU,reserved=0;
  async function worker(){while(next<jobs.length){
    if(cpu>=3600)throw new Error('CPU budget reached; remaining jobs censored');
    const job={...jobs[next++],cpuBudget:Math.max(1,Math.min(600,(3600-cpu-reserved)/2))};reserved+=job.cpuBudget;
    await new Promise((resolve,reject)=>{
      const child=fork(__filename,['worker'],{stdio:['ignore','inherit','inherit','ipc']});
      child.send(job);child.on('message',m=>{reserved-=job.cpuBudget;cpu+=m.cpuSeconds;console.log(JSON.stringify({id:job.id,...m}));});
      child.on('error',reject);child.on('exit',c=>c===0?resolve():reject(new Error(`Job failed ${job.id}: ${c}`)));
    });
  }}
  await Promise.all([worker(),worker()]);
}
if(require.main===module){const [command,stem]=process.argv.slice(2);
  if(command==='worker')process.once('message',job=>{const r=runJob(job);write(job.out,r);process.send({cpuSeconds:r.cpuSeconds,...r.summary});process.disconnect();});
  else if(command==='prepare')prepare(stem);
  else if(command==='recover')recover(stem);
  else if(['calibrate','screen'].includes(command))batch(stem,command).catch(e=>{console.error(e);process.exitCode=1;});
  else throw new Error('Usage: random_heredity.js prepare|recover|calibrate|screen UNIQUE_STEM');
}
module.exports={graph,canonical,components,catalog,control,prepareWorld,Observer,summarize,inventory,overlaps,hash,read,checkProtocol};
