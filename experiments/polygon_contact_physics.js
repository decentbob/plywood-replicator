'use strict';
// Research-only convex-envelope exclusion. The copied solver below retains the
// core's kicks, pins, deformation and wrapping verbatim; see the source-copy test.
const {NV,NT,TNAME,T_E,T_X,T_M,T_A,T_B,T_C,I_DOCK,F}=require('../src/sim');
const {PortSim,hull}=require('./resource_ports');
const EPS=1e-10,TAU=2*Math.PI;
function typeParam(p, base, t, dflt) { const v = p[base + TNAME[t]]; return v === undefined ? dflt : v; }
function wrapAngle(a) { a %= TAU; if (a < 0) a += TAU; return a; }

// Minimum translation of b out of a. Exact for convex polygons, including
// containment; touching and separated projection intervals require no correction.
function separation(a,b){
  let best=null;
  for(const ps of [a,b])for(let k=0;k<ps.length;k++){
    const p=ps[k],q=ps[(k+1)%ps.length],dx=q[0]-p[0],dy=q[1]-p[1],d=Math.hypot(dx,dy);
    if(d<EPS)continue;
    const nx=dy/d,ny=-dx/d;
    const aa=a.map(p=>p[0]*nx+p[1]*ny),bb=b.map(p=>p[0]*nx+p[1]*ny);
    const plus=Math.max(...aa)-Math.min(...bb),minus=Math.max(...bb)-Math.min(...aa);
    if(plus<=EPS||minus<=EPS)return null;
    const depth=Math.min(plus,minus),sign=plus<=minus?1:-1;
    if(!best||depth<best.depth)best={depth,x:sign*nx*depth,y:sign*ny*depth};
  }
  return best;
}
class PolygonContactSim extends PortSim {
  step(){throw new Error('Physics-only fixture: chemistry and growth are not implemented');}
  _formBonds(){throw new Error('Physics-only fixture: use candidate geometry diagnostics');}
  _formBond(){throw new Error('Physics-only fixture: placement is diagnostic only');}
  _radius(u){let r=0;for(let k=u*NV,e=k+this.corners(u);k<e;k++)r=Math.max(r,Math.hypot(this.ox[k],this.oy[k]));return r;}
  _outline(u,x=0,y=0,rotation=0){
    const c=Math.cos(rotation),s=Math.sin(rotation),ps=[];
    for(let k=u*NV,e=k+this.corners(u);k<e;k++)ps.push([x+c*this.ox[k]-s*this.oy[k],y+s*this.ox[k]+c*this.oy[k]]);
    return hull(ps);
  }
  _candidate(u,v){
    const dx=this._dx(this.px[v]-this.px[u]),dy=this._dy(this.py[v]-this.py[u]);
    const tolerance=Math.max(this.p.distTol,this.p.linkDistTol)*(this.size[u]+this.size[v])/2;
    return Math.hypot(dx,dy)<=this._radius(u)+this._radius(v)+tolerance+EPS;
  }
  _shapePairs(){
    this.pairs.length=0;
    for(let u=0;u<this.n;u++)for(let v=u+1;v<this.n;v++)if(this._candidate(u,v))this.pairs.push(u,v);
    return this.pairs;
  }
  _polygonContacts(){
    const contacts=[];
    // All pairs here so later pin corrections cannot create an unexamined overlap.
    // Only the three fixture archetypes are supported; no membrane/ray exceptions.
    for(let u=0;u<this.n;u++){
      if(![T_A,T_B,T_C].includes(this.type[u]))throw new Error('Unsupported fixture type');
      for(let v=u+1;v<this.n;v++){
        if(Array.from(this.bond.subarray(u*4,u*4+4)).some(q=>q>=0&&(q>>2)===v))continue;
        contacts.push(u,v);
      }
    }
    return contacts;
  }
  _separatePair(u,v){
    const dx=this._dx(this.px[v]-this.px[u]),dy=this._dy(this.py[v]-this.py[u]);
    if(Math.hypot(dx,dy)>this._radius(u)+this._radius(v)+EPS)return;
    const move=separation(this._outline(u),this._outline(v,dx,dy));if(!move)return;
    const wu=this.w[u],wv=this.w[v],sum=wu+wv;
    this.px[u]-=move.x*wu/sum;this.py[u]-=move.y*wu/sum;
    this.px[v]+=move.x*wv/sum;this.py[v]+=move.y*wv/sum;
  }
  _slotFree(m,tx,ty,rotation=0){
    const a=this._outline(m,0,0,rotation);
    for(let v=0;v<this.n;v++)if(v!==m){
      const dx=this._dx(this.px[v]-tx),dy=this._dy(this.py[v]-ty);
      if(Math.hypot(dx,dy)>this._radius(m)+this._radius(v)+EPS)continue;
      if(separation(a,this._outline(v,dx,dy)))return false;
    }
    return true;
  }
  _physics() {
    const p = this.p, n = this.n;
    const px = this.px, py = this.py, pa = this.pa, ox = this.ox, oy = this.oy, rad = this.rad, bond = this.bond, wt = this.w, wr = this.wr, vw = this.vw;
    const W = p.W, H = p.H, gw = this.gw, gh = this.gh;
    // torus wrap: a difference well inside half the world needs none (the full formula gives the same number there, without a division)
    const hwW = 0.49 * W, hwH = 0.49 * H;
    // 1. Brownian jostling: each block translates and turns as a whole (its shape changes only under pins)
    if (p.bodyJostle) this._jostleBodies();
    else for (let u = 0; u < n; u++) {
      const ub = u * 4, slow = p.mobS !== 1 && this.type[u] !== T_E && this.type[u] !== T_X && (bond[ub] >= 0 || bond[ub + 1] >= 0 || bond[ub + 2] >= 0 || bond[ub + 3] >= 0);
      // mobility: energy mobE, rays mobX, membrane mobM (bonded or not), other bonded blocks mobS
      let mob = this.type[u] === T_M ? p.mobM : slow ? p.mobS : 1;
      if (this._mobL[this.type[u]] !== 1) mob *= this._mobL[this.type[u]];   // mobA..mobD: a letter's own mobility
      const sw = this.type[u] === T_E ? Math.sqrt(wt[u]) * p.mobE : this.type[u] === T_X ? Math.sqrt(wt[u]) * p.mobX : Math.sqrt(wt[u]) * mob;
      px[u] = this._wx(px[u] + p.sigma * sw * this._gauss()); py[u] = this._wy(py[u] + p.sigma * sw * this._gauss());
      const da = p.sigmaRot * wt[u] * mob * this._gauss(), c = Math.cos(da), s = Math.sin(da);
      pa[u] += da;
      for (let k = u * NV, e = k + this.nv[this.type[u]]; k < e; k++) { const x = ox[k], y = oy[k]; ox[k] = c * x - s * y; oy[k] = s * x + c * y; }
    }
    this._buildHash();
    // Research replacement: actual shape bounds and refreshed polygon exclusion.
    const pairs=this._shapePairs(),contacts=this._polygonContacts();
    // 3. constraints
    this._bondList();
    const pins = this.pins, soft = this._soft || (this._soft = []);
    for (let t = 0; t < NT; t++) soft[t] = t === T_E ? 0 : 1 - typeParam(p, 'stiff', t, 1);
    const bonded = this._bondedUnits || (this._bondedUnits = []); bonded.length = 0;
    const mark = this._seen;
    for (let k = 0; k < pins.length; k++) { const u = (pins[k] / NV) | 0; if (!mark[u]) { mark[u] = 1; bonded.push(u); } }
    for (const u of bonded) mark[u] = 0;
    const shaped = this._shaped || (this._shaped = new Uint8Array(n)), shapeC = this._shapeC || (this._shapeC = new Float64Array(n)), shapeS = this._shapeS || (this._shapeS = new Float64Array(n));
    for (let it = 0; it < p.iters; it++) {
      for (let k=0;k<contacts.length;k+=2) this._separatePair(contacts[k],contacts[k+1]);
      for (let k = 0; k < pins.length; k += 2) {
        // a pin brings two corners together. Each unit takes its share of the correction partly as a rigid move
        // (translate and turn: a point constraint on a rigid body) and, by its softness, partly as a deformation of
        // that one corner
        const qa = pins[k], qb = pins[k + 1], u = (qa / NV) | 0, v = (qb / NV) | 0;
        let dx = px[v] + ox[qb] - px[u] - ox[qa]; if (dx > hwW || dx < -hwW) dx -= W * Math.round(dx / W);
        let dy = py[v] + oy[qb] - py[u] - oy[qa]; if (dy > hwH || dy < -hwH) dy -= H * Math.round(dy / H);
        const dl = Math.sqrt(dx * dx + dy * dy); if (dl < 1e-9) continue;
        const nx = dx / dl, ny = dy / dl;
        const cu = ox[qa] * ny - oy[qa] * nx, cv = ox[qb] * ny - oy[qb] * nx;
        const eu = wt[u] + wr[u] * cu * cu, ev = wt[v] + wr[v] * cv * cv;
        const lam = dl / (eu + ev), su = soft[this.type[u]], sv = soft[this.type[v]];
        this._rigidMove(u, nx * lam * wt[u] * (1 - su), ny * lam * wt[u] * (1 - su), wr[u] * cu * lam * (1 - su));
        this._rigidMove(v, -nx * lam * wt[v] * (1 - sv), -ny * lam * wt[v] * (1 - sv), -wr[v] * cv * lam * (1 - sv));
        if (su > 0) { ox[qa] += nx * lam * eu * su; oy[qa] += ny * lam * eu * su; }
        if (sv > 0) { ox[qb] -= nx * lam * ev * sv; oy[qb] -= ny * lam * ev * sv; }
      }
      for (const u of bonded) {
        const t = this.type[u];
        if (soft[t] === 0 && !p.snapCorners) continue;   // rigid blocks keep their shape by moving rigidly, unless corners are snapped
        // shape matching: best-fit rotation of the rest shape onto the corners, then pull toward it by the stiffness;
        // the centre is re-read as the mean of the corners
        const o = u * NV, r = this._restSlot(u) * NV, nv = this.nv[t];
        let mx = 0, my = 0;
        for (let k = 0; k < nv; k++) { mx += ox[o + k]; my += oy[o + k]; }
        mx /= nv; my /= nv; px[u] += mx; py[u] += my;
        let A = 0, B = 0;
        for (let k = 0; k < nv; k++) { ox[o + k] -= mx; oy[o + k] -= my; A += this.rx[r + k] * ox[o + k] + this.ry[r + k] * oy[o + k]; B += this.rx[r + k] * oy[o + k] - this.ry[r + k] * ox[o + k]; }
        const hyp = Math.sqrt(A * A + B * B) || 1, c = A / hyp, s = B / hyp, a = 1 - soft[t];   // the best-fit turn (cos, sin)
        for (let k = 0; k < nv; k++) {
          const gx = c * this.rx[r + k] - s * this.ry[r + k], gy = s * this.rx[r + k] + c * this.ry[r + k];
          ox[o + k] += a * (gx - ox[o + k]); oy[o + k] += a * (gy - oy[o + k]);
        }
        shaped[u] = 1; shapeC[u] = c; shapeS[u] = s;
      }
    }
    for (const u of bonded) if (shaped[u]) { pa[u] = Math.atan2(shapeS[u], shapeC[u]); shaped[u] = 0; }   // a shaped block's angle: its last fit
    for (let u = 0; u < n; u++) { px[u] = this._wx(px[u]); py[u] = this._wy(py[u]); pa[u] = wrapAngle(pa[u]); }
    if (p.maxStrain > 0) {
      // strain: a bond whose corners the passes could not bring together lets go (applied with the rule breaks)
      const lim2 = p.maxStrain * p.maxStrain, lim2s = p.maxStrainStrand * p.maxStrainStrand, bl = this.bonds;
      for (let k = 0, q = 0; k < bl.length; k++) {
        const u = bl[k] >> 2, v = this.bond[bl[k]] >> 2;
        if (this.type[u] === T_E || this.type[v] === T_E) continue;
        const a0 = pins[q], b0 = pins[q + 1], a1 = pins[q + 2], b1 = pins[q + 3]; q += 4;
        let g = 0;
        for (const [qa, qb] of [[a0, b0], [a1, b1]]) {
          let dx = px[v] + ox[qb] - px[u] - ox[qa]; dx -= W * Math.round(dx / W);
          let dy = py[v] + oy[qb] - py[u] - oy[qa]; dy -= H * Math.round(dy / H);
          g = Math.max(g, dx * dx + dy * dy);
        }
        if (g > lim2) {
          // a lone docked monomer under strain falls off (as in undocking); a membrane bond breaks where it is; a strand's own
          // bond only past its own, higher limit; the units of a copy in progress hold each other
          const dk = (x) => x >= 0 && this.type[x] !== T_M && this.is[x] === I_DOCK && this.bond[x * 4 + F] >= 0;
          const m = dk(u) ? u : dk(v) ? v : -1;
          if (m < 0 && this.type[u] !== T_M && (lim2s === 0 || g <= lim2s)) continue;
          if (m >= 0) {
            if (this.bond[m * 4 + L] >= 0 || this.bond[m * 4 + R] >= 0) continue;   // a copy in progress holds its units (measured: breaking it costs fidelity)
            this.pendingUnlink.push(m * 4 + F); this.kicked.push(m);               // a lone docked monomer falls off, as in undocking
          } else { this.pendingUnlink.push(bl[k]); if (this.type[u] !== T_M) this.strainBackbone++; }
          this.strainEvents++; if ((bl[k] & 3) === F) this.strainFace++; this._event('snap', u, v);
        }
      }
    }
    if (p.snapCorners && pins.length) {
      // corners onto corners: every group of corners pinned together (two blocks, or three or four meeting at a point) moves
      // to its common mean, so the blocks deform just enough to meet exactly
      const groups = this._cornerGroups();
      for (const g of groups) {
        const q0 = g[0], u0 = (q0 / NV) | 0, x0 = px[u0] + ox[q0], y0 = py[u0] + oy[q0];
        let mx = 0, my = 0;
        for (const q of g) { const u = (q / NV) | 0; let dx = px[u] + ox[q] - x0; dx -= W * Math.round(dx / W); let dy = py[u] + oy[q] - y0; dy -= H * Math.round(dy / H); mx += dx; my += dy; }
        mx /= g.length; my /= g.length;
        for (const q of g) { const u = (q / NV) | 0; let dx = px[u] + ox[q] - x0; dx -= W * Math.round(dx / W); let dy = py[u] + oy[q] - y0; dy -= H * Math.round(dy / H); ox[q] += mx - dx; oy[q] += my - dy; }
      }
    }
    this._buildHash();   // retained core cache; polygon vacancy does not rely on it
    this._shapePairs();   // conservative candidates after all position/shape corrections
  }
}
module.exports={PolygonContactSim,separation,EPS};
