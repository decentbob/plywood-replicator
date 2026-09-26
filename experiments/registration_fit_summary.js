#!/usr/bin/env node
const fs=require('fs'),assert=require('assert/strict');
const {Sim,F}=require('../src/sim');
const {cases,arms,sources,start,deformation}=require('./registration_fit');
const {validateRun,fileHash,episodes}=require('./local_redocking_summary');
function history(ref){return ref.results.filter(r=>r.mode==='seek').map(r=>{
  const es=episodes(r);return {seed:r.seed,profile:r.profile,episodes:es.map(e=>({u:e.u,t:e.t,wait:e.redockAt===null?null:e.redockAt-e.t,
    from:e.fromSite,to:e.toSite,fullyDetached:!!e.detachedMembers,settled:r.settled.filter(x=>e.redockAt&&x.t>=e.redockAt&&e.units.every(u=>x.units.includes(u))).map(x=>({t:x.t,seq:x.seq}))}))};
});}
function validate(r){
  assert.equal(r.input,'experiments/out/RD_screen.json');fileHash(r.input,r.inputHash);assert(r.neutral&&r.cpuSeconds>0);assert.equal(r.executedSteps,93500);
  assert.deepEqual(r.arms,arms);assert.equal(r.prepared.length,2);assert.equal(r.results.length,8);
  assert.deepEqual(Object.keys(r.sources).sort(),[...sources].sort());for(const[f,h]of Object.entries(r.sources))fileHash(f,h);
  const ref=JSON.parse(fs.readFileSync(r.input));
  for(let i=0;i<cases.length;i++){
    const p=r.prepared[i];for(const[k,v]of Object.entries(cases[i]))assert.equal(p[k],v);
    const s=Sim.fromState(p.state);assert.equal(s.t,p.at);assert.equal(s.n,150);assert.deepEqual(s.check(),[]);
    assert.deepEqual(p.target,s.strandOf(p.u));assert(p.target.every(u=>s.bond[u*4+F]<0));
    const reference=ref.results.find(x=>x.seed===87&&x.profile===p.profile&&x.mode==='seek');assert.deepEqual(p.state.p,reference.prepared.state.p);assert.deepEqual(p.parent,reference.prepared.parent);
    assert.deepEqual(p.referenceEvents,reference.events.filter(e=>e.t>p.at&&e.t<=p.at+5000));assert.equal(p.cacheDelta,p.state.nums.bondsDirty?0:1);
    for(let j=0;j<arms.length;j++){
      const b=r.results[i*4+j],a=arms[j];assert.equal(b.profile,p.profile);assert.equal(b.iters,a.iters);assert.equal(b.stiff,a.stiff);
      assert.deepEqual(b.initial,start(p,a).saveState());validateRun({...b,mode:'seek'},{state:b.initial,parent:p.parent},p.at+5000,1000);
      assert.deepEqual(b.shape.map(x=>x.t),[0,1,10,100,1000,2000,3000,4000,5000].map(dt=>p.at+dt));
      for(const x of b.shape){assert.deepEqual(x.perUnit.map(y=>y.u),p.target);assert(x.perUnit.every(y=>Number.isFinite(y.rms)&&y.rms>=0));
        assert(Math.abs(x.rms-Math.sqrt(x.perUnit.reduce((a,y)=>a+y.rms*y.rms,0)/p.target.length))<1e-12);}
      assert.deepEqual(b.shape[0],{t:p.at,...deformation(s,p.target)});assert.deepEqual(b.shape.at(-1),{t:p.at+5000,...deformation(Sim.fromState(b.final),p.target)});
      for(const e of [...b.checks,...b.placements]){assert(Number.isInteger(e.t)&&e.t>p.at&&e.t<=p.at+5000);assert(Number.isInteger(e.partner)&&e.partner>=0&&e.partner<150);assert.equal(e.site,p.parent.indexOf(e.partner));}
      assert(b.checks.every(e=>['gap','bearing','angle','pass'].includes(e.gate)));assert(b.placements.every(e=>typeof e.accepted==='boolean'));
      assert.deepEqual(b.placements.map(e=>[e.t,e.partner]),b.checks.filter(e=>e.gate==='pass').map(e=>[e.t,e.partner]));
      assert.deepEqual(b.placements.filter(e=>e.accepted).map(e=>[e.t,e.partner]),b.events.filter(e=>e.kind==='link'&&e.i===F&&e.j===F&&(e.u===p.u||e.v===p.u)).map(e=>[e.t,e.u===p.u?e.v:e.u]));
      if(j===0){assert.deepEqual(b.events,p.referenceEvents);const normalized=structuredClone(b.final);normalized.nums.pinsVersion-=p.cacheDelta;assert.deepEqual(normalized,p.continuousState);}
    }
  }return r;
}
function summary(r){const rows=r.results.map(b=>{
  const p=r.prepared.find(x=>x.profile===b.profile),returns=b.events.filter(e=>e.kind==='endpoint-redock'&&e.u===p.u),target=b.settled.filter(x=>p.target.every(u=>x.units.includes(u)));
  const final=b.windows.at(-1).rows.find(x=>p.target.every(u=>x.units.includes(u)));
  return {profile:b.profile,stiff:b.stiff,iters:b.iters,firstReturn:returns.length?{t:returns[0].t,wait:returns[0].t-p.at,site:p.parent.indexOf(returns[0].face>>2)}:null,
    target:target.map(x=>({t:x.t,seq:x.seq})),targetExact:target.some(x=>x.seq==='PAAAABBBBQ'),
    exact:b.settled.filter(x=>x.seq==='PAAAABBBBQ').length,nonExact:b.settled.filter(x=>x.seq!=='PAAAABBBBQ').length,
    finalSeq:final.seq,finalFaces:final.faces.filter(q=>q>=0).length,checks:b.checks.length,placements:b.placements.length,
    rms100:b.shape.find(x=>x.t===p.at+100).rms,rmsFinal:b.shape.at(-1).rms};
  });const qualifies=cases.every(c=>[4,8].every(iters=>{const lo=rows.find(x=>x.profile===c.profile&&x.iters===iters&&x.stiff===0.5),hi=rows.find(x=>x.profile===c.profile&&x.iters===iters&&x.stiff===0.8);return hi.targetExact&&!lo.targetExact&&!hi.nonExact;}));return {rows,qualifies};
}
if(require.main===module){const r=validate(JSON.parse(fs.readFileSync(process.argv[2]))),s=summary(r);for(const x of s.rows)console.log(JSON.stringify(x));console.log(JSON.stringify({qualifies:s.qualifies,cpuSeconds:r.cpuSeconds,history:history(JSON.parse(fs.readFileSync(r.input)))}));
  if(process.argv[3]){assert(process.argv[3].endsWith('.csv'));const keys=['profile','stiff','iters','targetExact','exact','nonExact','finalSeq','finalFaces','checks','placements','rms100','rmsFinal'];fs.writeFileSync(process.argv[3],keys.join(',')+'\n'+s.rows.map(x=>keys.map(k=>x[k]).join(',')).join('\n')+'\n');}}
module.exports={history,validate,summary};
