#!/usr/bin/env node
'use strict';
// Prepared geometry / physics preflight only; no chemistry or population dynamics.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const {Sim,NV,T_A,T_B,T_C}=require('../src/sim');
const {report:accounting,strip}=require('./resource_economy');
const alias={I:T_A,B:T_B,T:T_C};
const points={I:[[.5,-.5],[.5,.5],[-.5,.5],[-.5,-.5]],
  B:[[1,-.5],[1,.5],[0,.5],[-1,.5],[-1,-.5],[0,-.5]],
  T:[[1,-.5],[1,.5],[0,.5],[-1,.5],[-1,-.5],[0,-.5]]};
const edgeMap={I:[0,1,2,3],B:[0,1,3,2],T:[0,5,3,4]};
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const digest=x=>hash(JSON.stringify(x));
const copy=x=>JSON.parse(JSON.stringify(x));
const label=(f,b,p)=>`${f}:${b}:${p}`;
function labels(type){
  const k=type[0],x=Number(type[1]),y=Number(type[2]);
  if(k==='D')return [label('HD',1-y,'+'),label('VD',y,'-'),label('HU',x,'-'),label('VD',x,'+')];
  if(k==='U')return [label('HU',1-x,'+'),label('VU',Number(x===y),'+'),label('HD',x,'-'),label('VU',y,'-')];
  return [label(k,'end','+'),label(k==='B'?'VU':'VD',k==='B'?1-x:x,'+'),label(k,'end','-'),label(k==='B'?'VD':'VU',x,'-')];
}
const mates=(a,b)=>a.slice(0,-1)===b.slice(0,-1)&&a.at(-1)!==b.at(-1);
function pattern(n,state,length){
  const cells=Array.from({length:n},(_,i)=>(state>>i)&1),nodes=[];let carry=(state>>n)&1;
  for(let c=0;c<length;c++){
    if(c%2===0){
      for(let r=0;r<n;r++){const x=cells[r],y=carry;nodes.push({id:`I${c},${r}`,kind:'I',type:`D${x}${y}`,x:c,y:-r,c,r});cells[r]=1-y;carry=x;}
      nodes.push({id:`B${c}`,kind:'B',type:`B${carry}`,x:c+.5,y:-n,c});carry=1-carry;
    }else{
      for(let r=n-1;r>=0;r--){const x=cells[r],y=carry;nodes.push({id:`I${c},${r}`,kind:'I',type:`U${x}${y}`,x:c,y:-r,c,r});cells[r]=1-x;carry=Number(x===y);}
      nodes.push({id:`T${c}`,kind:'T',type:`T${carry}`,x:c+.5,y:1,c});
    }
  }
  return nodes;
}
class PortSim extends Sim {
  _initGeometry(){
    super._initGeometry();
    for(const kind of ['I','B','T']){
      const t=alias[kind],ps=points[kind];this.nv[t]=ps.length;
      for(let k=0;k<ps.length;k++){this.rx[t*NV+k]=ps[k][0];this.ry[t*NV+k]=ps[k][1];}
      edgeMap[kind].forEach((e,i)=>this.edgeOf[t*4+i]=e);
    }
    const unused={I:[],B:[],T:[]};
    for(let u=0;u<this.n;u++)for(const kind of ['I','B','T'])if(this.type[u]===alias[kind])unused[kind].push(u);
    this._units={};this._nodes={};const angle=this.p.fixtureAngle||0,c=Math.cos(angle),sn=Math.sin(angle);
    for(const node of this.p.fixture){
      const u=unused[node.kind].shift();assert.notEqual(u,undefined);this._units[node.id]=u;this._nodes[u]=node;
      this.w[u]=node.kind==='I'?1:.5;this.wr[u]=node.kind==='I'?6:1.2;
      this.vw[u]=this.nv[this.type[u]]*this.w[u];
      this.px[u]=30+c*node.x-sn*node.y;this.py[u]=30+sn*node.x+c*node.y;this.pa[u]=angle;this._resetShape(u);
    }
  }
}
function setup(nodes,{proxy='area',angle=0,seed=211,bodyJostle=true,iters=4,zero=false}={}){
  const size=proxy==='area'?Math.sqrt(2):2;
  return new PortSim({fixture:copy(nodes),fixtureAngle:angle,seed,W:80,H:80,seedCount:0,
    nA:nodes.filter(n=>n.kind==='I').length,nB:nodes.filter(n=>n.kind==='B').length,nC:nodes.filter(n=>n.kind==='T').length,
    nE:0,sizeA:1,sizeB:size,sizeC:size,stiffA:.5,stiffB:.5,stiffC:.5,
    sigma:zero?0:.3,sigmaRot:zero?0:.45,bodyJostle,iters,snapCorners:false,maxEventLog:0,maxBirthLog:0});
}
function polygon(s,u){return Array.from({length:s.corners(u)},(_,k)=>[s.px[u]+s.ox[u*NV+k],s.py[u]+s.oy[u*NV+k]]);}
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
function hull(ps){
  const a=ps.map(p=>[...p]).sort((p,q)=>p[0]-q[0]||p[1]-q[1]);
  const half=xs=>{const out=[];for(const p of xs){while(out.length>1&&cross(out.at(-2),out.at(-1),p)<=1e-10)out.pop();out.push(p);}return out;};
  return [...half(a).slice(0,-1),...half([...a].reverse()).slice(0,-1)];
}
const area=p=>Math.abs(p.reduce((n,a,i)=>{const b=p[(i+1)%p.length];return n+a[0]*b[1]-a[1]*b[0];},0))/2;
function overlap(pa,pb){
  let out=hull(pa);const clip=hull(pb);
  for(let i=0;i<clip.length;i++){
    const a=clip[i],b=clip[(i+1)%clip.length],input=out;out=[];
    if(!input.length)break;
    for(let j=0;j<input.length;j++){
      const p=input[j],q=input[(j+1)%input.length],cp=cross(a,b,p),cq=cross(a,b,q);
      if(cp>=-1e-10)out.push(p);
      if((cp>=0)!==(cq>=0)){const t=cp/(cp-cq);out.push([p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])]);}
    }
  }
  return out.length>2?area(out):0;
}
function contact(s,u,i,v,j){
  const a=s._side(u,i,[0,0,0,0]),b=s._side(v,j,[0,0,0,0]),dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]),d=Math.hypot(dx,dy);
  const ca=s._sideCorners(u,i,[0,0]),cb=s._sideCorners(v,j,[0,0]);
  const gaps=ca.map((qa,k)=>{const qb=cb[1-k];return Math.hypot(s._dx(s.px[v]+s.ox[qb]-s.px[u]-s.ox[qa]),s._dy(s.py[v]+s.oy[qb]-s.py[u]-s.oy[qa]));});
  const d0=(s.size[u]+s.size[v])/2;
  return {u,i,v,j,pinGap:Math.max(...gaps),midGap:Math.hypot(dx+b[0]-a[0],dy+b[1]-a[1]),normalDot:a[2]*b[2]+a[3]*b[3],distance:d,
    geom:s._geomOK(u,i,v,j,dx,dy,d),neighbor:d<s.reach,
    centreGate:d>=d0*(1-s.p.distTol)-1e-12&&d<=d0*(1+s.p.distTol)+1e-12,
    radialPenetration:Math.max(0,s.rad[u]+s.rad[v]-d),
    compatible:mates(labels(s._nodes[u].type)[i],labels(s._nodes[v].type)[j])};
}
function touching(s){
  const out=[];
  for(let u=0;u<s.n;u++)for(let v=u+1;v<s.n;v++)for(let i=0;i<4;i++)for(let j=0;j<4;j++){
    const q=contact(s,u,i,v,j);if(q.pinGap<1e-8&&q.normalDot<-.999999)out.push(q);
  }
  return out;
}
const edgeKey=(a,b)=>[a,b].sort().join('|');
function idealCases(){
  const cases=[];
  for(const e of accounting().examples){
    const full=pattern(e.n,e.cycle.states[0],e.cycle.columns*3+10);
    for(const parity of [0,1])for(const length of [3,6])for(const turn of [0,1,2,3])for(const proxy of ['area','long']){
      const start=e.cycle.columns+parity,end=start+length;
      const nodes=full.filter(p=>p.c>=start&&p.c+(p.kind==='I'?0:1)<end);
      const s=setup(nodes,{proxy,angle:turn*Math.PI/2}),cs=touching(s),occupied=new Set();
      const remap=id=>{const [c,r]=id.slice(1).split(',').map(Number);
        if(id[0]==='I')return `I${c+start},${parity?e.n-1-r:r}`;
        return `${parity?(id[0]==='B'?'T':'B'):id[0]}${c+start}`;};
      const expected=strip(e.n,length).edges.map(([a,b])=>edgeKey(remap(a),remap(b))).sort();
      assert.deepEqual(cs.map(q=>edgeKey(s._nodes[q.u].id,s._nodes[q.v].id)).sort(),expected,'Geometry differs from accounting graph');
      for(const q of cs)for(const port of [q.u*4+q.i,q.v*4+q.j]){assert(!occupied.has(port));occupied.add(port);}
      let maxOverlap=0;for(let u=0;u<s.n;u++)for(let v=u+1;v<s.n;v++)maxOverlap=Math.max(maxOverlap,overlap(polygon(s,u),polygon(s,v)));
      const fronts=[];
      for(const outside of full.filter(p=>!nodes.some(n=>n.id===p.id)&&p.c>=start-2&&p.c<=end)){
        const trial=setup([...nodes,outside],{proxy,angle:turn*Math.PI/2}),u=trial._units[outside.id];
        const contacts=touching(trial).filter(q=>q.u===u||q.v===u);
        if(contacts.length>=2){
          trial._buildHash();fronts.push({id:outside.id,contacts,slotFree:trial._slotFree(u,trial.px[u],trial.py[u]),polygon:polygon(trial,u)});
        }
      }
      cases.push({n:e.n,parity,length,turn,proxy,parts:s.n,area:nodes.reduce((a,n)=>a+(n.kind==='I'?1:2),0),
        maxOverlap,contacts:cs,fronts,params:s.p,polygons:nodes.map(n=>({id:n.id,type:n.type,ports:labels(n.type),points:polygon(s,s._units[n.id])}))});
    }
  }
  return cases;
}
function frontFixture(end,first,options){
  const e=accounting().examples[0],full=pattern(1,e.cycle.states[0],24),start=e.cycle.columns;
  const nodes=full.filter(p=>p.c>=start&&p.c+(p.kind==='I'?0:1)<start+3);
  const candidate=full.find(p=>p.kind!=='I'&&p.c===(end==='right'?start+2:start-1));assert(candidate);
  const trial=setup([...nodes,candidate],options),u=trial._units[candidate.id];
  const cs=touching(trial),acq=cs.filter(q=>q.u===u||q.v===u);assert.equal(acq.length,2);
  for(const q of cs)if(q.u!==u&&q.v!==u)trial._link(q.u,q.i,q.v,q.j);
  const q=acq[first];trial._link(q.u,q.i,q.v,q.j);trial._computeOpen();trial._buildHash();
  return {s:trial,target:acq[1-first],incoming:u};
}
function squareFixture(first,options){
  const nodes=[{id:'a',x:0,y:0},{id:'b',x:1,y:0},{id:'c',x:0,y:1},{id:'d',x:1,y:1}].map(p=>({...p,kind:'I',type:'D00'}));
  const s=setup(nodes,options),incoming=s._units.d,cs=touching(s),acq=cs.filter(q=>q.u===incoming||q.v===incoming);
  for(const q of cs)if(q.u!==incoming&&q.v!==incoming)s._link(q.u,q.i,q.v,q.j);
  const q=acq[first];s._link(q.u,q.i,q.v,q.j);s._computeOpen();s._buildHash();return {s,target:acq[1-first],incoming};
}
function snapshot(s,target){
  let maxHullOverlap=0;for(let u=0;u<s.n;u++)for(let v=u+1;v<s.n;v++)maxHullOverlap=Math.max(maxHullOverlap,overlap(polygon(s,u),polygon(s,v)));
  s._bondList();let maxPin=0;
  for(const port of s.bonds){const q=s.bond[port];maxPin=Math.max(maxPin,contact(s,port>>2,port&3,q>>2,q&3).pinGap);}
  return {t:s.t,maxHullOverlap,maxPin,target:target?contact(s,target.u,target.i,target.v,target.j):null,
    polygons:Array.from({length:s.n},(_,u)=>polygon(s,u))};
}
function advance(s){s._physics();s.t++;}
const schemes=[{name:'body4',bodyJostle:true,iters:4},{name:'individual4',bodyJostle:false,iters:4},
  {name:'individual16',bodyJostle:false,iters:16},{name:'zero4',bodyJostle:true,iters:4,zero:true},{name:'zero16',bodyJostle:true,iters:16,zero:true}];
