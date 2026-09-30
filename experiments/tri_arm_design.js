'use strict';
// Lattice planner for end arms (user ideas: an inward funnel, or a welded half circle around the copying side).
// Arms grow from the spare (inert) edge of each strand end by a bend pattern ('1'/'2' per step: which edge of the
// current triangle, counted counter-clockwise from its attach edge, takes the next one), exactly as the simulator's
// armProgram. For every pair of patterns, keep arms that overlap neither the chain nor the space its copy needs, and
// score where their tips end up in front of the copying face. Draws the best candidates.
//   node experiments/tri_arm_design.js GAPS [maxLen] [OUT.png]
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const {band,copyOf}=require('./triangle_alphabet_figure');
const {rolesFromGaps}=require('./tri_chain');
const [g='11111',maxLen='7',out='experiments/out/TRI_arms_design_20260930.png']=process.argv.slice(2);
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]],add=(a,b)=>[a[0]+b[0],a[1]+b[1]],cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
const close=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<1e-6,cen=v=>[(v[0][0]+v[1][0]+v[2][0])/3,(v[0][1]+v[1][1]+v[2][1])/3];
const ccw=v=>cross(sub(v[1],v[0]),sub(v[2],v[0]))>0?v:[v[0],v[2],v[1]];
// the spare edge of an end triangle: first = its entry edge, last = the edge that is neither entry nor free
const edgeEq=(e,f)=>(close(e[0],f[0])&&close(e[1],f[1]))||(close(e[0],f[1])&&close(e[1],f[0]));
const spare=(t,first)=>{if(first)return t.entry;const V=t.v;for(let k=0;k<3;k++){const e=[V[k],V[(k+1)%3]];if(!edgeEq(e,t.entry)&&!edgeEq(e,t.free))return e;}};
function grow(t,first,pat){  // arm triangles (CCW vertex lists) from end triangle t
  const P=ccw(t.v),e=spare(t,first);let k=[0,1,2].find(i=>edgeEq([P[i],P[(i+1)%3]],e));
  const p=P[k],q=P[(k+1)%3],r=P[(k+2)%3];let cur=[q,p,sub(add(p,q),r)];const arm=[cur];   // child CCW with edge 0 = attach
  for(const c of pat){const i=+c,a=cur[i],b=cur[(i+1)%3],o=cur[(i+2)%3];cur=[b,a,sub(add(a,b),o)];arm.push(cur);}
  return arm;}
