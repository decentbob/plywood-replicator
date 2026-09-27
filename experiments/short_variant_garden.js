#!/usr/bin/env node
// Research observation and prepared initial conditions; unchanged Sim dynamics.
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {Worker,isMainThread,parentPort,workerData}=require('worker_threads');
const {Sim,F,K,T_A,T_B,T_U,I_TPL,S}=require('../src/sim.js');
const {base,observe:observeRows,hash,digest,complement}=require('./sequence_shape.js');
const {census,family}=require('./short_variant_summary.js');
const sequences=['ABABA','AABAB'];
const sources=['src/sim.js','experiments/sequence_shape.js','experiments/short_variant_summary.js',
  'experiments/short_variant_garden.js','experiments/short_variant_garden_summary.js',
  'experiments/short_variant_garden_plan.md','experiments/short_variant_garden_test.js'];
function setup(job){
  assert(sequences.includes(job.sequence)&&['square','opposed20'].includes(job.profile));
  const bend=job.profile==='square'?0:20;
  const s=new Sim({...base,seed:job.seed,pGrip:job.grip?0.2:0,bendA:-bend,bendB:bend});
  const founders=[];
  for(let i=0;i<4;i++){
    const row=s.seedStrand(9,(i+0.5)*4.5,0,5,i%2?complement(job.sequence):job.sequence);
    assert(row);founders.push(row);
  }
  s._deriveAll();s._computeOpen();s._buildHash();assert.deepEqual(s.check(),[]);
  assert.equal(founders.flat().filter(u=>s.type[u]===T_A).length,10);
  assert.equal(founders.flat().filter(u=>s.type[u]===T_B).length,10);
  return {s,founders};
}
function observe(s,founders){
  const o=observeRows(s,founders);
  const annotate=e=>{
    e.states=e.units.map(u=>s.is[u]);e.faces=e.units.map(u=>s.bond[u*4+F]);
  };
  o.events.forEach(annotate);
  const event=s._event,link=s._link,unlink=s._unlink;
  s._event=function(kind,u,v){
    let holders=null;
    if(kind==='rearm'){
      const q=this.bond[u*4+K],fuel=q>>2;
      assert(q>=0&&this.type[fuel]===T_U&&this.ss[q]===S.GIVE);
      holders=[];
      for(let side=0;side<4;side++){
        const p=this.bond[fuel*4+side];
        if(p>=0)holders.push({fuelSide:side,unit:p>>2,side:p&3});
      }
      assert(holders.length>=2&&holders.some(h=>h.unit===u&&h.side===K));
    }
    const result=event.call(this,kind,u,v);
    if(kind==='birth')annotate(o.events.at(-1));
    if(kind==='rearm'){
      const e=o.events.at(-1);assert(e.kind==='rearm');e.holders=holders;e.actorState=this.is[u];
    }
    return result;
  };
  s._link=function(u,side,v,vs){
    const result=link.call(this,u,side,v,vs);
    o.events.push({kind:'bond+',t:this.t,u,side,v,vs});return result;
  };
  s._unlink=function(u,side){
    const q=this.bond[u*4+side],result=unlink.call(this,u,side);
    if(q>=0)o.events.push({kind:'bond-',t:this.t,u,side,q});return result;
  };
  return o;
}
function metrics(r){
  const c=census(r),q=family(r.sequence),exact=r.rows.filter(p=>p.born&&p.depth!==null&&p.detached);
  const es=c.edges.filter(e=>r.rows[e.parent].depth!==null&&e.family===q);
  const productive=[...new Set(es.map(e=>e.parent))];
  return {births:r.births.length,detached:r.rows.filter(p=>p.born&&p.detached).length,
    founderChildren:exact.filter(p=>p.depth===1).length,exact:exact.length,
    primary:productive.length,earlyPrimary:productive.filter(id=>r.rows[id].born<=50000).length,
    secondCycle:exact.filter(p=>p.depth>=2).length,full:exact.filter(p=>p.fullAt!==null).length,
    maxDepth:Math.max(0,...exact.map(p=>p.depth)),intactExact:exact.filter(p=>p.lost===null).length,
    intactFounders:r.rows.filter(p=>!p.born&&p.lost===null).length,
    persistent5k:exact.filter(p=>p.born+5000<=r.steps&&(p.lost===null||p.lost>=p.born+5000)).length,
    censored5k:exact.filter(p=>p.lost===null&&p.born+5000>r.steps).length,
    shorter:r.rows.filter(p=>p.born&&p.seq.length<5).length,
    other:r.rows.filter(p=>p.born&&(p.seq.length>5||(p.seq.length===5&&family(p.seq)!==q))).length,
    allVariantPrimary:c.totals.primary,allVariantChains:c.totals.chains,
    unfinished:r.samples.at(-1).material.unfinishedLinked,fuel:r.finalState.nums.fuelUsed,
    meanBend:r.samples.reduce((n,w)=>n+w.bends,0)/(r.samples.reduce((n,w)=>n+w.joints,0)||1)};
}
function run(job,progress=()=>{}){
  const {s,founders}=setup(job),initialState=s.saveState(),o=observe(s,founders),samples=[],checkpoints=[];
  const halfway=Math.floor(job.steps/200)*100;
  for(let t=0;t<job.steps;t+=100){
    s.run(100);samples.push(o.sample());
    if(s.t===halfway)checkpoints.push({state:s.saveState(),eventCount:o.events.length});
    if(s.t===halfway+500)checkpoints[0].after500=s.saveState();
    if(s.t%10000===0){assert.deepEqual(s.check(),[]);
      progress({seed:job.seed,sequence:job.sequence,profile:job.profile,grip:job.grip,t:s.t,births:s.birthCount});}
  }
  const r={...job,params:s.p,initialState,initialHash:digest(initialState),rows:o.rows,events:o.events,
    samples,births:s.births,checkpoints,finalState:s.saveState()};
  r.finalHash=digest(r.finalState);r.metrics=metrics(r);
  assert.equal(r.events.filter(e=>e.kind==='rearm').length,s.fuelUsed);
  assert.deepEqual(r.initialState.arrays.type,r.finalState.arrays.type);assert.deepEqual(s.check(),[]);
  return r;
}
function main(){
  const options={out:'',seeds:'303,304',sequences:sequences.join(','),profiles:'square,opposed20',
    grips:'1,0',steps:100000,workers:4,cpuBudget:1800,priorCpu:0};
  for(let i=2;i<process.argv.length;i+=2){const k=process.argv[i].replace(/^--/,'');
    assert(Object.hasOwn(options,k)&&process.argv[i+1]!==undefined);
    options[k]=typeof options[k]==='number'?Number(process.argv[i+1]):process.argv[i+1];}
  const seeds=options.seeds.split(',').map(Number),seqs=options.sequences.split(','),
    profiles=options.profiles.split(','),grips=options.grips.split(',').map(Number);
  assert(options.out&&options.steps>=1000&&options.steps%100===0);
  assert(Number.isInteger(options.workers)&&options.workers>=1&&options.workers<=4);
  assert(options.cpuBudget>options.priorCpu&&options.priorCpu>=0);
  assert(seeds.every(Number.isInteger)&&seqs.every(q=>sequences.includes(q))&&
    profiles.every(p=>['square','opposed20'].includes(p))&&grips.every(g=>[0,1].includes(g)));
  for(const xs of [seeds,seqs,profiles,grips])assert.equal(new Set(xs).size,xs.length);
  const jobs=seeds.flatMap(seed=>seqs.flatMap(sequence=>profiles.flatMap(profile=>grips.map(grip=>
    ({seed,sequence,profile,grip:!!grip,steps:options.steps})))));
  const files=['.runs.jsonl','.manifest.json'].map(ext=>options.out+ext);assert(files.every(f=>!fs.existsSync(f)));
  fs.mkdirSync(path.dirname(options.out),{recursive:true});
  const m={options,jobs,node:process.version,platform:process.platform,command:process.argv,complete:false,completed:0,
    sources:Object.fromEntries(sources.map(f=>[f,hash(fs.readFileSync(path.join(__dirname,'..',f)))])),
    started:new Date().toISOString(),errors:[]};
  const write=()=>fs.writeFileSync(files[1],JSON.stringify(m,null,2)+'\n');
  fs.writeFileSync(files[0],'',{flag:'wx'});write();
  const cpu=process.cpuUsage(),wall=Date.now(),workers=new Set();let next=0,failed=false;
  const used=()=>{const c=process.cpuUsage(cpu);return(c.user+c.system)/1e6;};
  const abort=reason=>{if(failed)return;failed=true;m.errors.push(reason);process.exitCode=1;
    for(const w of workers)w.terminate();write();};
  const timer=setInterval(()=>{if(used()+options.priorCpu>options.cpuBudget)abort('Process CPU budget exhausted; partial batch');},1000);
  function launch(){while(!failed&&workers.size<options.workers&&next<jobs.length){
    const w=new Worker(__filename,{workerData:jobs[next++]});workers.add(w);let received=false;
    w.on('message',msg=>{if(msg.progress){console.error(JSON.stringify(msg.progress));return;}
      assert(!received);received=true;fs.appendFileSync(files[0],JSON.stringify(msg.result)+'\n');m.completed++;write();
      console.error(JSON.stringify({completed:m.completed,...msg.result.metrics}));});
    w.on('error',e=>abort(e.stack));
    w.on('exit',code=>{workers.delete(w);if((code||!received)&&!failed)abort('Worker exited without complete result');
      if(!workers.size&&(failed||next===jobs.length)){clearInterval(timer);
        Object.assign(m,{complete:!failed,cpuSeconds:used(),wallSeconds:(Date.now()-wall)/1000,finished:new Date().toISOString()});write();}
      else launch();});
  }}launch();
}
if(require.main===module){if(isMainThread)main();else parentPort.postMessage({result:run(workerData,progress=>parentPort.postMessage({progress}))});}
module.exports={setup,observe,metrics,run,sources,sequences,hash,digest,complement};
