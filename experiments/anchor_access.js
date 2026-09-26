#!/usr/bin/env node
// Observation only: hooks call the original method once and consume no randomness.
const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto');
const {setup,instrument}=require('./patch_completion');
const {inventory}=require('./end_protection_natural');
const {F,L,R}=require('../src/sim');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
function geometry(s,u,i,v,j,dx,dy,d){
  const a=s._side(u,i,[0,0,0,0]),b=s._side(v,j,[0,0,0,0]);
  const lateral=i!==F&&j!==F,tol=(lateral?s.p.linkDistTol:s.p.distTol)*(s.size[u]+s.size[v])/2;
  const x=dx+b[0]-a[0],y=dy+b[1]-a[1];
  if(x*x+y*y>tol*tol)return 'gap';
  if(!lateral&&(a[2]*dx/d+a[3]*dy/d<s.cosTol||-(b[2]*dx/d+b[3]*dy/d)<s.cosTol))return 'bearing';
  if(a[2]*b[2]+a[3]*b[3]>-(lateral?s.cosLinkTol:s.cosTolRot))return 'angle';
  return 'pass';
}
function observe(s,parent,start=15000,anchors=[87,107]){
  const index=new Map(parent.map((u,i)=>[u,i])),counts={},occupancy=parent.map(()=>({free:0,single:0,linked:0}));
  const add=(key,field)=>{const c=counts[key]||(counts[key]={});c[field]=(c[field]||0)+1;};
  const keys=(u,i,v,j)=>{
    const out=[];
    if(i===F&&j===F){if(index.has(u))out.push('site'+index.get(u));if(index.has(v))out.push('site'+index.get(v));}
    if([L,R].includes(i)&&[L,R].includes(j))for(const a of anchors)if(u===a||v===a)out.push('anchor'+a);
    return out;
  };
  for(const name of ['compat','_geomOK','_formBond']){
    const original=s[name];s[name]=function(u,i,v,j,...rest){
      const result=original.call(this,u,i,v,j,...rest);
      if(this.t>start)for(const key of keys(u,i,v,j)){
        if(name==='compat'){add(key,'compatibleCalls');if(result>0)add(key,'compatible');}
        if(name==='_geomOK'){const reason=geometry(this,u,i,v,j,...rest);assert.equal(result,reason==='pass');add(key,'geometry');add(key,reason);}
        if(name==='_formBond'){add(key,'placement');add(key,result?'accepted':'occupiedSlot');}
      }return result;
    };
  }
  return {counts,occupancy,sample(){if(s.t<=start)return;for(let k=0;k<parent.length;k++){
    const q=s.bond[parent[k]*4+F],u=q>>2;
    occupancy[k][q<0?'free':s.bond[u*4+L]>=0||s.bond[u*4+R]>=0?'linked':'single']++;
  }}};
}
function run(){
  const job={seed:83,profile:'opposed20',undock:0.3,steps:50000};
  const reference=fs.readFileSync('experiments/out/PC_screen.runs.jsonl');
  const ref=reference.toString().trim().split(/\r?\n/).map(JSON.parse).find(r=>r.seed===83&&r.profile==='opposed20'&&r.undock===0.3);
  const {s,parent}=setup(job),patch=instrument(s,parent),obs=observe(s,parent),windows=[],types=Array.from(s.type);
  for(let i=0;i<job.steps;i++){s.step();obs.sample();if(s.t%5000===0)windows.push(inventory(s,patch.known));}
  assert.deepEqual(s.births,ref.births);assert.deepEqual(s.p,ref.params);
  assert.deepEqual(windows,ref.windows.map(({samples,patchSum,multi,zero,...w})=>w));
  assert.deepEqual(patch.links,ref.links);assert.deepEqual(Array.from(s.type),types);assert.deepEqual(s.check(),[]);
  const plain=setup(job).s;plain.run(job.steps);assert.deepEqual(s.saveState(),plain.saveState());
  return {job,params:s.p,parent,start:15000,end:s.t,counts:obs.counts,occupancy:obs.occupancy,
    windows,births:s.births,referenceSha256:hash(reference),finalStateSha256:hash(JSON.stringify(s.saveState())),neutral:true};
}
if(require.main===module){
  const out=process.argv[2];assert(out&&!fs.existsSync(out));const cpu=process.cpuUsage(),r=run(),c=process.cpuUsage(cpu);
  const sources=Object.fromEntries(['src/sim.js','experiments/patch_completion.js','experiments/end_protection.js','experiments/end_protection_natural.js','experiments/anchor_access.js'].map(f=>[f,hash(fs.readFileSync(f))]));
  fs.writeFileSync(out,JSON.stringify({...r,cpuSeconds:(c.user+c.system)/1e6,sources},null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({counts:r.counts,occupancy:r.occupancy,neutral:r.neutral,cpuSeconds:(c.user+c.system)/1e6},null,2));
}
module.exports={geometry,observe,run};