function physicalCases(){
  const cases=[];
  for(const proxy of ['area','long'])for(const fixture of ['left','right','square'])for(const first of [0,1])for(const seed of [211,212])for(const scheme of schemes){
    const options={proxy,seed,...scheme},a=fixture==='square'?squareFixture(first,options):frontFixture(fixture,first,options),{s,target}=a;
    const initial=s.saveState(),types=Array.from(s.type),bonds=Array.from(s.bond),samples=[snapshot(s,target)];
    for(let t=1;t<=100;t++){advance(s);if([1,10,100].includes(t))samples.push(snapshot(s,target));}
    assert.deepEqual(Array.from(s.type),types);assert.deepEqual(Array.from(s.bond),bonds);assert.deepEqual(s.check(),[]);
    const final=s.saveState();cases.push({proxy,fixture,first,seed,scheme:scheme.name,params:s.p,target,initialHash:digest(initial),finalHash:digest(final),initial,final,samples});
  }
  return cases;
}
function stericCases(){
  const cases=[];
  for(const proxy of ['area','long'])for(const kind of ['B','I'])for(const orientation of ['long','short'])for(const iters of [4,16]){
    const d=orientation==='long'?1.6:1.2,nodes=[{id:'a',kind,type:kind==='I'?'D00':'B0',x:0,y:0},{id:'b',kind,type:kind==='I'?'D00':'B0',x:orientation==='long'?d:0,y:orientation==='short'?d:0}];
    const s=setup(nodes,{proxy,iters,zero:true});s._buildHash();const initial=s.saveState(),before=snapshot(s),slotFree=s._slotFree(0,s.px[0],s.py[0]);
    for(let t=0;t<10;t++)advance(s);
    const final=s.saveState();cases.push({proxy,kind,orientation,iters,slotFree,before,after:snapshot(s),initial,final,initialHash:digest(initial),finalHash:digest(final)});
  }
  return cases;
}
function summarize(r){
  const ideal=r.ideal.map(c=>({n:c.n,parity:c.parity,length:c.length,turn:c.turn,proxy:c.proxy,parts:c.parts,
    contacts:c.contacts.length,labelFailures:c.contacts.filter(q=>!q.compatible).length,
    geomFailures:c.contacts.filter(q=>!q.geom).length,centreFailures:c.contacts.filter(q=>!q.centreGate||!q.neighbor).length,
    fronts:c.fronts.length,frontSlotFailures:c.fronts.filter(f=>!f.slotFree).length,maxOverlap:c.maxOverlap}));
  const physical=[];
  for(const proxy of ['area','long'])for(const fixture of ['left','right','square'])for(const scheme of schemes){
    const xs=r.physical.filter(c=>c.proxy===proxy&&c.fixture===fixture&&c.scheme===scheme.name);
    physical.push({proxy,fixture,scheme:scheme.name,runs:xs.length,initialPass:xs.filter(c=>c.samples[0].target.geom&&c.samples[0].target.centreGate).length,
      at1:xs.filter(c=>c.samples[1].target.geom&&c.samples[1].target.centreGate).length,
      at10:xs.filter(c=>c.samples[2].target.geom&&c.samples[2].target.centreGate).length,
      at100:xs.filter(c=>c.samples[3].target.geom&&c.samples[3].target.centreGate).length,
      maxPin:Math.max(...xs.flatMap(c=>c.samples.map(w=>w.maxPin))),maxHullOverlap:Math.max(...xs.flatMap(c=>c.samples.map(w=>w.maxHullOverlap)))});
  }
  return {ideal,physical,steric:r.steric.map(c=>({proxy:c.proxy,kind:c.kind,orientation:c.orientation,iters:c.iters,slotFree:c.slotFree,before:c.before.maxHullOverlap,after:c.after.maxHullOverlap})),
    scalarSizeBounds:{endContactMinimum:2/1.35,noFalseRepulsionMaximum:Math.sqrt(5)-1},
    portLayoutPass:ideal.every(c=>!c.labelFailures&&c.maxOverlap<1e-8),
    directMechanicsPass:ideal.every(c=>!c.geomFailures&&!c.centreFailures&&!c.frontSlotFailures)};
}
function main(){
  const out=process.argv[2];assert(out,'Usage: node experiments/resource_ports.js UNIQUE_OUTPUT_STEM');
  for(const ext of ['.json','.summary.json'])assert(!fs.existsSync(out+ext),'Output exists');
  fs.mkdirSync(path.dirname(out),{recursive:true});const cpu=process.cpuUsage();
  const r={schema:1,ideal:idealCases(),physical:physicalCases(),steric:stericCases()};
  const sources=['src/sim.js','experiments/resource_economy.js','experiments/resource_ports.js','experiments/resource_ports_plan.md'];
  r.provenance={command:process.argv,node:process.version,date:new Date().toISOString(),baseline:'809b09d',
    sources:Object.fromEntries(sources.map(f=>[f,hash(fs.readFileSync(path.join(__dirname,'..',f)))])),cpuSeconds:Object.values(process.cpuUsage(cpu)).reduce((a,b)=>a+b,0)/1e6};
  const summary=summarize(r);fs.writeFileSync(out+'.json',JSON.stringify(r)+'\n',{flag:'wx'});
  fs.writeFileSync(out+'.summary.json',JSON.stringify(summary,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({ideal:r.ideal.length,physical:r.physical.length,steric:r.steric.length,portLayoutPass:summary.portLayoutPass,directMechanicsPass:summary.directMechanicsPass,cpuSeconds:r.provenance.cpuSeconds}));
}
if(require.main===module)main();
module.exports={PortSim,setup,labels,mates,pattern,points,edgeMap,polygon,hull,area,overlap,contact,touching,idealCases,frontFixture,squareFixture,snapshot,advance,physicalCases,stericCases,summarize,hash,digest};
