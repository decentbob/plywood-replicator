#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib'),assert=require('assert/strict');
const base=require('./resource_ports');
const {report}=require('./resource_economy');
const {PolygonContactSim}=require('./polygon_contact_physics');
const INPUT='experiments/out/RP_preflight_20260927.json.gz';
const SOURCES=['src/sim.js','experiments/resource_economy.js','experiments/resource_ports.js',
  'experiments/polygon_contact_physics.js','experiments/polygon_contact.js','experiments/polygon_contact_plan.md'];
const clone=x=>JSON.parse(JSON.stringify(x));
const root=path.join(__dirname,'..');
function load(file){const b=fs.readFileSync(file);return JSON.parse((file.endsWith('.gz')?zlib.gunzipSync(b):b).toString());}
function canonical(state){const s=clone(state);delete s.nums.pinsVersion;return s;}
function snapshot(s,target,arm){
  const q=base.snapshot(s,target);let hullExcess=0;
  for(let u=0;u<s.n;u++){const ps=base.polygon(s,u);hullExcess=Math.max(hullExcess,base.area(base.hull(ps))-base.area(ps));}
  q.maxHullExcess=hullExcess;
  if(q.target){q.target.candidate=arm==='polygon'?s._candidate(target.u,target.v):q.target.neighbor&&q.target.centreGate;
    q.target.eligible=q.target.candidate&&q.target.geom;}
  return q;
}
function staticCases(input){
  return input.ideal.map(c=>{
    const s=new PolygonContactSim(c.params);s._shapePairs();
    const inspect=q=>{const x=base.contact(s,q.u,q.i,q.v,q.j);return {...x,candidate:s._candidate(q.u,q.v)};};
    const e=report().examples.find(e=>e.n===c.n),full=base.pattern(e.n,e.cycle.states[0],e.cycle.columns*3+10);
    const fronts=c.fronts.map(f=>{
      const outside=full.find(n=>n.id===f.id);assert(outside);
      const p=clone(c.params);p.fixture.push(outside);p['n'+(outside.kind==='B'?'B':outside.kind==='T'?'C':'A')]++;
      const trial=new PolygonContactSim(p),u=trial._units[outside.id];trial._shapePairs();
      return {id:f.id,slotFree:trial._slotFree(u,trial.px[u],trial.py[u]),contacts:f.contacts.map(q=>{
        const x=base.contact(trial,q.u,q.i,q.v,q.j);return {...x,candidate:trial._candidate(q.u,q.v)};
      })};
    });
    return {n:c.n,parity:c.parity,length:c.length,turn:c.turn,proxy:c.proxy,contacts:c.contacts.map(inspect),fronts};
  });
}
function runCase(c,arm,kind){
  const Class=arm==='polygon'?PolygonContactSim:base.PortSim,s=Class.fromState(c.initial);
  const initial=s.saveState(),target=c.target,samples=[snapshot(s,target,arm)],horizon=kind==='physical'?100:10;
  const slotFree=kind==='steric'?s._slotFree(0,s.px[0],s.py[0]):null;
  for(let t=1;t<=horizon;t++){base.advance(s);assert.deepEqual(s.check(),[]);if([1,10,100].includes(t))samples.push(snapshot(s,target,arm));}
  const final=s.saveState();
  for(const k of ['type','bond','w','wr','size','nv','rx','ry','edgeOf'])assert.deepEqual(initial.arrays[k],final.arrays[k]);
  if(arm==='baseline')assert.deepEqual(canonical(final),canonical(c.final),'Baseline no longer replays archived fixture');
  const key=kind==='physical'?[c.proxy,c.fixture,c.first,c.seed,c.scheme].join('/'):[c.proxy,c.kind,c.orientation,c.iters].join('/');
  return {key,arm,kind,target:target||null,proxy:c.proxy,fixture:c.fixture||c.kind,scheme:c.scheme||`zero${c.iters}`,
    first:c.first,seed:c.seed,orientation:c.orientation,iters:c.iters,slotFree,initial,final,
    initialHash:base.digest(initial),finalHash:base.digest(final),samples};
}
function summarize(r){
  const ideals=r.ideal,poly=r.runs.filter(c=>c.arm==='polygon'),steric=poly.filter(c=>c.kind==='steric');
  const physical=poly.filter(c=>c.kind==='physical'),quiet=physical.filter(c=>['body4','zero4','zero16'].includes(c.scheme));
  const resolved=physical.filter(c=>c.scheme==='individual16');
  const staticPass=ideals.every(c=>c.contacts.every(q=>q.geom&&q.candidate)&&c.fronts.every(f=>f.slotFree&&f.contacts.every(q=>q.geom&&q.candidate)));
  const stericPass=steric.every(c=>{
    const before=c.samples[0],after=c.samples.at(-1),overlapping=c.fixture==='B'&&c.orientation==='long';
    const unchanged=before.polygons.every((p,u)=>p.every((xy,k)=>xy.every((x,d)=>Math.abs(x-after.polygons[u][k][d])<=1e-8)));
    return c.slotFree===!overlapping&&after.maxHullOverlap<=1e-8&&(overlapping||unchanged);
  });
  const quietPass=quiet.every(c=>{const q=c.samples.at(-1);return q.target.eligible&&q.target.pinGap<1e-7&&q.maxPin<1e-7;});
  const individualPass=resolved.every(c=>c.samples.at(-1).target.eligible);
  const groups=[];
  for(const arm of ['baseline','polygon'])for(const proxy of ['area','long'])for(const fixture of ['left','right','square'])for(const scheme of ['body4','individual4','individual16','zero4','zero16']){
    const cs=r.runs.filter(c=>c.kind==='physical'&&c.arm===arm&&c.proxy===proxy&&c.fixture===fixture&&c.scheme===scheme);
    groups.push({arm,proxy,fixture,scheme,n:cs.length,eligible100:cs.filter(c=>c.samples.at(-1).target.eligible).length,
      maxFinalTargetGap:Math.max(...cs.map(c=>c.samples.at(-1).target.pinGap)),maxSamplePin:Math.max(...cs.flatMap(c=>c.samples.map(q=>q.maxPin))),
      maxHullExcess:Math.max(...cs.flatMap(c=>c.samples.map(q=>q.maxHullExcess)))});
  }
  return {gates:{staticPass,stericPass,quietPass,individualPass,pass:staticPass&&stericPass&&quietPass&&individualPass},
    counts:{ideal:ideals.length,fronts:ideals.reduce((a,c)=>a+c.fronts.length,0),runs:r.runs.length,quiet:quiet.length,individual16:resolved.length},groups,
    steric:r.runs.filter(c=>c.kind==='steric').map(c=>({arm:c.arm,key:c.key,slotFree:c.slotFree,before:c.samples[0].maxHullOverlap,after:c.samples.at(-1).maxHullOverlap}))};
}
function main(){
  const out=process.argv[2];assert(out,'Usage: node experiments/polygon_contact.js UNIQUE_OUTPUT_STEM');
  for(const ext of ['.json','.summary.json'])assert(!fs.existsSync(out+ext),'Output exists');
  const input=load(path.join(root,INPUT)),cpu=process.cpuUsage();
  const r={schema:1,ideal:staticCases(input),runs:[]};
  for(const kind of ['physical','steric'])for(const c of input[kind])for(const arm of ['baseline','polygon'])r.runs.push(runCase(c,arm,kind));
  r.summary=summarize(r);
  r.provenance={baseline:'81ae321',command:process.argv,node:process.version,date:new Date().toISOString(),input:INPUT,
    inputHash:base.hash(fs.readFileSync(path.join(root,INPUT))),sources:Object.fromEntries(SOURCES.map(f=>[f,base.hash(fs.readFileSync(path.join(root,f)))])),
    cpuSeconds:Object.values(process.cpuUsage(cpu)).reduce((a,b)=>a+b,0)/1e6,physicsSteps:24320};
  fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out+'.json',JSON.stringify(r)+'\n',{flag:'wx'});
  fs.writeFileSync(out+'.summary.json',JSON.stringify(r.summary,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({gates:r.summary.gates,counts:r.summary.counts,cpuSeconds:r.provenance.cpuSeconds}));
}
if(require.main===module)main();
module.exports={INPUT,SOURCES,load,canonical,snapshot,staticCases,runCase,summarize};
