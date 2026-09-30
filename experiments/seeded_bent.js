'use strict';
// Bent chains copied by complementary shapes (COMPLEXITY_MAP 3e; user, 2026-09-30).
// Letters keep unit faces and unit laterals, so the ordinary copy chemistry (face docking, lateral linking, pins) is
// unchanged; only the letter polygons differ:
//   A, B  unit squares (straight);
//   C  = T, a triangle: laterals lean in by 30 degrees, so the chain turns 60 degrees with the face outside (convex);
//   D  = Z, the welded trapezoid of three unit triangles (face 1, laterals 1, back 2): turns the other way, face inside.
// With complementary copying (compCopy: A<->B, C<->D) a T in the template receives a Z in the copy and vice versa, so
// the copy is bent where its template is bent, and a copy of the copy restores the T. A T+Z pair is one rigid side-2
// triangle, an S+S pair a domino. The Z is one custom block standing for its three welded triangles (custom-part rule);
// building it in place from notch triangles (moulding) is the next step.
// The triangle's back is a short stub (EPS) so every letter keeps four working sides; the angles stay exact.
//   node experiments/seeded_bent.js demo SEED STEPS OUTSTEM FOUNDER [loose-json]
const {T_C,T_D,R,L,NV}=require('../src/sim');
const {createWorld,census}=require('./seeded_worlds'),{PinsLiveSim}=require('./half_cell_pins');
const {snapshot}=require('./seeded_accrete');

const C30=Math.cos(Math.PI/6),EPS=0.04;
function centred(pts){let cx=0,cy=0,A=0;for(let k=0;k<pts.length;k++){const [x0,y0]=pts[k],[x1,y1]=pts[(k+1)%pts.length],c=x0*y1-x1*y0;
  A+=c;cx+=(x0+x1)*c;cy+=(y0+y1)*c;}cx/=3*A;cy/=3*A;return pts.map(([x,y])=>[x-cx,y-cy]);}
// core convention: face F is edge 0 on the +x side (corner 0 -> 1 going +y), then R (+y side), K (back), L (-y side)
const TRI=centred([[0,-0.5],[0,0.5],[-C30*(1-EPS),EPS/2],[-C30*(1-EPS),-EPS/2]]);
const TRAP=centred([[0,-0.5],[0,0.5],[-C30,1],[-C30,-1]]);
const BENT={structural:[],shapes:{[T_C]:TRI,[T_D]:TRAP},labels:{}};

// Founders are laid down in their true bent pose: each unit's L side flush on the previous unit's R side.
function bentBase(Base){
  return class extends Base{
    seedStrand(cx,cy,ang,len,seq){
      const units=super.seedStrand(cx,cy,ang,len,seq);if(!units)return units;
      const sc=[0,0],sd=[0,0];
      for(let i=1;i<units.length;i++){const u=units[i-1],v=units[i];
        this._sideCorners(u,R,sc);const a0x=this.px[u]+this.ox[sc[0]],a0y=this.py[u]+this.oy[sc[0]],a1x=this.px[u]+this.ox[sc[1]],a1y=this.py[u]+this.oy[sc[1]];
        this._sideCorners(v,L,sd);const bx=this.ox[sd[1]]-this.ox[sd[0]],by=this.oy[sd[1]]-this.oy[sd[0]];
        const delta=Math.atan2(a0y-a1y,a0x-a1x)-Math.atan2(by,bx);this.pa[v]+=delta;this._resetShape(v);
        this.px[v]=this._wx(a0x-this.ox[sd[1]]);this.py[v]=this._wy(a0y-this.oy[sd[1]]);}
      // re-centre the founder on (cx, cy)
      let mx=0,my=0;for(const u of units){mx+=this._dx(this.px[u]-this.px[units[0]]);my+=this._dy(this.py[u]-this.py[units[0]]);}
      mx=this.px[units[0]]+mx/units.length;my=this.py[units[0]]+my/units.length;
      for(const u of units){this.px[u]=this._wx(this.px[u]+cx-mx);this.py[u]=this._wy(this.py[u]+cy-my);}
      return units;
    }
  };
}
const BentSim=bentBase(PinsLiveSim);

function demo(seed,steps,stem,founder=['PAACAAQ'],loose={A:10,B:14,C:6,D:6,P:6,Q:6},every=0){
  const {s}=createWorld({seed,founder,loose,config:BENT,Base:BentSim,size:24,params:{compCopy:true}});
  const t0=Date.now();
  snapshot(s.saveState(),`${stem}_t0.png`,`${stem.split('/').pop()} seed ${seed} t=0`,s);
  for(let t=1;t<=steps;t++){s.step();
    if(t%Math.max(1,steps/10|0)===0||t===steps){const c=census(s);
      console.log(`t=${t} chains=${c.chains.length} [${c.chains.map(q=>q.seq+(q.paired?'*':'')).join(' ')}] ${((Date.now()-t0)/t).toFixed(1)}ms/step`);}
    if(every&&t%every===0)snapshot(s.saveState(),`${stem}_t${t}.png`,`${stem.split('/').pop()} seed ${seed} t=${t}`,s);}
  snapshot(s.saveState(),`${stem}.png`,`${stem.split('/').pop()} seed ${seed} t=${steps}`,s);
  return s;
}
if(require.main===module){const [cmd,seed,steps,stem,f,lj]=process.argv.slice(2);
  if(cmd==='demo')demo(+seed,+steps,stem,f?f.split(','):undefined,lj?JSON.parse(lj):undefined,+steps/4|0);}
module.exports={BENT,TRI,TRAP,bentBase,BentSim,demo};
