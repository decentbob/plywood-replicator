'use strict';
// Wait probe (build run 20261017-1602; observation only): preload it into a pair world to measure, per head type (a
// triangle with a root: a side marked '&'), how long a head waits. Sampled every WP_DT steps (20) from WP_T0 (10000);
// a 'wait:' line every WP_EVERY steps (10000) per head type with more than 20 events: front, the mean time from a root's
// binding to its front's (the third side, neither root nor lysis side) being bound, and how many did; leave, the mean time
// from a root's binding to its cut; site, the mean time an attached head's lysis side (its site) stays empty before it
// is bound; lost, the mean time from a root's binding to the head's being left alone (no bond) with its front never
// bound (a free cell with a spent root, which nothing binds); each with the period's count. Times have the sampling's resolution.
// NODE_OPTIONS='-r ./tri/waitprobe.js' node tri/demos.js pair ...
const {TriSim,canon}=require('./sim');const T0=+(process.env.WP_T0||10000),DT=+(process.env.WP_DT||20),EVERY=+(process.env.WP_EVERY||10000);
const orig=TriSim.prototype._copy;TriSim.prototype._copy=function(){orig.call(this);if(this.t<T0||this.t%DT)return;
  const W=this._wp||(this._wp={rec:new Map(),acc:{}});const acc=(ty,k,d)=>{const a=W.acc[ty]||(W.acc[ty]={front:[0,0],leave:[0,0],site:[0,0],lost:[0,0]});a[k][0]+=d;a[k][1]++;};
  for(let u=0;u<this.n;u++){let root=-1,site=-1,front=-1;for(let i=0;i<3;i++){const k=u*3+i;if(this.done[k])root=k;else if(this.lys[k])site=k;else front=k;}
    if(root<0||site<0||front<0){W.rec.delete(u);continue;}const ty=canon(this.typeName(u));let r=W.rec.get(u);
    if(!r||r.ty!==ty){r={ty,bound:-1,fdone:false,left:false,empty:-1,lost:false};W.rec.set(u,r);}
    const rb=this.bond[root]>=0,att=rb||this.bond[front]>=0||this.bond[site]>=0;
    if(rb&&r.bound<0&&!this.spent[root]){r.bound=this.t;r.fdone=this.bond[front]>=0;}
    if(r.bound>=0&&!r.fdone&&this.bond[front]>=0){r.fdone=true;acc(ty,'front',this.t-r.bound);}
    if(r.bound>=0&&!r.left&&this.spent[root]){r.left=true;acc(ty,'leave',this.t-r.bound);}
    if(r.left&&!r.fdone&&!att&&!r.lost){r.lost=true;acc(ty,'lost',this.t-r.bound);}
    if(att&&this.bond[site]<0){if(r.empty<0)r.empty=this.t;}else if(r.empty>=0){if(this.bond[site]>=0)acc(ty,'site',this.t-r.empty);r.empty=-1;}}
  if(this.t%EVERY===0){const o=Object.entries(W.acc).filter(([,a])=>a.front[1]+a.leave[1]+a.site[1]>20).map(([ty,a])=>
    `${ty} front ${a.front[1]?(a.front[0]/a.front[1]).toFixed(0):'-'} (${a.front[1]}) leave ${a.leave[1]?(a.leave[0]/a.leave[1]).toFixed(0):'-'} (${a.leave[1]}) site ${a.site[1]?(a.site[0]/a.site[1]).toFixed(0):'-'} (${a.site[1]}) lost ${a.lost[1]?(a.lost[0]/a.lost[1]).toFixed(0):'-'} (${a.lost[1]})`);
    console.log('wait: t='+this.t+' | '+o.join(' | '));W.acc={};}};