if(require.main===module){
const tris=band(rolesFromGaps([...g].map(Number))),copy=copyOf(tris),body=[...tris.map(t=>t.v),...copy.map(t=>t.v)];
const hit=(A,B)=>A.some(a=>B.some(b=>Math.hypot(...sub(cen(a),cen(b)))<0.5));
// face side: normal of the chain axis pointing to the copy
const c0=cen(tris[0].v),c1=cen(tris[tris.length-1].v),ax=sub(c1,c0),L=Math.hypot(...ax),dir=[ax[0]/L,ax[1]/L];
let nrm=[-dir[1],dir[0]];const cc=cen(copy[0].v);if((cc[0]-c0[0])*nrm[0]+(cc[1]-c0[1])*nrm[1]<0)nrm=[-nrm[0],-nrm[1]];
const side=p=>(p[0]-c0[0])*nrm[0]+(p[1]-c0[1])*nrm[1],along=p=>((p[0]-c0[0])*dir[0]+(p[1]-c0[1])*dir[1])/L;
const pats=[];for(let n=2;n<=+maxLen;n++)for(let m=0;m<(1<<n);m++)pats.push([...Array(n)].map((_,k)=>(m>>k)&1?'2':'1').join(''));
const clr=arm=>arm.slice(+(process.env.CLEAR_FROM||3)).every(x=>copy.every(t=>Math.hypot(...sub(cen(x),cen(t.v)))>1.1));
const MODE=process.env.MODE||'funnel',want=a=>MODE==='shell'?side(cen(a.arm[a.arm.length-1]))<=-2:side(cen(a.arm[a.arm.length-1]))>=2;
const ok=(first)=>pats.map(p=>({p,arm:grow(first?tris[0]:tris[tris.length-1],first,p)})).filter(a=>clr(a.arm)&&want(a)&&!hit(a.arm,body)&&!a.arm.some((x,i)=>a.arm.some((y,j)=>j>i&&Math.hypot(...sub(cen(x),cen(y)))<0.5)));
const S=ok(true),E=ok(false),cands=[],mir=p=>[...p].map(c=>c==='1'?'2':'1').join('');
const Emap=new Map(E.map(e=>[e.p,e]));
for(const a of S){const b=Emap.get(mir(a.p));if(!b||hit(a.arm,b.arm))continue;   // the other end grows the mirror pattern
  const ta=cen(a.arm[a.arm.length-1]),tb=cen(b.arm[b.arm.length-1]),gap=Math.hypot(...sub(ta,tb));
  cands.push({a:a.p,b:b.p,gap,depth:Math.min(Math.abs(side(ta)),Math.abs(side(tb))),arms:[a.arm,b.arm],n:a.arm.length+b.arm.length,span:Math.abs(along(ta)-along(tb))});}
// shade: mean exposure of the chain's triangles with the arms as walls (the field's ray rule: 16 directions, range 3)
const {crosses}=require('./seeded_field');
const expo=walls=>{let tot=0;for(const t of tris){const c=cen(t.v);let open=0;
    for(let k=0;k<16;k++){const a=2*Math.PI*(k+0.5)/16,bx=c[0]+3*Math.cos(a),by=c[1]+3*Math.sin(a);if(!walls.some(w=>crosses(c[0],c[1],bx,by,w)))open++;}tot+=open/16;}
  return tot/tris.length;};
if(MODE==='shell')for(const c of cands)c.expo=expo(c.arms.flat());
// funnel: mouth wider than the chain (the copy can leave); shell: tips close behind the chain
const pick=MODE==='shell'?[...cands].sort((x,y)=>(x.expo+0.01*x.n)-(y.expo+0.01*y.n)):cands.filter(c=>c.span>1.15).sort((x,y)=>x.n-y.n||y.depth-x.depth);
console.log(MODE,'start arms ok',S.length,'mirror pairs',cands.length,'picked',pick.length);
for(const c of pick.slice(0,8))console.log(`${MODE}: start ${c.a} end ${c.b}, tips ${c.gap.toFixed(2)} apart, depth ${c.depth.toFixed(2)}, ${c.n} triangles${c.expo!==undefined?', chain exposure '+c.expo.toFixed(2):''}`);
if(MODE==='shell')console.log('no arms: chain exposure',expo([]).toFixed(2));
const half=MODE==='shell'?pick.slice(0,4):[],funnel=MODE==='funnel'?pick.slice(0,4):[];
// draw
const W=1500,H=560,parts=[`<rect width="${W}" height="${H}" fill="#fbfaf7"/>`];
const draw=(ox,oy,sc,c,title)=>{const V=p=>[ox+(p[0]-(c0[0]+c1[0])/2)*sc,oy-(p[1]-(c0[1]+c1[1])/2)*sc],poly=(v,f)=>parts.push(`<polygon points="${v.map(p=>V(p).map(z=>z.toFixed(1)).join(',')).join(' ')}" fill="${f}" stroke="#333" stroke-width="1"/>`);
  for(const t of tris)poly(t.v,t.role==='F'?'#f6cf8a':'#c98f2e');for(const t of copy)poly(t.v,'#e8f4f2');
  for(const arm of c.arms)for(const v of arm)poly(v,'#b58ae6');
  parts.push(`<text x="${ox}" y="${oy+170}" font-family="Arial" font-size="14" text-anchor="middle">${title}</text>`);};
[...half,...funnel].forEach((c,i)=>draw(190+i*370,280,28,c,`${MODE}: ${c.a} / ${c.b} (${c.n} triangles)`));
parts.push(`<text x="20" y="30" font-family="Arial" font-size="20" font-weight="bold">End arms planned on the lattice for chain ${g}: pale teal = space the copy needs, purple = arms</text>`);
fs.writeFileSync(out.replace(/\.png$/,'.svg'),`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${parts.join('')}</svg>`);
const chrome=fs.readdirSync('/opt/pw-browsers').filter(d=>d.startsWith('chromium')).map(d=>`/opt/pw-browsers/${d}/chrome-linux/chrome`).find(fs.existsSync);
execFileSync(chrome,['--headless','--no-sandbox','--disable-gpu','--hide-scrollbars',`--screenshot=${path.resolve(out)}`,`--window-size=${W},${H+90}`,'file://'+path.resolve(out.replace(/\.png$/,'.svg'))],{stdio:'ignore'});
}
module.exports={grow};
