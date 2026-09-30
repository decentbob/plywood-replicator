'use strict';
// Accretion on the chain's back (user, 2026-09-30): the chain stays the reproduction core; its non-copying side (the
// back K of some letters) is sticky, and drifting base tiles (unit squares C, unit triangles J) weld to it and to each
// other, so appendages of emergent shape grow from whatever passes by.
//   - one weld family (f 7) with sign 0: any tile edge binds any tile edge (0 === -0), a sticky letter back binds any
//     tile edge; two letter backs never bind each other (both seeds);
//   - activation by attachment (ports engine): a weld forms only if one of the two blocks is already attached, so free
//     tiles never clump; growth starts on the chain and spreads outward edge by edge;
//   - welds pin both corners of the shared unit edge (rigid). No counters, no shape rule: form comes from which tiles
//     arrive where.
// The sequence decides WHERE appendages grow (B back sticky, A back inert); the soup decides their shapes.
//   node experiments/seeded_accrete.js demo SEED STEPS OUTSTEM [founder] [loose-json]
const fs=require('fs'),zlib=require('zlib'),path=require('path'),{execFileSync}=require('child_process');
const {T_B,T_C,T_J,NV,TNAME,F}=require('../src/sim');
const {ports,regular}=require('./seeded_ports'),{createWorld,census}=require('./seeded_worlds');
const {PinsLiveSim}=require('./half_cell_pins');

const WELD={f:7,s:0};
const allEdges=(n,lab)=>Object.fromEntries([...Array(n)].map((_,e)=>[e,lab]));
const ACCRETE={structural:[T_C,T_J],shapes:{[T_C]:regular(4,1),[T_J]:regular(3,1)},labels:{},
  edgeLabels:{[T_B]:{2:{...WELD,seed:true}},[T_C]:allEdges(4,WELD),[T_J]:allEdges(3,WELD)}};

// Read-only: tile clusters welded to each chain (size and composition), and free tiles.
function appendages(s){
  const x=s.xBond,tile=u=>s.type[u]===T_C||s.type[u]===T_J,seen=new Set(),out=[];
  for(let u=0;u<s.n;u++){if(!tile(u)||seen.has(u))continue;
    const todo=[u],cl=[];let anchored=false;seen.add(u);
    while(todo.length){const v=todo.pop();cl.push(v);
      for(let e=0;e<NV;e++){const b=x[v*NV+e];if(b<0)continue;const w=(b/NV)|0;
        if(!tile(w)){anchored=true;continue;}if(!seen.has(w)){seen.add(w);todo.push(w);}}}
    out.push({size:cl.length,sq:cl.filter(v=>s.type[v]===T_C).length,tri:cl.filter(v=>s.type[v]===T_J).length,anchored});}
  return out;
}

function snapshot(state,png,title,sim){
  if(sim){  // observation only: re-centre a clone on the first chain (periodic world) so it is not cut by the edges
    const c=sim.constructor.fromState(state),ch=census(c).chains[0];
    if(ch){const u=ch.units[ch.units.length>>1],dx=c.p.W/2-c.px[u],dy=c.p.H/2-c.py[u];
      for(let v=0;v<c.n;v++){c.px[v]=((c.px[v]+dx)%c.p.W+c.p.W)%c.p.W;c.py[v]=((c.py[v]+dy)%c.p.H+c.p.H)%c.p.H;}state=c.saveState();}}
  const f=png.replace(/\.png$/,'.json.gz');fs.writeFileSync(f,zlib.gzipSync(JSON.stringify(state)));
  execFileSync('node',[path.join(__dirname,'../tools/snapshot.js'),f,png,'--title',title],{stdio:'ignore'});return f;
}
function demo(seed,steps,stem,founder=['PBBBQ'],loose={A:10,B:10,P:5,Q:5,C:30,J:40},config=ACCRETE,every=0){
  const Base=config.reach?reach(ports(PinsLiveSim,config),config):ports(PinsLiveSim,config);
  const {s}=createWorld({seed,founder,loose,config,Base,size:26});
  const t0=Date.now(),log=[];
  for(let t=1;t<=steps;t++){s.step();
    if(t%Math.max(1,steps/10|0)===0||t===steps){const c=census(s),a=appendages(s).filter(q=>q.anchored);
      const line=`t=${t} chains=${c.chains.length} [${c.chains.map(q=>q.seq+(q.paired?'*':'')).join(' ')}] anchored clusters=${a.length} sizes=${a.map(q=>q.size).sort((p,q)=>q-p).join(',')} welds=${s.portEvents||0} ${((Date.now()-t0)/t).toFixed(1)}ms/step`;
      console.log(line);log.push(line);}
    if(every&&t%every===0)snapshot(s.saveState(),`${stem}_t${t}.png`,`${stem.split('/').pop()} seed ${seed} t=${t}`,s);}
  snapshot(s.saveState(),`${stem}.png`,`${stem.split('/').pop()} seed ${seed} t=${steps}`,s);
  return {s,log};
}
if(require.main===module){const [cmd,seed,steps,stem,f,lj]=process.argv.slice(2);
  if(cmd==='demo')demo(+seed,+steps,stem,f?f.split(','):undefined,lj?JSON.parse(lj):undefined);}
