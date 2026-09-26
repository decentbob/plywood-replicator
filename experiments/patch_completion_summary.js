#!/usr/bin/env node
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const {setup}=require('./patch_completion'),{sequence}=require('./end_protection'),{F,R,L,I_DOCK,I_REPEL}=require('../src/sim');
const key=r=>[r.seed,r.profile,r.undock].join(':'),sorted=xs=>[...xs].sort((a,b)=>a-b);
function validate(r){
  const initial=setup(r);assert.deepEqual(r.params,initial.s.p,'Unexpected parameters');assert.deepEqual(r.parent,initial.parent);
  assert.equal(r.windows.length,r.steps/5000);assert.equal(r.births.length,r.completed.length);
  const exact=b=>b.seq===sequence&&b.parent===sequence&&b.gen===1;
  assert.equal(r.exact,r.births.filter(exact).length);assert(r.births.every(exact),'Inexact birth: assay scope needs review');
  const adj=Array.from({length:150},()=>new Set()),bond=new Map(),known=new Set(r.parent),nuclei=[];
  const component=u=>{const seen=new Set([u]),todo=[u];while(todo.length)for(const v of adj[todo.pop()])if(!seen.has(v)){seen.add(v);todo.push(v);}return sorted(seen);};
  const active=()=>{const seen=new Set(),rows=[];for(let u=0;u<150;u++)if(!known.has(u)&&!seen.has(u)&&adj[u].size){const units=component(u);for(const x of units)seen.add(x);rows.push(units);}return rows;};
  const history=units=>{const ids=nuclei.filter(i=>units.includes(r.links[i].u));return {nuclei:ids,start:Math.min(...ids.map(i=>r.links[i].t))};};
  const events=[...r.links.map((e,i)=>({...e,index:i,order:0})),...r.completed.map((e,i)=>({...e,index:i,order:1}))].sort((a,b)=>a.t-b.t||a.order-b.order||a.index-b.index);
  assert(r.links.every((e,i)=>e.t>0&&e.t<=r.steps&&(!i||e.t>=r.links[i-1].t)));
  assert(r.completed.every((e,i)=>e.t>0&&e.t<=r.steps&&(!i||e.t>=r.completed[i-1].t)));
  let pos=0,births=0,patchSum=0,multi=0,zero=0;
  for(let t=100;t<=r.steps;t+=100){
    while(pos<events.length&&events[pos].t<=t){const e=events[pos++];
      if(e.order===0){
        assert([e.u,e.v].every(u=>Number.isInteger(u)&&u>=0&&u<150&&!known.has(u)));
        assert((e.i===R&&e.j===L)||(e.i===L&&e.j===R));assert(!bond.has(e.u*4+e.i)&&!bond.has(e.v*4+e.j));
        const a=component(e.u),b=component(e.v);assert(!a.includes(e.v));
        assert.equal(e.kind,a.length===1&&b.length===1?'nucleation':a.length>1&&b.length>1?'merge':'extension');
        if(e.kind==='nucleation')nuclei.push(e.index);
        adj[e.u].add(e.v);adj[e.v].add(e.u);bond.set(e.u*4+e.i,e.v*4+e.j);bond.set(e.v*4+e.j,e.u*4+e.i);
      }else{
        assert.equal(e.t,r.births[e.index].t);assert.equal(e.units.length,10);assert(e.units.every(u=>!known.has(u)));
        assert.deepEqual(sorted(e.units),component(e.units[0]));
        assert.equal(e.units.map(u=>initial.s._letter(u)).join(''),r.births[e.index].seq);
        for(let i=1;i<e.units.length;i++)assert.equal(bond.get(e.units[i-1]*4+R),e.units[i]*4+L);
        const h=history(e.units);assert.deepEqual(sorted(e.nuclei),h.nuclei);assert.equal(e.start,h.start);
        for(const u of e.units)known.add(u);births++;
      }
    }
    const rows=active();patchSum+=rows.length;multi+=rows.length>=2;zero+=rows.length===0;
    if(t%5000===0){const w=r.windows[t/5000-1];assert.equal(w.t,t);assert.equal(w.stats.t,t);assert.equal(w.stats.births,births);
      assert.equal(w.samples,50);assert.equal(w.patchSum,patchSum);assert.equal(w.multi,multi);assert.equal(w.zero,zero);patchSum=multi=zero=0;
      assert.deepEqual(w.rows.map(row=>sorted(row.units)).sort((a,b)=>a[0]-b[0]),rows);
      let linked=0,attached=0;
      for(const row of w.rows){assert.equal(row.states.length,row.units.length);assert.equal(row.faces.length,row.units.length);
        assert.equal(row.seq,row.units.map(u=>initial.s._letter(u)).join(''));assert.equal(row.attached,row.states.filter((st,i)=>st===I_DOCK&&row.faces[i]>=0).length);
        assert(row.states.every(st=>[I_DOCK,I_REPEL].includes(st)));
        assert(row.faces.every(q=>q===-1||(Number.isInteger(q)&&(q&3)===F&&r.parent.includes(q>>2))));
        for(let i=1;i<row.units.length;i++)assert.equal(bond.get(row.units[i-1]*4+R),row.units[i]*4+L);
        assert.deepEqual(row.eligible,row.units.flatMap((u,j)=>row.states[j]!==I_DOCK&&row.faces[j]<0&&(j===0||j===row.units.length-1)&&!'PQ'.includes(row.seq[j])?[j]:[]));
        linked+=row.units.length;attached+=row.attached;
      }
      const singles=w.stats.docked-attached;assert(singles>=0);assert.equal(10+10*births+w.stats.free+linked+singles,150);
    }
  }
  assert.equal(pos,events.length);assert.equal(births,r.births.length);
  const final=active();assert.deepEqual(r.unfinished.map(p=>sorted(p.units)).sort((a,b)=>a[0]-b[0]),final);
  for(const p of r.unfinished){const h=history(p.units);assert.deepEqual(sorted(p.nuclei),h.nuclei);assert.equal(p.start,h.start);}
}
function load(prefix){
  const m=JSON.parse(fs.readFileSync(prefix+'.manifest.json'));assert(m.complete&&m.completed===m.jobs.length,'Incomplete batch');
  const opts=m.options,jobs=opts.seeds.split(',').map(Number).flatMap(seed=>opts.profiles.split(',').flatMap(profile=>opts.undocks.split(',').map(Number).map(undock=>({seed,profile,undock,steps:opts.steps}))));
  assert.deepEqual(m.jobs,jobs,'Manifest/options mismatch');
  assert.deepEqual(Object.keys(m.sources).sort(),['../src/sim.js','end_protection.js','end_protection_natural.js','patch_completion.js'].sort());
  const expected=new Map(m.jobs.map(j=>[key(j),j])),seen=new Set(),rs=fs.readFileSync(prefix+'.runs.jsonl','utf8').trim().split(/\r?\n/).map(JSON.parse);
  assert.equal(expected.size,m.jobs.length);assert.equal(rs.length,m.jobs.length);
  for(const r of rs){assert(expected.has(key(r))&&!seen.has(key(r)));seen.add(key(r));for(const[k,v]of Object.entries(expected.get(key(r))))assert.equal(r[k],v);validate(r);}
  for(const[file,hash]of Object.entries(m.sources)){const text=fs.readFileSync(path.join(__dirname,file),'utf8'),lf=text.replace(/\r\n/g,'\n');
    assert([text,lf,lf.replace(/\n/g,'\r\n')].some(s=>crypto.createHash('sha256').update(s).digest('hex')===hash),'Source changed: '+file);}
  return rs;
}
function summarize(rs){
  assert.equal(new Set(rs.map(key)).size,rs.length,'Duplicate run');
  const seeds=[...new Set(rs.map(r=>r.seed))],undocks=[...new Set(rs.map(r=>r.undock))];assert(undocks.includes(0.1));
  for(const seed of seeds)for(const profile of ['square','opposed20'])for(const undock of undocks)assert(rs.some(r=>r.seed===seed&&r.profile===profile&&r.undock===undock),'Missing paired arm');
  const clean=p=>Object.fromEntries(Object.entries(p).filter(([k])=>!['seed','bendA','bendB','pUndock'].includes(k)));
  for(const r of rs){assert.deepEqual(clean(r.params),clean(rs[0].params));assert.equal(r.steps,rs[0].steps);}
  const median=xs=>{if(!xs.length)return null;xs.sort((a,b)=>a-b);return (xs[Math.floor((xs.length-1)/2)]+xs[Math.floor(xs.length/2)])/2;};
  return [...rs].sort((a,b)=>a.seed-b.seed||a.profile.localeCompare(b.profile)||a.undock-b.undock).map(r=>({seed:r.seed,profile:r.profile,undock:r.undock,
    exact20:r.births.filter(b=>b.t<=20000).length,exact50:r.exact,nuclei:r.links.filter(e=>e.kind==='nucleation').length,
    merges:r.links.filter(e=>e.kind==='merge').length,extensions:r.links.filter(e=>e.kind==='extension').length,
    multiPatchPercent:100*r.windows.reduce((n,w)=>n+w.multi,0)/(r.steps/100),zeroPatchPercent:100*r.windows.reduce((n,w)=>n+w.zero,0)/(r.steps/100),
    medianCompletedAge:median(r.completed.map(p=>p.t-p.start)),completedNuclei:r.completed.map(p=>p.nuclei.length),
    unfinished:r.unfinished.map(p=>({length:p.units.length,nuclei:p.nuclei.length,age:r.steps-p.start})),free:r.windows.at(-1).stats.free}));
}
if(require.main===module){assert(process.argv.length>2);for(const prefix of process.argv.slice(2))for(const r of summarize(load(prefix)))console.log(JSON.stringify(r));}
module.exports={load,validate,summarize};
