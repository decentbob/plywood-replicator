#!/usr/bin/env node
const fs=require('fs'),crypto=require('crypto'),assert=require('assert/strict');
const {Sim,F,K,L,R,LETTERS,isProd}=require('../src/sim.js');
const {assertFixtures,run,setup,compare}=require('./delivery_diagnostic_test.js');
const {observe}=require('./delivery_diagnostic.js');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const key=(a,b)=>[a,b].sort((x,y)=>x-y).join('/');
function checkRecord(r){
  const initial=Sim.fromState(r.initialState),final=Sim.fromState(r.finalState),b=Array.from(initial.bond);
  const d=r.observer,owner=new Map(),liveLinks=new Map(),seenRows=new Set(),releases=new Map();
  for(const [index,e]of d.events.entries()){
    assert.equal(e.id,index);assert(e.t<=final.t);if(index)assert(e.t>=d.events[index-1].t);
    if(e.kind==='release'){
      assert.equal(b[e.u*4+F]>>2,e.unit);assert.equal(e.parent,owner.get(e.unit)??null);releases.set(e.u,e);
    }
    if(e.kind==='retire'){
      const p=d.rows[e.row];assert.equal(p.lost,index);assert(seenRows.has(p.id));
      p.units.forEach(u=>{assert.equal(owner.get(u),p.id);owner.delete(u);});
    }
    if(e.kind==='row'){
      const p=d.rows[e.row];assert(!seenRows.has(p.id));seenRows.add(p.id);assert.equal(p.born,index);
      assert.deepEqual(p.origins,p.units.map(u=>releases.get(u)??null));
      const ids=new Set(p.origins.map(x=>x?.parent??null));let parent=null;
      if(!p.initial&&ids.size===1&&!ids.has(null)){
        const par=d.rows[[...ids][0]];
        if(par.units.length===p.units.length&&p.origins.every((v,i)=>v.unit===par.units.at(-1-i))&&
          par.units.every(u=>owner.get(u)===par.id)&&p.units.every(u=>!par.units.includes(u)))parent=par.id;
      }
      assert.equal(p.parent,parent);
      assert.equal(p.detached,p.units.every(u=>b[u*4+F]<0));
      assert.equal(p.exact,parent!==null&&p.detached&&p.seq===[...d.rows[parent].seq].reverse().join(''));
      assert.equal(p.seq,p.units.map(u=>initial._letter(u)).join(''));
      const witnesses=p.units.slice(0,-1).map((u,i)=>{
        const a=u*4+R,z=p.units[i+1]*4+L;assert.equal(b[a],z);return liveLinks.get(key(a,z))??null;
      });
      assert.deepEqual(p.witnesses,witnesses);
      p.units.forEach(u=>{assert(!owner.has(u));owner.set(u,p.id);});
    }
    if(e.kind==='binding'){
      assert.equal(e.row,owner.get(e.unit)??null);assert(isProd(initial.type[e.product]));
      if(e.end!==null){const close=d.events[e.end];assert(close.kind==='bond-');
        assert.equal(key(close.u*4+close.i,close.v*4+close.j),key(e.unit*4+K,e.product*4+F));}
    }
    if(e.kind==='bond+'||e.kind==='bond-'){
      const a=e.u*4+e.i,z=e.v*4+e.j,k=key(a,z);
      if(e.kind==='bond+'){
        assert.equal(b[a],-1);assert.equal(b[z],-1);
        for(const h of e.supports){
          assert.equal(h.row,owner.get(h.template)??null);
          assert([e.u,e.v].some(u=>b[u*4+F]===h.template*4+F));
          if(h.known){
            assert.equal(b[h.template*4+K],h.product*4+F);
            const arm=d.events[h.binding];assert(arm&&arm.kind==='binding'&&arm.id<index);
            assert.equal(arm.unit,h.template);assert.equal(arm.product,h.product);
            assert(arm.end===null||arm.end>index);
          }else assert.equal(h.binding,null);
        }
        b[a]=z;b[z]=a;
        if(LETTERS.includes(initial.type[e.u])&&LETTERS.includes(initial.type[e.v])&&
          [L,R].includes(e.i)&&[L,R].includes(e.j))liveLinks.set(k,index);
      }else{assert.equal(b[a],z);assert.equal(b[z],a);b[a]=-1;b[z]=-1;liveLinks.delete(k);}
    }
  }
  assert.deepEqual(b,Array.from(final.bond));assert.equal(seenRows.size,d.rows.length);
  const events=k=>d.events.filter(e=>e.kind===k),supported=e=>e.sticky&&e.supports.some(h=>h.known);
  const children=d.rows.filter(p=>!p.initial),counts={opportunities:events('opportunity').length,
    geometric:events('opportunity').filter(e=>e.geometry).length,bindings:events('binding').length,
    formationFailures:events('attempt').filter(e=>!e.success).length,
    supportedLinks:events('bond+').filter(supported).length,
    unknownSupportLinks:events('bond+').filter(e=>e.sticky&&e.supports.some(h=>!h.known)).length,
    detached:children.filter(p=>p.detached).length,exact:children.filter(p=>p.exact).length,
    supportedExact:children.filter(p=>p.exact&&p.witnesses.some(id=>id!==null&&supported(d.events[id])&&
      d.events[id].supports.some(h=>h.known&&h.row===p.parent))).length};
  assert.deepEqual(r.counts,counts);
}
function verify(file,replay=false){
  const report=JSON.parse(fs.readFileSync(file,'utf8'));
  for(const [file,h]of Object.entries(report.sources)){
    const raw=fs.readFileSync(file),lf=raw.toString().replace(/\r\n/g,'\n');
    assert([hash(raw),hash(lf),hash(lf.replace(/\n/g,'\r\n'))].includes(h),'Source '+file);
  }
  assertFixtures(report.result.fixtures);[...report.result.fixtures,...report.result.neutral].forEach(checkRecord);
  const fixture=report.result.fixtures.find(f=>f.name==='supported');
  const corruptions=[r=>r.counts.supportedExact++,r=>r.observer.rows.at(-1).parent=null,
    r=>r.observer.rows.at(-1).witnesses[0]=null,
    r=>r.observer.events.find(e=>e.kind==='binding').end=0,
    r=>r.observer.events.find(e=>e.kind==='bond+'&&e.supports.length).supports[0].product=-1,
    r=>r.observer.events.find(e=>e.kind==='bond-').v=-1];
  corruptions.forEach(mutate=>{const r=structuredClone(fixture);mutate(r);assert.throws(()=>checkRecord(r));});
  // Small spontaneous worlds may never deliver a mature product. Exercise every
  // positive/negative prepared pathway against the same actions without observation.
  const refresh=s=>{s._deriveAll();s._deriveAll();s._computeOpen();s._buildHash();};
  const act=(f,name)=>{
    const {s,t,p,c}=f;s.t=1;s.pairs=name==='bare'?[]:[t[0],p[0]];s._formBonds();
    if(['supported','bare','retired','severed','stale'].includes(name)){
      refresh(s);if(name==='stale')s._unlink(t[0],K);
      s.t=2;s.pairs=[c[1],c[0]];s._formBonds();
      if(name==='retired')s._unlink(t[0],R);
      if(name==='severed'){s._unlink(c[1],R);s._unlink(t[0],K);refresh(s);s.t=3;s.pairs=[c[1],c[0]];s._formBonds();}
      s._chemistry();
    }
  };
  for(const f of report.result.fixtures){
    const a=setup(f.name),b=setup(f.name),o=observe(a.s);act(a,f.name);act(b,f.name);compare(a.s,b.s);
    assert.deepEqual(a.s.saveState(),f.finalState);assert.deepEqual(o.snapshot(),f.observer);
  }
  const f=setup('supported'),o=observe(f.s);f.s.t=1;f.s.pairs=[f.t[0],f.p[0]];f.s._formBonds();
  const restored=Sim.fromState(f.s.saveState()),ro=observe(restored,o.snapshot());
  for(const s of [f.s,restored]){refresh(s);s.t=2;s.pairs=[f.c[1],f.c[0]];s._formBonds();s._chemistry();}
  assert.deepEqual(o.snapshot(),ro.snapshot());
  const a=f.s.saveState(),b=restored.saveState();delete a.nums.pinsVersion;delete b.nums.pinsVersion;assert.deepEqual(a,b);
  if(replay){const actual=run(),expected=structuredClone(report.result);delete actual.cpuSeconds;delete expected.cpuSeconds;
    assert.deepEqual(actual,expected);}
  console.log(`PASS: source hashes, 20 physical event tapes, independent ancestry/bond witnesses, six corruptions, 12 positive/negative neutral fixtures and active-binding restart${replay?', complete deterministic rerun':''}.`);
}
if(require.main===module)verify(process.argv[2],process.argv.includes('--replay'));
module.exports={checkRecord,verify};