module.exports={ACCRETE,WELD,allEdges,appendages,demo,snapshot};
// Tile grammar: which edges of a base tile are sticky decides what it does in a growing appendage.
//   C square, sticky on two opposite edges: extends a rod straight;
//   J triangle, sticky on all three: branches (or bends by 60 degrees);
//   D triangle, sticky on one edge: a tip that ends a branch (a thorn).
// The same weld rule; only the edge tables differ. The soup's mixture sets the statistics of the trees.
const {T_D}=require('../src/sim');
const GRAMMAR={structural:[T_C,T_J,T_D],shapes:{[T_C]:regular(4,1),[T_J]:regular(3,1),[T_D]:regular(3,1)},labels:{},
  edgeLabels:{[T_B]:{2:{...WELD,seed:true}},[T_C]:{0:WELD,2:WELD},[T_J]:allEdges(3,WELD),[T_D]:{0:WELD}}};
module.exports.GRAMMAR=GRAMMAR;

// Reach (a relayed level, like the core's one-bond-per-pass signals): a weld label may carry lvl (a letter back's
// reach). Each tile's level is max over its welded partners of (partner level - 1), read from the previous pass;
// a letter edge contributes its label's lvl. A new weld forms only where an attached end has level >= 1, so an
// appendage extends at most lvl tiles from its letter. The letter sets the size (heritable); the drifting tiles set
// the form. A tile cut off from its source counts down to 0 and stops growing.
function reach(Base,config){
  const table=config.edgeLabels;
  return class extends Base{
    _lvl(){if(!this.lvl||this.lvl.length!==this.n)this.lvl=new Int8Array(this.n);return this.lvl;}
    _source(w,f){const t=table[this.type[w]],l=t&&t[f];if(l&&l.lvl!==undefined)return l.lvl;return this._lvl()[w];}
    _formBonds(){
      const x=this._x(),lv=this._lvl(),prev=lv.slice(),src=(w,f)=>{const t=table[this.type[w]],l=t&&t[f];return l&&l.lvl!==undefined?l.lvl:prev[w];};
      for(let u=0;u<this.n;u++){if(!config.structural.includes(this.type[u]))continue;let m=0;
        for(let e=0;e<NV;e++){const b=x[u*NV+e];if(b>=0)m=Math.max(m,src((b/NV)|0,b%NV)-1);}lv[u]=m;}
      return super._formBonds();
    }
    _portAllowed(u,e,v,f){
      // pure accretion: an attached block with reach left takes a FREE tile (no bonds at all), so two grown
      // structures never fuse (fusing locked template and copy together in the first demos)
      const au=this.xAttached(u,e),av=this.xAttached(v,f);
      if(au===av)return false;
      // a letter's back takes tiles only while its own face is free (single strand): docked letters and templates
      // being copied grow nothing, so tiles never fill the sites where copy letters must dock
      const w=au?u:v;if(!config.structural.includes(this.type[w])&&this.bond[w*4+F]>=0)return false;
      // the free partner must be a tile: appendages never capture loose letters by their backs (they ate the B supply)
      if(!config.structural.includes(this.type[au?v:u]))return false;
      return au?this._source(u,e)>=1:this._source(v,f)>=1;
    }
  };
}
// A tile set with reach: B's back reaches lvl tiles.
const REACH=(lvl=4,base=GRAMMAR)=>({...base,edgeLabels:{...base.edgeLabels,[T_B]:{2:{...WELD,seed:true,lvl}}},reach:true});
module.exports.reach=reach;module.exports.REACH=REACH;
// Hinged appendages (backlog 2): B's back takes its first tile by a hinge (one pinned corner), so the whole grown
// appendage swings about that corner under jostling: the first moving part.
const HINGED=(lvl=5,base=GRAMMAR)=>{const c=REACH(lvl,base);c.edgeLabels[T_B]={2:{...c.edgeLabels[T_B][2],hinge:true}};return c;};
module.exports.HINGED=HINGED;
// Rod arms: C squares sticky on two opposite edges (a rod), D triangles sticky on one edge (a tip).
const ROD={structural:[T_C,T_D],shapes:{[T_C]:regular(4,1),[T_D]:regular(3,1)},labels:{},
  edgeLabels:{[T_B]:{2:{...WELD,seed:true}},[T_C]:{0:WELD,2:WELD},[T_D]:{0:WELD}}};
