#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),zlib=require('zlib');
const {NV}=require('../src/sim'),base=require('./resource_ports');
const {PolygonContactSim}=require('./polygon_contact_physics');
const clone=x=>JSON.parse(JSON.stringify(x));
const SOURCES=['src/sim.js','experiments/resource_economy.js','experiments/resource_ports.js',
  'experiments/polygon_contact_physics.js','experiments/port_acquisition.js','experiments/port_acquisition_plan.md'];
const SCHEMES={body4:{bodyJostle:true,iters:4},individual16:{bodyJostle:false,iters:16},individual32:{bodyJostle:false,iters:32},zero4:{bodyJostle:true,iters:4,zero:true}};
function face(s,u,i,pose){
  const cs=s._sideCorners(u,i,[0,0]),rot=pose?.rot||0,c=Math.cos(rot),sn=Math.sin(rot),x=pose?.x??s.px[u],y=pose?.y??s.py[u];
  return cs.map(q=>[x+c*s.ox[q]-sn*s.oy[q],y+sn*s.ox[q]+c*s.oy[q]]);
}
function gap(s,u,i,v,j,pu,pv){
  const a=face(s,u,i,pu),b=face(s,v,j,pv),length=p=>Math.hypot(s._dx(p[1][0]-p[0][0]),s._dy(p[1][1]-p[0][1]));
  return {max:Math.max(...a.map((p,k)=>Math.hypot(s._dx(p[0]-b[1-k][0]),s._dy(p[1]-b[1-k][1])))),limit:s.p.linkDistTol*(length(a)+length(b))/2};
}
class AcquisitionSim extends PolygonContactSim {
  constructor(p){super(p);assert.equal(p.portLabels.length,this.n*4);this.portLabels=Object.freeze([...p.portLabels]);this._trace=[];this._rejections={geometry:0,endpoints:0,vacancy:0};}
  _degree(u){let n=0;for(let i=0;i<4;i++)n+=this.bond[u*4+i]>=0;return n;}
  _compatible(u,i,v,j){return base.mates(this.portLabels[u*4+i],this.portLabels[v*4+j]);}
  _formBond(u,i,v,j){
    if(this.bond[u*4+i]>=0||this.bond[v*4+j]>=0||!this._compatible(u,i,v,j))return false;
    let m=-1,a,im,ia;
    if(!this._degree(v)){m=v;im=j;a=u;ia=i;}else if(!this._degree(u)){m=u;im=i;a=v;ia=j;}
    let pose;
    if(m>=0){
      const sa=this._side(a,ia,[0,0,0,0]),sm=this._side(m,im,[0,0,0,0]);
      const rot=Math.atan2(-sa[3],-sa[2])-Math.atan2(sm[3],sm[2]),c=Math.cos(rot),sn=Math.sin(rot);
      pose={rot,x:this._wx(this.px[a]+sa[0]-c*sm[0]+sn*sm[1]),y:this._wy(this.py[a]+sa[1]-sn*sm[0]-c*sm[1])};
    }
    const residual=gap(this,u,i,v,j,m===u?pose:undefined,m===v?pose:undefined);
    if(residual.max>residual.limit+1e-10){this._rejections.endpoints++;return false;}
    const vacant=m>=0?this._slotFree(m,pose.x,pose.y,pose.rot):
      this._slotFree(u,this.px[u],this.py[u])&&this._slotFree(v,this.px[v],this.py[v]);
    if(!vacant){this._rejections.vacancy++;return false;}
    if(m>=0){this._rigidMove(m,this._dx(pose.x-this.px[m]),this._dy(pose.y-this.py[m]),pose.rot);this.px[m]=pose.x;this.py[m]=pose.y;}
    this._link(u,i,v,j);this._trace.push({t:this.t,kind:'bind',q:u*4+i,r:v*4+j,moved:m,residual:residual.max});return true;
  }
  _formBonds(){
    if(!this.p.associationEnabled)return;
    for(let u=0;u<this.n;u++)for(let v=u+1;v<this.n;v++){
      if(!this._candidate(u,v))continue;
      const dx=this._dx(this.px[v]-this.px[u]),dy=this._dy(this.py[v]-this.py[u]),d=Math.hypot(dx,dy);
      pair:for(let i=0;i<4;i++)if(this.bond[u*4+i]<0)for(let j=0;j<4;j++)if(this.bond[v*4+j]<0&&this._compatible(u,i,v,j)){
        if(!this._geomOK(u,i,v,j,dx,dy,d)){this._rejections.geometry++;continue;}
        if(this._formBond(u,i,v,j))break pair;
      }
    }
  }
  _loseBonds(){
    if(!this.p.portLoss)return;
    for(let q=0;q<this.n*4;q++){const r=this.bond[q];if(r<=q)continue;
      if(this.rng()<this.p.portLoss){this.bond[q]=-1;this.bond[r]=-1;this.bondsDirty=true;this._trace.push({t:this.t,kind:'loss',q,r});}}
  }
  step(){this.t++;this._physics();this._formBonds();this._loseBonds();}
  saveState(){const s=super.saveState();s.acquisition={trace:clone(this._trace),rejections:{...this._rejections}};return s;}
  static fromState(st,changes){const s=super.fromState(st,changes);if(st.acquisition){s._trace=clone(st.acquisition.trace);s._rejections={...st.acquisition.rejections};}return s;}
}
function fixture(config){
  const {kind,start,scheme,seed,enabled,viability=false}=config,opts={proxy:'area',seed,...SCHEMES[scheme]};
  const first=start==='one1'?1:0,a=kind==='square'?base.squareFixture(first,opts):base.frontFixture(kind,first,opts),s=a.s,u=a.incoming;
  const targets=base.touching(s).filter(q=>q.u===u||q.v===u).map(q=>({q:q.u*4+q.i,r:q.v*4+q.j}));assert.equal(targets.length,2);
  const original=[];for(let q=0;q<s.n*4;q++)if(s.bond[q]>q&&(q>>2)!==u&&(s.bond[q]>>2)!==u)original.push({q,r:s.bond[q]});
  if(start==='free'){
    for(let i=0;i<4;i++){const r=s.bond[u*4+i];if(r>=0){s.bond[r]=-1;s.bond[u*4+i]=-1;s.bondsDirty=true;}}
    const dx=kind==='left'?-.35:.35,dy=kind==='right'?-.35:.35,rot=(seed===221?1:-1)*Math.PI/18;
    s._rigidMove(u,dx,dy,rot);
  }
  const portLabels=Array.from({length:s.n},(_,v)=>kind==='square'?['X:0:+','Y:0:+','X:0:-','Y:0:-']:base.labels(s._nodes[v].type)).flat();
  const st=s.saveState();st.p={...st.p,portLabels,associationEnabled:enabled,portLoss:viability?0:.001};
  return {s:AcquisitionSim.fromState(st),observer:{incoming:u,targets,original}};
}
function metrics(s,o){
  const u=o.incoming;let targetCount=0,wrong=0,maxIncomingGap=0,incomingOverlap=0,maxPin=0,maxHullOverlap=0;
  for(const x of o.targets)targetCount+=s.bond[x.q]===x.r;
  for(let i=0;i<4;i++){const q=u*4+i,r=s.bond[q];if(r<0)continue;
    if(!o.targets.some(x=>(x.q===q&&x.r===r)||(x.q===r&&x.r===q)))wrong++;
    maxIncomingGap=Math.max(maxIncomingGap,gap(s,u,i,r>>2,r&3).max);
  }
  const ps=Array.from({length:s.n},(_,v)=>base.polygon(s,v));
  for(let v=0;v<s.n;v++)for(let w=v+1;w<s.n;w++){
    // Translate w into v's nearest periodic image before measuring hull intersection.
    const dx=s._dx(s.px[w]-s.px[v])-(s.px[w]-s.px[v]),dy=s._dy(s.py[w]-s.py[v])-(s.py[w]-s.py[v]);
    const area=base.overlap(ps[v],ps[w].map(([x,y])=>[x+dx,y+dy]));maxHullOverlap=Math.max(maxHullOverlap,area);
    if(v===u||w===u)incomingOverlap=Math.max(incomingOverlap,area);
  }
  for(let q=0;q<s.n*4;q++){const r=s.bond[q];if(r>q)maxPin=Math.max(maxPin,gap(s,q>>2,q&3,r>>2,r&3).max);}
  return {t:s.t,targetCount,wrong,degree:s._degree(u),maxIncomingGap,incomingOverlap,maxPin,maxHullOverlap,
    originalBonds:o.original.filter(x=>s.bond[x.q]===x.r).length,bonds:Array.from(s.bond).filter(r=>r>=0).length/2};
}
function outcome(rows){
  let longest=0,run=0,rawLongest=0,rawRun=0,first=rows[0].targetCount?0:null,second=null,firstLoss=null,singleSteps=0,longestSingle=0,singleRun=0;
  for(let k=1;k<rows.length;k++){
    const m=rows[k];if(first===null&&m.targetCount>0)first=m.t;if(second===null&&m.targetCount===2)second=m.t;
    if(firstLoss===null&&m.targetCount<rows[k-1].targetCount)firstLoss=m.t;
    singleSteps+=m.targetCount===1;singleRun=m.targetCount===1?singleRun+1:0;longestSingle=Math.max(longestSingle,singleRun);
    const good=m.targetCount===2&&!m.wrong&&m.maxIncomingGap<=.15&&m.incomingOverlap<=.02;
    run=good?run+1:0;longest=Math.max(longest,run);rawRun=m.targetCount===2?rawRun+1:0;rawLongest=Math.max(rawLongest,rawRun);
  }
  return {first,second,firstLoss,singleSteps,longestSingle,longest,rawLongest,success:longest>=100,final:rows.at(-1)};
}
function configs(viability=false){
  const out=[];for(const kind of ['left','right','square'])for(const start of viability?['one0','one1']:['free','one0','one1'])
    for(const scheme of viability?['zero4']:['body4','individual16','individual32'])for(const seed of viability?[221]:[221,222])for(const enabled of [true,false])out.push({kind,start,scheme,seed,enabled,viability});return out;
}
function runCase(config){
  const {s,observer}=fixture(config),initial=s.saveState(),rows=[metrics(s,observer)],snapshots=[{t:0,state:s.saveState()}],horizon=config.viability?20:500;
  for(let t=1;t<=horizon;t++){s.step();assert.deepEqual(s.check(),[]);rows.push(metrics(s,observer));if([1,10,100,horizon].includes(t))snapshots.push({t,state:s.saveState()});}
  const final=s.saveState();for(const k of ['type','w','wr','size','nv','rx','ry','edgeOf'])assert.deepEqual(initial.arrays[k],final.arrays[k]);
  assert.deepEqual(initial.p,final.p);assert.equal(initial.nums.n,final.nums.n);
  return {config,observer,initial,final,initialHash:base.digest(initial),finalHash:base.digest(final),rows,snapshots,outcome:outcome(rows)};
}
function summarize(r){
  const groups=[];for(const kind of ['left','right','square'])for(const start of ['free','one0','one1'])for(const scheme of ['body4','individual16','individual32'])for(const enabled of [true,false]){
    const cs=r.runs.filter(c=>c.config.kind===kind&&c.config.start===start&&c.config.scheme===scheme&&c.config.enabled===enabled);
    groups.push({kind,start,scheme,enabled,n:cs.length,first:cs.filter(c=>c.outcome.first!==null).length,second:cs.filter(c=>c.outcome.second!==null).length,
      success:cs.filter(c=>c.outcome.success).length,longest:cs.map(c=>c.outcome.longest),rawLongest:cs.map(c=>c.outcome.rawLongest)});
  }
  const selected=r.runs.filter(c=>c.config.enabled&&['body4','individual32'].includes(c.config.scheme));
  const disabled=r.runs.filter(c=>!c.config.enabled);
  const controlPass=disabled.every(c=>!c.final.acquisition.trace.some(e=>e.kind==='bind'));
  return {viabilityPass:r.viability.every(c=>c.config.enabled?c.rows.at(-1).targetCount===2:c.initial.arrays.bond.b===c.final.arrays.bond.b),
    controlPass,acquisitionPass:selected.length===36&&selected.every(c=>c.outcome.success),groups};
}
function load(file){const b=fs.readFileSync(file);return JSON.parse((file.endsWith('.gz')?zlib.gunzipSync(b):b).toString());}
function main(){
  const out=process.argv[2];assert(out,'Usage: node experiments/port_acquisition.js UNIQUE_OUTPUT_STEM');
  for(const x of ['.json','.summary.json'])assert(!fs.existsSync(out+x),'Output exists');
  const cpu=process.cpuUsage(),r={schema:1,viability:configs(true).map(runCase),runs:[]};
  const viable=r.viability.every(c=>c.config.enabled?c.rows.at(-1).targetCount===2:c.initial.arrays.bond.b===c.final.arrays.bond.b);
  if(viable)for(const c of configs())r.runs.push(runCase(c));
  r.summary=summarize(r);r.provenance={baseline:'861abe3',command:process.argv,node:process.version,date:new Date().toISOString(),
    sources:Object.fromEntries(SOURCES.map(f=>[f,base.hash(fs.readFileSync(path.join(__dirname,'..',f)))])),cpuSeconds:Object.values(process.cpuUsage(cpu)).reduce((a,b)=>a+b,0)/1e6,
    physicsSteps:r.viability.length*20+r.runs.length*500};
  fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out+'.json',JSON.stringify(r)+'\n',{flag:'wx'});
  fs.writeFileSync(out+'.summary.json',JSON.stringify(r.summary,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({viable,runs:r.runs.length,acquisitionPass:r.summary.acquisitionPass,cpuSeconds:r.provenance.cpuSeconds}));
}
if(require.main===module)main();
module.exports={AcquisitionSim,face,gap,fixture,metrics,outcome,configs,runCase,summarize,load,SOURCES};
