#!/usr/bin/env node
// Offline only: identities, opportunities and randomized references never enter Sim rules.
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {Sim,K,T_U,I_REPEL}=require('../src/sim.js');
const {load,validate,key}=require('./short_variant_garden_summary.js');
const {hash}=require('./sequence_shape.js');
const root=path.join(__dirname,'..'),inputStem='experiments/out/SVG_screen_20260927';
const ownSources=['experiments/fuel_support_plan.md','experiments/fuel_support.js','experiments/fuel_support_test.js'];
const bin=t=>Math.min(9,Math.floor(t/10000));
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function reconstruct(r){
  const initial=Sim.fromState(r.initialState),b=Array.from(initial.bond),types=Array.from(initial.type);
  const live=new Map(),states=new Map(),ever=new Set(),life=r.rows.map(()=>({born:null,lost:null}));
  const epochs=new Map(),active=new Map(),opportunities=[],receipts=[];
  const coverage={fuelEvents:0,actorUntracked:0,actorNeverRegistered:0,unknownHelpers:0,sameRowOnly:0,
    included:0,partlyKnownCross:0};
  const fuels=types.flatMap((t,u)=>t===T_U?[u]:[]);
  const held=fuel=>[0,1,2,3].map(side=>b[fuel*4+side]).filter(q=>q>=0).map(q=>q>>2);
  const attached=units=>new Set(units.map(u=>b[u*4+K]).filter(q=>q>=0&&types[q>>2]===T_U).map(q=>q>>2));
  function refresh(fuel,index,t){
    const units=held(fuel),owners=units.map(u=>live.get(u)),desired=new Map();
    if(units.length>=2&&owners.every(id=>id!==undefined))for(let i=0;i<units.length;i++){
      const u=units[i],actor=owners[i],helpers=[...new Set(owners.filter(id=>id!==actor))].sort((a,b)=>a-b);
      if(states.get(u)!==I_REPEL||!helpers.length)continue;
      const episode=`${fuel}:${epochs.get(fuel)??0}`,signature=JSON.stringify([actor,episode,helpers]);
      desired.set(`${fuel}/${u}`,{actor,unit:u,fuel,episode,helpers,signature});
    }
    for(const [k,o]of active)if(o.fuel===fuel&&!equal(o.signature,desired.get(k)?.signature)){
      o.endIndex=index;o.end=t;active.delete(k);
    }
    for(const [k,d]of desired)if(!active.has(k)){
      const o={id:opportunities.length,...d,startIndex:index,start:t,endIndex:null,end:null};
      opportunities.push(o);active.set(k,o);
    }
  }
  for(const [index,e]of r.events.entries()){
    const dirty=new Set();
    if(e.kind==='bond+'||e.kind==='bond-'){
      const a=e.u*4+e.side,z=e.kind==='bond+'?e.v*4+e.vs:e.q;
      if(e.kind==='bond+'){assert.equal(b[a],-1);assert.equal(b[z],-1);b[a]=z;b[z]=a;}
      else{assert.equal(b[a],z);assert.equal(b[z],a);b[a]=-1;b[z]=-1;}
      for(const u of [a>>2,z>>2])if(types[u]===T_U){dirty.add(u);epochs.set(u,(epochs.get(u)??0)+1);}
    }
    if(e.kind==='row'){
      life[e.id].born=index;
      e.units.forEach((u,i)=>{assert(!live.has(u));live.set(u,e.id);states.set(u,e.states[i]);ever.add(u);});
      for(const u of attached(e.units))dirty.add(u);
    }
    if(e.kind==='retire'){
      life[e.id].lost=index;
      for(const u of attached(r.rows[e.id].units))dirty.add(u);
      r.rows[e.id].units.forEach(u=>{assert.equal(live.get(u),e.id);live.delete(u);});
    }
    if(e.kind==='rearm'){
      coverage.fuelEvents++;
      const actor=live.get(e.u),units=held(e.fuel),owners=units.map(u=>live.get(u));
      assert.deepEqual(units,e.holders.map(h=>h.unit));
      if(actor===undefined){coverage.actorUntracked++;if(!ever.has(e.u))coverage.actorNeverRegistered++;}
      else{
        const helpers=[...new Set(owners.filter(id=>id!==undefined&&id!==actor))].sort((a,b)=>a-b);
        if(owners.includes(undefined)){coverage.unknownHelpers++;if(helpers.length)coverage.partlyKnownCross++;}
        else if(!helpers.length)coverage.sameRowOnly++;
        else{
          assert.equal(states.get(e.u),I_REPEL,'Tracked recipient not ready before arming');
          const o=active.get(`${e.fuel}/${e.u}`);assert(o&&o.actor===actor&&equal(o.helpers,helpers),'Missing actual opportunity');
          receipts.push({id:receipts.length,event:index,t:e.t,actor,unit:e.u,fuel:e.fuel,
            helpers,episode:o.episode,opportunity:o.id});coverage.included++;
        }
      }
      states.set(e.u,e.actorState);dirty.add(e.fuel);
    }
    for(const fuel of dirty)refresh(fuel,index,e.t);
  }
  for(const o of active.values()){o.endIndex=r.events.length;o.end=r.steps;}
  opportunities.forEach(o=>{assert(o.end!==null&&o.endIndex>=o.startIndex);delete o.signature;});
  assert.equal(coverage.fuelEvents,r.finalState.nums.fuelUsed);
  assert.equal(coverage.fuelEvents,coverage.actorUntracked+coverage.unknownHelpers+coverage.sameRowOnly+coverage.included);
  assert(life.every(l=>l.born!==null));
  return {coverage,life,opportunities,receipts};
}
function poolsFor(data){
  const grouped=new Map();
  for(const o of data.opportunities){
    const k=`${o.actor}/${o.unit}/${o.helpers.length}`;
    if(!grouped.has(k))grouped.set(k,[]);grouped.get(k).push(o);
  }
  return data.receipts.map(e=>{
    const lo=bin(e.t)*10000,hi=bin(e.t)===9?100000:lo+9999;
    const candidates=[];
    for(const o of grouped.get(`${e.actor}/${e.unit}/${e.helpers.length}`)??[]){
      if(o.startIndex>e.event||o.helpers.some(id=>data.life[id].born>=e.event||
        (data.life[id].lost!==null&&data.life[id].lost<=e.event)))continue;
      const start=Math.max(o.start,lo),end=Math.min(o.end,hi,e.t);
      if(end>=start)candidates.push({id:o.id,weight:end-start+1});
    }
    assert(candidates.some(c=>c.id===e.opportunity),'Actual helper absent from own opportunity pool');
    const helperSets=new Set(candidates.map(c=>data.opportunities[c.id].helpers.join('/'))).size;
    return {receipt:e.id,helperSets,candidates};
  });
}
function graph(receipts,rows,life,renewalEdges){
  const pairs=new Map(),byActor=new Map();
  for(const e of receipts){
    if(!byActor.has(e.actor))byActor.set(e.actor,[]);byActor.get(e.actor).push(e);
    for(const helper of e.helpers){
      assert(helper!==e.actor);const a=Math.min(helper,e.actor),b=Math.max(helper,e.actor),k=`${a}/${b}`;
      if(!pairs.has(k))pairs.set(k,{a,b,directions:[[],[]]});
      pairs.get(k).directions[helper===a?0:1].push(e);
    }
  }
  const renewsAfter=(id,index)=>renewalEdges.some(e=>e.parent===id&&life[e.child].born>index);
  const out=[...pairs.values()].map(p=>{
    const directions=p.directions.map(es=>({events:es.length,episodes:[...new Set(es.map(e=>e.episode))].sort(),
      first:es.length?Math.min(...es.map(e=>e.event)):null,last:es.length?Math.max(...es.map(e=>e.event)):null}));
    const es=p.directions.flat(),first=Math.min(...es.map(e=>e.t)),last=Math.max(...es.map(e=>e.t));
    const reciprocal=directions.every(d=>d.events>0),repeated=directions.some(d=>d.episodes.length>=2),
      repeatedReciprocal=directions.every(d=>d.episodes.length>=2);
    const renewal=[directions[1].first===null?false:renewsAfter(p.a,directions[1].first),
      directions[0].first===null?false:renewsAfter(p.b,directions[0].first)];
    return {a:p.a,b:p.b,directions,first,last,span:last-first,reciprocal,repeated,repeatedReciprocal,renewal,
      primary:repeatedReciprocal&&rows[p.a].born>0&&rows[p.b].born>0&&renewal.every(Boolean),
      horizonCensored:rows[p.a].lost===null&&rows[p.b].lost===null};
  }).sort((x,y)=>x.a-y.a||x.b-y.b);
  let switches=0,successions=0;
  const actors=[...byActor].map(([actor,es])=>{
    es.sort((a,b)=>a.event-b.event);
    for(let i=1;i<es.length;i++){successions++;if(!equal(es[i-1].helpers,es[i].helpers))switches++;}
    return {actor,events:es.length,partners:[...new Set(es.flatMap(e=>e.helpers))].sort((a,b)=>a-b)};
  });
  return {counts:{events:receipts.length,edges:receipts.reduce((n,e)=>n+e.helpers.length,0),pairs:out.length,
    repeated:out.filter(p=>p.repeated).length,reciprocal:out.filter(p=>p.reciprocal).length,
    repeatedReciprocal:out.filter(p=>p.repeatedReciprocal).length,primary:out.filter(p=>p.primary).length,
    actors:actors.length,switches,successions},pairs:out,actors};
}
function random(seed){let x=seed>>>0;assert(x);return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function references(data,rows,renewalEdges,seed){
  const pools=poolsFor(data),rng=random(seed),draws=[],counts=[];
  for(let rep=0;rep<199;rep++){
    const ids=pools.map(p=>{
      const total=p.candidates.reduce((n,c)=>n+c.weight,0);let x=rng()*total;
      for(const c of p.candidates){x-=c.weight;if(x<0)return c.id;}return p.candidates.at(-1).id;
    });
    const es=data.receipts.map((e,i)=>({...e,helpers:data.opportunities[ids[i]].helpers,episode:data.opportunities[ids[i]].episode}));
    draws.push(ids);counts.push(graph(es,rows,data.life,renewalEdges).counts);
  }
  const observed=graph(data.receipts,rows,data.life,renewalEdges).counts;
  const stats={};
  for(const metric of ['repeated','reciprocal','repeatedReciprocal','primary']){
    const xs=counts.map(c=>c[metric]).sort((a,b)=>a-b);
    stats[metric]={median:xs[Math.ceil(.5*xs.length)-1],q95:xs[Math.ceil(.95*xs.length)-1],
      upperFraction:xs.filter(n=>n>=observed[metric]).length/xs.length};
  }
  return {seed,pools,draws,counts,stats,alternativeEvents:pools.filter(p=>p.helperSets>1).length,
    alternativeFraction:pools.length?pools.filter(p=>p.helperSets>1).length/pools.length:0};
}
function analyzeWorld(r,v){
  assert(r.rows.every(p=>p.seq.length<=5),'Unexpected length beyond census scope');
  const data=reconstruct(r),renewalEdges=v.variants.edges;
  const observed=graph(data.receipts,r.rows,data.life,renewalEdges);
  const armIndex=(r.sequence==='AABAB'?4:0)+(r.profile==='opposed20'?2:0)+(r.grip?1:0);
  const reference=references(data,r.rows,renewalEdges,730000+100*r.seed+armIndex);
  const pass=observed.counts.primary>=1&&observed.counts.primary>reference.stats.primary.q95&&reference.alternativeFraction>=.2;
  if(!r.grip){assert.equal(data.coverage.fuelEvents,0);assert.equal(observed.counts.edges,0);}
  return {seed:r.seed,sequence:r.sequence,profile:r.profile,grip:r.grip,...data,renewalEdges,observed,reference,pass};
}
function decision(worlds){
  const candidates=[];
  for(const sequence of ['ABABA','AABAB'])for(const profile of ['square','opposed20'])
    if([303,304].every(seed=>worlds.find(w=>w.seed===seed&&w.sequence===sequence&&w.profile===profile&&w.grip).pass))
      candidates.push({sequence,profile});
  return {pass:candidates.length>0,candidates};
}
function analyze(){
  const {m,rs}=load(path.join(root,inputStem)),validated=validate(m,rs);
  assert.equal(rs.length,16);assert(rs.every(r=>[303,304].includes(r.seed)&&r.steps===100000));
  const worlds=rs.map((r,i)=>analyzeWorld(r,validated[i]));return {worlds,decision:decision(worlds)};
}
const hashes=files=>Object.fromEntries(files.map(f=>[f,hash(fs.readFileSync(path.join(root,f)))]));
function verify(file){
  const saved=JSON.parse(fs.readFileSync(file,'utf8'));
  assert.deepEqual(saved.inputs,hashes([inputStem+'.manifest.json',inputStem+'.runs.jsonl']));
  assert.deepEqual(Object.keys(saved.sources).sort(),[...ownSources].sort());
  for(const [f,h]of Object.entries(saved.sources)){
    const raw=fs.readFileSync(path.join(root,f)),lf=raw.toString().replace(/\r\n/g,'\n');
    assert([hash(raw),hash(lf),hash(lf.replace(/\n/g,'\r\n'))].includes(h),'Source changed: '+f);
  }
  assert.deepEqual(saved.result,analyze());return saved;
}
if(require.main===module){
  if(process.argv[2]==='--verify'){verify(process.argv[3]);console.log('Fuel-support archive hashes and recomputation pass.');}
  else{
    assert(process.argv[2],'Use a fresh output stem');const out=path.resolve(process.argv[2]+'.json');assert(!fs.existsSync(out));
    const start=process.cpuUsage(),result=analyze(),used=process.cpuUsage(start),cpuSeconds=(used.user+used.system)/1e6;
    assert(cpuSeconds<=120,'Offline CPU budget exceeded; no candidate disposition');
    const report={kind:'fuel-support-retrospective-audit',created:new Date().toISOString(),
      command:['node','experiments/fuel_support.js',...process.argv.slice(2)].join(' '),cpuSeconds,simulationSteps:0,
      inputs:hashes([inputStem+'.manifest.json',inputStem+'.runs.jsonl']),sources:hashes(ownSources),result};
    fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
    console.table(result.worlds.map(w=>({seed:w.seed,sequence:w.sequence,profile:w.profile,grip:w.grip,
      covered:w.coverage.included,...w.observed.counts,alternative:w.reference.alternativeFraction,q95:w.reference.stats.primary.q95,pass:w.pass})));
    console.log(JSON.stringify({decision:result.decision,cpuSeconds,out}));
  }
}
module.exports={reconstruct,poolsFor,graph,references,analyzeWorld,decision,analyze,verify,random};