module.exports.ROD=ROD;
// Hinge demo: one chain, one B, a rod arm grown on its back, hinged or welded. Records the arm's direction in B's frame
// (from B's centre to the arm's far end) and draws the arm poses over time on top of each other (B's frame).
function hingeDemo(seed,steps,out,hinged=true,lvl=4){
  const cfg=hinged?HINGED(lvl,ROD):REACH(lvl,ROD),Base=reach(ports(PinsLiveSim,cfg),cfg);
  const {s,founder}=createWorld({seed,founder:['PAABAAQ'],loose:{C:30,D:2},config:cfg,Base,size:16});
  const b=founder.find(u=>s.type[u]===T_B),poses=[],angles=[];
  const arm=()=>{const seen=new Set([b]),todo=[b],out=[];while(todo.length){const v=todo.pop();
    for(let e=0;e<NV;e++){const q=s.xBond[v*NV+e];if(q<0)continue;const w=(q/NV)|0;if(!seen.has(w)){seen.add(w);out.push(w);todo.push(w);}}}return out;};
  const local=(x,y)=>{const dx=s._dx(x-s.px[b]),dy=s._dy(y-s.py[b]),c=Math.cos(-s.pa[b]),sn=Math.sin(-s.pa[b]);return [c*dx-sn*dy,sn*dx+c*dy];};
  for(let t=1;t<=steps;t++){s.step();
    if(t%50===0){const a=arm();if(a.length>=2){let far=a[0],fd=0;for(const w of a){const [x,y]=local(s.px[w],s.py[w]),d=Math.hypot(x,y);if(d>fd){fd=d;far=w;}}
      const [x,y]=local(s.px[far],s.py[far]);angles.push({t,len:a.length,deg:Math.atan2(y,-x)*180/Math.PI});
      if(t%500===0)poses.push({t,tiles:a.map(w=>{const pts=[];for(let k=0;k<s.corners(w);k++)pts.push(local(s.px[w]+s.ox[w*NV+k],s.py[w]+s.oy[w*NV+k]));return {type:s.type[w],pts};})});}}}
  const chain=founder.map(u=>{const pts=[];for(let k=0;k<s.corners(u);k++)pts.push(local(s.px[u]+s.ox[u*NV+k],s.py[u]+s.oy[u*NV+k]));return {type:s.type[u],pts};});
  // picture: chain in B's frame (last pose), arm poses coloured by time (early light, late dark)
  const S=520,k=36,cx=S/2,cy=S/2,P=q=>`${(cx+q[0]*k).toFixed(1)},${(cy-q[1]*k).toFixed(1)}`,svg=[`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S+40}"><rect width="${S}" height="${S+40}" fill="#15222d"/>`];
  poses.forEach((p,i)=>{const f=i/Math.max(1,poses.length-1),col=`hsl(${200-160*f},70%,${70-25*f}%)`;
    for(const tl of p.tiles)svg.push(`<polygon points="${tl.pts.map(P).join(' ')}" fill="${col}" fill-opacity="0.25" stroke="${col}" stroke-width="0.8"/>`);});
  const fill={0:'#9cc3e6',1:'#5f8fd6',7:'#f0a35e',8:'#e4785a'};
  for(const c of chain)svg.push(`<polygon points="${c.pts.map(P).join(' ')}" fill="${fill[c.type]||'#ccc'}" stroke="#2c4452"/>`);
  const deg=angles.filter(a=>a.len>=3).map(a=>a.deg),mean=deg.reduce((x,y)=>x+y,0)/Math.max(1,deg.length),sd=Math.sqrt(deg.reduce((x,y)=>x+(y-mean)**2,0)/Math.max(1,deg.length));
  const title=`${hinged?'hinged':'welded'} arm, seed ${seed}: ${poses.length} poses (blue early to orange late); swing sd ${sd.toFixed(1)} deg`;
  svg.push(`<text x="8" y="${S+26}" font-family="Arial" font-size="12" fill="#e8eef2">${title}</text></svg>`);
  const svgf=out.replace(/\.png$/,'.svg');fs.writeFileSync(svgf,svg.join('\n'));
  const chrome=fs.readdirSync('/opt/pw-browsers').filter(d=>d.startsWith('chromium')).map(d=>`/opt/pw-browsers/${d}/chrome-linux/chrome`).find(fs.existsSync);
  execFileSync(chrome,['--headless','--no-sandbox','--disable-gpu','--hide-scrollbars',`--screenshot=${path.resolve(out)}`,`--window-size=${S},${S+40+90}`,'file://'+path.resolve(svgf)],{stdio:'ignore'});
  console.log(title,'min',Math.min(...deg).toFixed(0),'max',Math.max(...deg).toFixed(0),'n',deg.length);
  return {angles,sd};
}
module.exports.hingeDemo=hingeDemo;
