#!/usr/bin/env node
// Observation only. No simulator rule reads this module's identities or records.
const assert=require('assert/strict');
const {F,K,L,R,NV,LETTERS,isProd,I_TPL,S}=require('../src/sim.js');
const {kind}=require('./recipient_dependence.js');
const letter=(s,u)=>LETTERS.includes(s.type[u]);
const lateral=i=>i===L||i===R;
const bondKey=(u,i,v,j)=>[u*4+i,v*4+j].sort((a,b)=>a-b).join('/');
function side(s,u,i){
  const e=s.edgeOf[s.type[u]*4+i],a=u*NV+e,b=u*NV+(e+1)%s.nv[s.type[u]];
  const x=s.ox[b]-s.ox[a],y=s.oy[b]-s.oy[a],d=Math.hypot(x,y)||1;
  return [(s.ox[a]+s.ox[b])/2,(s.oy[a]+s.oy[b])/2,y/d,-x/d];
}
// Exact ordinary K/F geometry, with private scratch storage (no Sim cache writes).
function geometry(s,u,v){
  let dx=s.px[v]-s.px[u],dy=s.py[v]-s.py[u];
  if(Math.abs(dx)>.49*s.p.W)dx-=s.p.W*Math.round(dx/s.p.W);
  if(Math.abs(dy)>.49*s.p.H)dy-=s.p.H*Math.round(dy/s.p.H);
  const d=Math.hypot(dx,dy),d0=(s.size[u]+s.size[v])/2;
  const a=side(s,u,K),b=side(s,v,F),gx=dx+b[0]-a[0],gy=dy+b[1]-a[1];
  return {dx,dy,d,centre:d>=d0*(1-s.p.distTol)&&d<=d0*(1+s.p.distTol),
    sides:d>0&&gx*gx+gy*gy<=(s.p.distTol*d0)**2&&
      (a[2]*dx+a[3]*dy)/d>=s.cosTol&&-(b[2]*dx+b[3]*dy)/d>=s.cosTol&&
      a[2]*b[2]+a[3]*b[3]<=-s.cosTolRot};
}
function observe(s,saved=null){
  assert(s.p.translate&&s.p.catalysis&&s.p.bindAny&&!s.p.compCopy&&!s.p.backCopy,
    'Diagnostic scope: shared products and ordinary self-copying letters');
  const data=saved?structuredClone(saved):{events:[],rows:[],samples:[],owner:[],releases:[],bindings:[],links:[]};
  const owner=new Map(data.owner),releases=new Map(data.releases),bindings=new Map(data.bindings),links=new Map(data.links);
  const emit=(kind,fields={})=>{const e={id:data.events.length,t:s.t,kind,...fields};data.events.push(e);return e;};
  const row=u=>owner.get(u)??null;
  const category=u=>row(u)===null?'unknown':data.rows[row(u)].category;
  function retire(u,reason){
    const id=row(u);if(id===null)return;
    const p=data.rows[id],e=emit('retire',{row:id,reason});p.lost=e.id;
    p.units.forEach(v=>owner.delete(v));
  }
  function register(units,initial=false){
    const origins=units.map(u=>releases.get(u)??null),parents=new Set(origins.map(e=>e?.parent??null));
    let parent=null;
    if(!initial&&parents.size===1&&!parents.has(null)){
      const id=[...parents][0],p=data.rows[id];
      if(p.lost===null&&p.units.length===units.length&&origins.every((e,i)=>e.unit===p.units.at(-1-i))&&
        units.every(u=>!p.units.includes(u)))parent=id;
    }
    const witnesses=units.slice(0,-1).map((u,i)=>links.get(bondKey(u,R,units[i+1],L))??null);
    units.forEach(u=>retire(u,'register'));
    const seq=units.map(u=>s._letter(u)).join(''),detached=units.every(u=>s.bond[u*4+F]<0);
    const p={id:data.rows.length,units:[...units],seq,category:kind(seq),initial,parent,detached,
      exact:parent!==null&&detached&&seq===[...data.rows[parent].seq].reverse().join(''),
      born:data.events.length,lost:null,origins,witnesses};
    data.rows.push(p);units.forEach(u=>owner.set(u,p.id));
    emit('row',{row:p.id});return p;
  }
  if(!saved){
    for(let u=0;u<s.n;u++)if(letter(s,u)&&!owner.has(u)&&
      (s.bond[u*4+L]>=0||s.bond[u*4+R]>=0)){
      const units=s.strandOf(u);
      if(units.every(v=>letter(s,v)&&s.is[v]===I_TPL))register(units,true);
    }
  }
  const maturePair=(u,i,v,j)=>{
    if(isProd(s.type[u]))[u,i,v,j]=[v,j,u,i];
    return letter(s,u)&&isProd(s.type[v])&&i===K&&j===F&&s.is[v]===I_TPL?{unit:u,product:v}:null;
  };
  function support(u){
    const q=s.bond[u*4+F];if(q<0||!s.cat[q])return null;
    const template=q>>2,z=s.bond[template*4+K],binding=bindings.get(template)??null;
    const known=(q&3)===F&&z>=0&&(z&3)===F&&isProd(s.type[z>>2])&&s.is[z>>2]===I_TPL&&
      binding!==null&&data.events[binding].product===(z>>2);
    return {template,row:row(template),category:category(template),product:z>=0?z>>2:null,
      binding:known?binding:null,known};
  }
  function sample(){
    const e={t:s.t,producer:0,recipient:0,unknown:0,freeProducer:0,freeRecipient:0,freeUnknown:0,mature:0};
    for(let u=0;u<s.n;u++){
      if(isProd(s.type[u])&&s.is[u]===I_TPL)e.mature++;
      if(!letter(s,u)||s.is[u]!==I_TPL)continue;
      const c=category(u);e[c]++;if(s.bond[u*4+K]<0)e['free'+c[0].toUpperCase()+c.slice(1)]++;
    }
    data.samples.push(e);return e;
  }
  const originals={};
  function wrap(name,fn){originals[name]=s[name];s[name]=function(...args){return fn(originals[name].bind(this),...args);};}
  wrap('_formBonds',(original)=>{sample();return original();});
  wrap('_tryBond',(original,u,v,...args)=>{
    const p=maturePair(u,isProd(s.type[u])?F:K,v,isProd(s.type[v])?F:K);
    if(p&&s.is[p.unit]===I_TPL&&s.bond[p.unit*4+K]<0&&s.bond[p.product*4+F]<0&&
      (s.open[p.unit]&(1<<K))&&(s.open[p.product]&(1<<F))){
      const g=geometry(s,p.unit,p.product);
      emit('opportunity',{...p,row:row(p.unit),category:category(p.unit),geometry:g.centre&&g.sides,
        probability:s.compat(p.unit,K,p.product,F)});
    }
    return original(u,v,...args);
  });
  wrap('_formBond',(original,u,i,v,j)=>{
    const p=maturePair(u,i,v,j),result=original(u,i,v,j);
    if(p)emit('attempt',{...p,success:result});return result;
  });
  wrap('_link',(original,u,i,v,j)=>{
    const p=maturePair(u,i,v,j),isLateral=letter(s,u)&&letter(s,v)&&lateral(i)&&lateral(j);
    const supports=isLateral?[support(u),support(v)].filter(Boolean):[];
    const sticky=isLateral&&s.ss[u*4+i]===S.STICKY&&s.ss[v*4+j]===S.STICKY;
    if(isLateral){retire(u,'link');retire(v,'link');}
    const result=original(u,i,v,j);
    if(p){const e=emit('binding',{...p,row:row(p.unit),category:category(p.unit),end:null});bindings.set(p.unit,e.id);}
    const e=emit('bond+',{u,i,v,j,sticky,supports});
    if(isLateral)links.set(bondKey(u,i,v,j),e.id);return result;
  });
  wrap('_unlink',(original,u,i)=>{
    const q=s.bond[u*4+i];if(q<0)return original(u,i);
    const v=q>>2,j=q&3;
    // Close by endpoints even if a product's state changed since attachment.
    for(const [a,ai,b,bi]of [[u,i,v,j],[v,j,u,i]])if(ai===K&&bi===F&&bindings.has(a)&&data.events[bindings.get(a)].product===b){
      data.events[bindings.get(a)].end=data.events.length;bindings.delete(a);
    }
    if(letter(s,u)&&lateral(i))retire(u,'unlink');
    if(letter(s,v)&&lateral(j))retire(v,'unlink');
    links.delete(bondKey(u,i,v,j));emit('bond-',{u,i,v,j});return original(u,i);
  });
  wrap('_event',(original,event,u,v)=>{
    const result=original(event,u,v);
    if(event==='fray')retire(u,'fray');
    if(event==='release'&&letter(s,u)){
      const unit=s.parentOf[u],e=emit('release',{u,unit,parent:unit>=0?row(unit):null});releases.set(u,e);
    }
    if(event==='birth')register(s.strandOf(u));return result;
  });
  const snapshot=()=>({...structuredClone(data),owner:[...owner],releases:[...releases],bindings:[...bindings],links:[...links]});
  return {data,sample,snapshot,detach(){for(const [k,v]of Object.entries(originals))s[k]=v;}};
}
function summary(d){
  const count=(kind,fn=()=>true)=>d.events.filter(e=>e.kind===kind&&fn(e)).length;
  const supported=e=>e.sticky&&e.supports.some(x=>x.known);
  const births=d.rows.filter(r=>!r.initial);
  return {opportunities:count('opportunity'),geometric:count('opportunity',e=>e.geometry),
    bindings:count('binding'),formationFailures:count('attempt',e=>!e.success),
    supportedLinks:count('bond+',supported),unknownSupportLinks:count('bond+',e=>e.sticky&&e.supports.some(x=>!x.known)),
    detached:births.filter(r=>r.detached).length,exact:births.filter(r=>r.exact).length,
    supportedExact:births.filter(r=>r.exact&&r.witnesses.some(id=>id!==null&&supported(d.events[id])&&
      d.events[id].supports.some(x=>x.known&&x.row===r.parent))).length};
}
module.exports={geometry,observe,summary};
