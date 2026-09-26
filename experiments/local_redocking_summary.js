#!/usr/bin/env node
const fs=require('fs'),assert=require('assert/strict');
const {Sim,F,L,R,I_DOCK,I_REPEL,I_TPL,I_HOLD}=require('../src/sim');
const {rows,hash}=require('./placement_release');
const {SEEK,jobs,sourceFiles}=require('./local_redocking');
const exact=x=>x.seq==='PAAAABBBBQ';
function fileHash(file,h){const raw=fs.readFileSync(file,'utf8'),lf=raw.replace(/\r\n/g,'\n');assert([raw,lf,lf.replace(/\n/g,'\r\n')].some(s=>hash(s)===h),'Hash mismatch: '+file);}
function validateRun(r,p,end=50000,every=5000,extraInactive=[]){
  assert(extraInactive.every(st=>st===I_HOLD));const inactive=st=>st===I_REPEL||extraInactive.includes(st);
  const s=Sim.fromState(p.state),start=s.t,bonds=Array.from(s.bond),n=s.n;assert.equal(n,150);
  const ready=row=>row.units.length>1&&row.states.every(inactive)&&row.faces.every(q=>q<0);
  const previous=new Set(rows(s).filter(ready).map(row=>row.units.join(',')));
  const unit=u=>assert(Number.isInteger(u)&&u>=0&&u<n),pending=new Set(Array.from({length:n},(_,u)=>u).filter(u=>s.is[u]===SEEK));let pos=0,last=start;
  const apply=e=>{
    assert(Number.isInteger(e.t)&&e.t>start&&e.t<=end&&e.t>=last);last=e.t;unit(e.u);
    if(['link','unlink'].includes(e.kind)){
      unit(e.v);assert(e.u!==e.v);for(const i of[e.i,e.j])assert([F,L,R].includes(i));
      const a=e.u*4+e.i,b=e.v*4+e.j;
      if(e.kind==='link'){assert.equal(bonds[a],-1);assert.equal(bonds[b],-1);bonds[a]=b;bonds[b]=a;
        if(e.i===F){assert.equal(e.j,F);assert(p.parent.includes(e.u)||p.parent.includes(e.v));}}
      else{assert.equal(e.i,F);assert.equal(e.j,F);assert.equal(bonds[a],b);assert.equal(bonds[b],a);bonds[a]=bonds[b]=-1;}
    }else{
      assert(['endpoint-release','endpoint-redock'].includes(e.kind));assert(r.mode!=='off');
      assert.equal(e.face,bonds[e.u*4+F]);assert(e.face>=0);s.bond.set(bonds);assert.deepEqual(e.units,s.strandOf(e.u));
      if(e.kind==='endpoint-release'){
        assert.equal(Number(bonds[e.u*4+L]>=0)+Number(bonds[e.u*4+R]>=0),1);
        assert.equal(e.state,r.mode==='seek'?SEEK:I_REPEL);assert(!pending.has(e.u));if(r.mode==='seek')pending.add(e.u);
      }else{assert.equal(r.mode,'seek');assert.equal(e.state,I_DOCK);assert(pending.delete(e.u),'Redock without release');}
    }
  };
  const checkpoints=[...r.windows.map(x=>({kind:'window',...x})),...r.settled.map(x=>({kind:'settled',...x}))].sort((a,b)=>a.t-b.t);
  assert(Number.isInteger(every)&&every>0);
  const seen=new Set();assert.equal(r.windows.length,(end-start)/every);
  r.windows.forEach((w,i)=>assert.equal(w.t,start+(i+1)*every));
  for(const c of checkpoints){assert(c.t>start&&c.t<=end);while(pos<r.events.length&&r.events[pos].t<=c.t)apply(r.events[pos++]);s.bond.set(bonds);
    if(c.kind==='settled'){
      assert.deepEqual(c.units,s.strandOf(c.units[0]));assert(c.units.length>=2);assert.equal(c.seq,c.units.map(u=>s._letter(u)).join(''));
      assert(c.units.every(u=>bonds[u*4+F]<0&&!pending.has(u)&&!p.parent.includes(u)));
      const key=c.units.join(',');assert(!seen.has(key));seen.add(key);
    }else{
      const expected=rows(s);assert.deepEqual(c.rows.map(x=>x.units),expected.map(x=>x.units));
      const ids=c.rows.flatMap(x=>x.units);assert.equal(ids.length,n);assert.equal(new Set(ids).size,n);let free=0,docked=0;
      for(const row of c.rows){assert.equal(row.seq,row.units.map(u=>s._letter(u)).join(''));assert.equal(row.states.length,row.units.length);
        assert.deepEqual(row.faces,row.units.map(u=>bonds[u*4+F]));
        row.units.forEach((u,i)=>{const st=row.states[i];assert([I_DOCK,I_REPEL,I_TPL,SEEK,...extraInactive].includes(st));
          assert.equal(st===SEEK,pending.has(u));if(st===I_TPL)assert(p.parent.includes(u));
          if(st===I_DOCK&&row.faces[i]>=0)docked++;if(st===I_DOCK&&row.faces[i]<0&&row.units.length===1)free++;
        });}
      assert.equal(c.stats.free,free);assert.equal(c.stats.docked,docked);
      assert.equal(c.stats.births,p.state.nums.birthCount+r.births.filter(b=>b.t<=c.t).length);
    }
  }
  assert.equal(pos,r.events.length);const final=Sim.fromState(r.final);assert.deepEqual(final.check(),[]);
  assert.deepEqual(Array.from(final.bond),bonds);assert.deepEqual(rows(final),r.windows.at(-1).rows);
  assert.deepEqual(r.final.arrays.type,p.state.arrays.type);assert.deepEqual(r.final.p,p.state.p);assert.equal(final.t,end);
  for(const x of r.settled){assert.deepEqual(final.strandOf(x.units[0]),x.units);assert(x.units.every(u=>inactive(final.is[u])));}
  assert.deepEqual(r.settled.map(x=>x.units.join(',')).sort(),rows(final).filter(ready).map(x=>x.units.join(',')).filter(k=>!previous.has(k)).sort(),'Missing or extra settled assembly');
  assert.equal(r.stockBirths.length,r.births.length);
  r.births.forEach((b,i)=>{const m=r.stockBirths[i];assert.equal(b.t,m.t);assert.equal(b.seq,m.units.map(u=>final._letter(u)).join(''));});
  return r;
}
function episodes(r){
  const p=r.prepared||JSON.parse(fs.readFileSync('experiments/out/PR_selected.json')).prepared;
  const s=Sim.fromState(p.state),pending=new Map(),out=[];
  for(const e of r.events){
    if(e.kind==='endpoint-release'&&r.mode==='seek'){const x={...e,detachedMembers:null,redockAt:null,fromSite:p.parent.indexOf(e.face>>2),toSite:null};out.push(x);pending.set(e.u,x);}
    else if(e.kind==='endpoint-redock'){const x=pending.get(e.u);assert(x);x.redockAt=e.t;x.toSite=p.parent.indexOf(e.face>>2);pending.delete(e.u);}
    else if(e.kind==='link'){s.bond[e.u*4+e.i]=e.v*4+e.j;s.bond[e.v*4+e.j]=e.u*4+e.i;}
    else if(e.kind==='unlink'){
      s.bond[e.u*4+e.i]=s.bond[e.v*4+e.j]=-1;
      for(const x of pending.values())if(!x.detachedMembers){const us=s.strandOf(x.u);if(us.every(u=>s.bond[u*4+F]<0))x.detachedMembers=us;}
    }
  }
  return out;
}
function summarize(r){
  const release=r.events.filter(x=>x.kind==='endpoint-release'),redock=r.events.filter(x=>x.kind==='endpoint-redock');
  const full=r.settled.filter(exact),es=episodes(r),reuse=full.map(b=>({...b,episodes:es.filter(e=>e.redockAt!==null&&e.redockAt<=b.t&&e.detachedMembers&&e.detachedMembers.every(u=>b.units.includes(u)))}));
  return {mode:r.mode,rate:r.rate,exact:full.length,exact20:full.filter(x=>x.t<=20000).length,
    partial:r.settled.filter(x=>!exact(x)).length,releases:release.length,redocks:redock.length,reused:reuse.filter(x=>x.episodes.length),
    stockExact:r.births.filter(exact).length,stockTotal:r.births.length,seeking:r.windows.at(-1).rows.flatMap(x=>x.states).filter(s=>s===SEEK).length};
}
function validate(r){
  assert.equal(r.input,'experiments/out/PR_selected.json');fileHash(r.input,r.inputHash);
  assert.deepEqual(Object.keys(r.sources).sort(),[...sourceFiles].sort());for(const[f,h]of Object.entries(r.sources))fileHash(f,h);
  assert.deepEqual(r.jobs,jobs);assert.deepEqual(r.results.map(x=>({mode:x.mode,rate:x.rate})),jobs);assert(r.neutral&&r.cpuSeconds>0);assert.equal(r.executedSteps,210000);
  const input=JSON.parse(fs.readFileSync(r.input));for(const b of r.results)validateRun(b,input.prepared);
  assert.equal(hash(r.results[0].final),input.results[0].finalStateHash);assert.deepEqual(r.results[0].settled,[]);return r;
}
function qualified(rs){const summaries=rs.map(summarize),off=summaries.find(x=>x.mode==='off');
  return summaries.filter(x=>x.mode==='seek'&&x.reused.length&&x.exact>=off.exact&&x.exact>=summaries.find(y=>y.mode==='drop'&&y.rate===x.rate).exact).map(x=>x.rate).sort((a,b)=>a-b);
}
function writeCSV(file,rs){assert(file.endsWith('.csv'));const keys=['seed','profile','mode','rate','exact20','exact','partial','releases','redocks','reused','stockExact','stockTotal','seeking'];
  fs.writeFileSync(file,keys.join(',')+'\n'+rs.map(r=>keys.map(k=>k==='reused'?r.reused.length:r[k]).join(',')).join('\n')+'\n');
}
if(require.main===module){const r=validate(JSON.parse(fs.readFileSync(process.argv[2]))),rs=r.results.map(x=>({seed:83,profile:'opposed20',...summarize(x)}));for(const b of rs)console.log(JSON.stringify(b));console.log(JSON.stringify({qualified:qualified(r.results),cpuSeconds:r.cpuSeconds}));if(process.argv[3])writeCSV(process.argv[3],rs);}
module.exports={validateRun,validate,summarize,qualified,fileHash,episodes,writeCSV};
