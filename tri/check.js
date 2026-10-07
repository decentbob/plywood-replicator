'use strict';
// Capability checks: one line per capability that ROADMAP's module table marks as working (plus partial ones, which
// report but do not fail). Each check runs an existing demo (tri/demos.js, pictures off) on fixed seeds and reads the
// demo's own last report line; a capability claimed "N of 4 worlds" needs that many seeds to pass.
//   node tri/check.js [name ...]     (names: the `id` column; default all; at most 4 processes; about 85 minutes, budcycle-3 the longest;
//   each check prints when its last world finishes, so lines come in finishing order; CHECK_SAVE=dir keeps each world's
//   whole output there, e.g. to show that a change leaves outputs byte for byte the same)
// Exit code 1 if a working capability fails.
const {spawn}=require('child_process'),path=require('path');
const num=(L,re)=>{const m=L.match(re);return m?+m[1]:NaN;};
const count=(L,re)=>(L.match(re)||[]).length;
// each check: id, capability, demo name, seeds, steps, extra, env (variables for the demo), need (seeds that must pass), secs (rough time per world,
// for scheduling), pass(last report line, all output) -> [ok, short evidence]; partial: reported, never fails
const CHECKS=[
  // retired 2026-10-04 (autorun run 20261004-0820, core-review: heldCopy became the rule; INNOVATIONS keeps their
  // entries, git `882b7d4` their code): imprint-cell(-n) and imprint-held(-c) (superseded by imprint-pore, which holds
  // its founder), imprint-hood and imprint-held-w (pore leaks: leaked strands are sterile now), budpore, budpore-c,
  // budpore-held, budpore-kind (doorway pairs: the corner bud needs no doorway), budpool-e (the sealed pair's last
  // cell), budcycle-2 (two generations with the pool harness: budcycle-free has none). Retired 2026-10-05 (run
  // 20261005-0251, cleanup; code in git `a2f3914`): budcycle (one generation of the doorway kind with budpool's harness:
  // budcycle-3 shows the same steps three times in the default setup, the corner bud without harness)
  {id:'copy',cap:'Genome: typed chain copying (zip; the founder held by its high end)',demo:'copy',seeds:[1,2,3,4],need:3,steps:20000,secs:8,
    pass:L=>{const n=count(L,/BBAABA\//g);return [n>=2,`${n} complete copies BBAABA`];}},
  {id:'ring',cap:'Membrane growth: ring kit closes (R=3)',demo:'ring',seeds:[1,2,3,4],need:3,steps:60000,extra:'3',secs:8,
    pass:L=>{const m=L.match(/closed=at (\d+)/);return [!!m,m?`closed at ${m[1]}`:'open '+(L.match(/cells=(\S+)/)||[])[1]];}},
  {id:'imprint',cap:'Contact copying: a ring with one of each part closes, a second grows from copies',demo:'imprint',seeds:[1,2,3,4],need:3,steps:200000,secs:180,
    pass:(L,o)=>{const m=o.match(/result: ring cells (\d+) (\d+) of 30, closed at (\S+) \/ (\S+)/);return [!!m&&m[3]!=='not'&&m[4]!=='not',m?`rings ${m[1]}/${m[2]} cells, closed ${m[3]} / ${m[4]}`:'no result'];}},
  {id:'imprint-genome',cap:'Contact copying: a strand copied from copies of its own triangles',demo:'imprint',seeds:[1,2,3,4],need:3,steps:30000,extra:'g',secs:25,
    pass:(L,o)=>{const n=num(o,/result: (\d+) free strands/);return [n>=4,`${n} strands`];}},
  {id:'imprint-genome-c',cap:'  control: plain blanks, no copies',demo:'imprint',seeds:[1],steps:30000,extra:'gc',secs:15,
    pass:(L,o)=>{const n=num(o,/result: (\d+) free strands/);return [n===1,`${n} strands`];}},
  {id:'imprint-pore',cap:'A cell fed through a pore: copy blanks from outside copy only its held genome (spent walls); 3 rival strands outside stay sterile',demo:'imprint',seeds:[1,2,3,4],need:3,steps:100000,extra:'150px',secs:70,
    pass:(L,o)=>{const m=o.match(/result: (\d+) free strands \(founder included\), (\d+) inside, copies (\d+): genome (\d+), wall (\d+)/);return [!!m&&+m[2]>=4&&+m[5]===0,m?`${m[2]} strands inside (${m[1]} in all), copies to genome ${m[4]}, wall ${m[5]}`:'no result'];}},
  {id:'imprint-pore-c',cap:'  control: no pore, no blank gets in',demo:'imprint',seeds:[1],steps:60000,extra:'150pc',secs:40,
    pass:(L,o)=>{const m=o.match(/result: (\d+) free strands \(founder included\), (\d+) inside, copies (\d+)/);return [!!m&&+m[3]===0&&+m[1]===1,m?`${m[1]} strand, ${m[3]} copies`:'no result'];}},
  {id:'imprint-pore-n',cap:'  control: plain walls take the blanks',demo:'imprint',seeds:[1],steps:60000,extra:'150pn',secs:40,
    pass:(L,o)=>{const m=o.match(/result: (\d+) free strands \(founder included\), (\d+) inside, copies (\d+): genome (\d+), wall (\d+)/);return [!!m&&+m[2]<=2&&+m[5]>+m[4],m?`${m[2]} inside, copies to genome ${m[4]}, wall ${m[5]}`:'no result'];}},
  {id:'budpool',cap:'The closure kind\'s bud grows from a pool of its 47 part types (8 each, 40 of the last; 8 blanks), splits on a stand-in catch',demo:'budpool',seeds:[1,2,3,4],need:3,steps:250000,secs:220,
    pass:(L,o)=>{const m=o.match(/result: cells=(\d+)\/47 complete=(\S+) split=(\S+) refilled=\S+ copies=(\d+) .*stray=(\d+)/);return [!!m&&m[3]!=='not'&&+m[5]===0,m?`${m[1]}/47 cells, split ${m[3]}, ${m[4]} copies, ${m[5]} stray`:'no result'];}},
  // run 20261005-2320 (build): the pair (pairKit, 2 cells, 2 types; IDEAS "Sources in proportion to use"): one founder
  // among 300 copy blanks (world 30, openRange 1) grows to 20 bodies; control: the side order first written in IDEAS
  // (S 'B@y-|': its seed site is its only source, covered by a waiting bud) never reaches the pair's 20 bodies (5 by 5000 steps)
  {id:'pair',cap:'The pair: one founder among 300 copy blanks grows to 20 bodies (2 cells, 2 types; no free parts)',demo:'pair',seeds:[1,2,3,4],need:3,steps:3000,secs:12,
    pass:(L,o)=>{const m=o.match(/result: bodies=(\d+) reached20=(\S+) gen=(\d+) .*copiesR=(\d+) copiesS=(\d+)/);return [!!m&&m[2]!=='not',m?`20 bodies at ${m[2]}, ${m[1]} at the end, generation ${m[3]}, copies R ${m[4]} S ${m[5]}`:'no result'];}},
  // run 20261006-1920 (core-review): one range for every length. Strips of 2 to 5 cells (structures strip(k), one
  // founder each among 300 blanks, world 30) at the core's default openRange (120): every '&' release lets go a complete
  // individual. On main before the rule (the open signal crossing '&' joints, a caught part emitting one pass late), 3- to
  // 5-cell roots let go incomplete at small ranges and 4- and 5-cell kinds stall at large ones (RULES, Core changes)
  {id:'strips',cap:'One range for every length: strips of 2 to 5 cells bud and every release is complete (default openRange)',demo:'strip',seeds:[1,2,3,4],need:3,steps:6000,extra:'2345',secs:30,
    pass:L=>{const m=[...L.matchAll(/k(\d)=(\d+)\/(\d+)\//g)];return [m.length===4&&m.every(x=>+x[2]>=5&&+x[3]===0),m.map(x=>`${x[1]} cells ${x[2]} complete, ${x[3]} incomplete`).join(', ')||'no result'];}},
  {id:'pair-c',cap:'  control: S\'s seed site its only source (S B@y-|, R Y@&b@-)',demo:'pair',seeds:[1],steps:5000,secs:20,env:{PAKS:'B@y-|',PAKR:'Y@&b@-'},
    pass:(L,o)=>{const m=o.match(/result: bodies=(\d+) .*freeR=(\d+) freeS=(\d+)/);return [!!m&&+m[1]<20,m?`${m[1]} bodies, free R ${m[2]}, free S ${m[3]}`:'no result'];}},
  // run 20261006-0251 (build): Direction 1 on the pair, a world that runs on. 1000 copy blanks in world 50 and two labelled
  // drives from step 1000 on: every 100 steps each body is hit with probability 0.6 (lysis into its two parts) and each
  // free part becomes a blank with probability 1, so new bodies are built from fresh copies, not from a dead body's parts.
  // Passes a world still budding in its last 1000 steps with at least 20 bodies, generation 100 or more, R and S copied
  // within a factor 1.5 of each other and at least half of the parts born fresh copies (about 285 bodies; at h 0.7, 50-190
  // bodies, 2 of 4 worlds die out by 10^6 steps, at 0.8 all: INNOVATIONS run 0251)
  {id:'pair-run',cap:'The pair runs on: bodies die (hazard) and free parts decay into blanks (labelled drives); births keep up for 100k steps, generations accumulate',demo:'pair',seeds:[1,2,3,4],need:3,steps:100000,secs:300,env:{PAB:'1000',PAS:'50',PAHT:'1000',PAH:'0.6',PAD:'1'},
    pass:(L,o)=>{const m=o.match(/result: bodies=(\d+) .*gen=(\d+) .*copiesR=(\d+) copiesS=(\d+) .* alive=(\d+) deaths=(\d+) .*fresh=(\S+) lastBirth=(\d+)/);if(!m)return [false,'no result'];
      const q=+m[3]/Math.max(1,+m[4]),ok=+m[5]>=20&&+m[8]>=99000&&+m[2]>=100&&q<=1.5&&q>=1/1.5&&+m[7]>=0.5;
      return [ok,`${m[5]} alive, ${m[1]} born, ${m[6]} died, generation ${m[2]}, last birth ${m[8]}, copies R:S ${q.toFixed(2)}, fresh ${m[7]}`];}},
  // run 20261006-0450 (explore): Direction 2, heritable variation on the pair world (pair-run's setting, no rule change).
  // Selection: at step 20000, 1 in 10 S get a seed site without its anchor mark (copied while no bud sits on it: two
  // sources instead of one); passes a world where at least 90% of the S in bodies carry it 40000 steps later (4 of 4
  // fixed by 50k in run 0450; neutral expectation: fixation in 1 of 10 worlds, after about 100k steps). Control: a neutral
  // marker (glue x on R's plain side) put into 1 in 10 R never fixes by then. Variation: a labelled mutagen (each free
  // part, with probability 0.01 per 100 steps, one side's glue or mark changed) and the hazard per triangle: an exposure
  // variant (seed site or front without its anchor) arises and is in more than half the S or R at a census (every 5000
  // steps) by 100k steps (later the pair-like parts may be gone: binding variants take over, INNOVATIONS run 0450)
  {id:'pair-sel',cap:'Selection on the pair: a seed site copied while free (S without its anchor mark), put into 1 in 10 S, spreads to 90% of S in 40k steps',demo:'pair',seeds:[1,2,3,4],need:3,steps:60000,secs:130,env:{PAB:'1000',PAS:'50',PAHT:'1000',PAH:'0.6',PAD:'1',PAV:'mix',PAVP:'0.1',PAVK:'seed',PAVT:'20000',PAP:'5000'},
    pass:(L,o)=>{const m=o.match(/marker: .*openSeed=(\S+) openFront=(\S+)/);return [!!m&&+m[1]>=0.9,m?`open seed sites ${m[1]} of S in bodies at 60k (1 in 10 at 20k)`:'no result'];}},
  {id:'pair-sel-c',cap:'  control: a neutral marker in 1 in 10 R does not fix in the same time',demo:'pair',seeds:[1,2,3,4],need:3,steps:60000,secs:130,env:{PAB:'1000',PAS:'50',PAHT:'1000',PAH:'0.6',PAD:'1',PAV:'mix',PAVP:'0.1',PAVT:'20000',PAP:'5000'},
    pass:(L,o)=>{const m=o.match(/marker: lost=(\S+) fixed=(\S+)/),v=[...o.matchAll(/var: t=\d+ alive \d+ marked \d+ share (\S+)/g)].pop();return [!!m&&m[2]==='not',m?`marker ${m[1]!=='not'?'lost at '+m[1]:m[2]!=='not'?'fixed at '+m[2]:'share '+(v?v[1]:'-')+' at 60k'}`:'no result'];}},
  {id:'pair-mut',cap:'Variation on the pair: under a labelled mutagen an exposure variant arises and spreads to most bodies (hazard per triangle)',demo:'pair',seeds:[1,2,3,4],need:3,steps:100000,secs:300,env:{PAB:'1000',PAS:'50',PAHT:'1000',PAH:'0.6',PAD:'1',PAM:'0.01',PAHU:'1',PAP:'5000'},
    pass:(L,o)=>{const m=o.match(/result: openSeed=(\S+) openFront=(\S+) mutated=(\d+) copies=(\d+)/),c=[...o.matchAll(/mut: t=(\d+) .*openSeed (\S+) openFront (\S+)/g)];
      const at=k=>{const x=c.find(q=>+q[k]>0.5);return x?x[1]:'not';},sd=at(2),fr=at(3);
      return [!!m&&(sd!=='not'||fr!=='not'),m?`most S with open seed sites at ${sd}, most R with open fronts at ${fr}; at 100k ${m[1]}, ${m[2]} ('-': no pair-like part left), ${m[3]} parts mutated, ${m[4]} copies`:'no result'];}},
  // run 20261006-1150 (build): Direction 3, two kinds on one supply. The flowing world without the mutagen at a hazard both
  // kinds survive alone (h 0.1 per triangle, decay 1, PAHB=2, openRange 3: before run 20261006-1920 a 3-cell bud let go of its
  // parent at openRange 1 or 2 when its second cell bound; since then any openRange of 2 or more serves), the pair against a 3-cell strip 'Z@&c@|- C@d@|- D@-z|' (own letters: they share only
  // blanks and space). Alone the pair draws free blanks to about 11, the strip to about 100 (it wastes three quarters of its
  // copies), so the pair should win from any start: from one founder each (duo), entering an established strip world
  // (duo-inv: 5 pair founders at 30k), and a strip cannot enter a pair world (duo-inv-c: 5 strip founders at 30k)
  ...(()=>{const env={PAB:'1000',PAS:'50',PAHT:'4000',PAHB:'2',PAHU:'1',PAP:'5000',PAR:'3',PAD:'1',PAH:'0.1',PA2:'Z@&c@|- C@d@|- D@-z|'},
    res=o=>o.match(/duo: pair=(\S+) mean2=(\S+) strip=(\S+) mean2=(\S+)/),at=(o,t,k)=>{const m=o.match(new RegExp(`duo: t=${t} pair (\\d+) .*\\| strip (\\d+) `));return m?+m[k]:NaN;};
    return [
  {id:'duo',cap:'Two kinds on one supply: the pair and a 3-cell strip from one founder each; the pair takes the material and the strip dies out',demo:'pair',seeds:[1,2,3,4],need:3,steps:20000,secs:100,env,
    pass:(L,o)=>{const m=res(o);if(!m)return [false,'no result'];return [m[1]==='alive'&&m[3]!=='alive'&&+m[2]>=200,`pair ${m[1]} (mean ${m[2]} in the second half), strip ${m[3]}`];}},
  {id:'duo-inv',cap:'  5 pairs entering an established strip world (100+ strips) drive it extinct',demo:'pair',seeds:[1,2,3,4],need:3,steps:50000,secs:250,env:{...env,PA1T:'30000',PAEN:'5'},
    pass:(L,o)=>{const m=res(o),n=at(o,30000,2);if(!m)return [false,'no result'];return [n>=100&&m[1]==='alive'&&m[3]!=='alive',`${n} strips before entry; pair ${m[1]}, strip ${m[3]}`];}},
  {id:'duo-inv-c',cap:'  5 strips entering a pair world die out',demo:'pair',seeds:[1,2,3,4],need:3,steps:40000,secs:200,env:{...env,PA2T:'30000',PAEN:'5'},
    pass:(L,o)=>{const m=res(o),n=at(o,30000,1);if(!m)return [false,'no result'];return [n>=200&&m[1]==='alive'&&m[3]!=='alive',`${n} pairs before entry; strip ${m[3]}`];}},
  ];})(),
  // run 20261006-1620 (build): a second resource only the longer kind can use. Copying is glue-blind, so a resource only
  // one kind can use is a stock of parts it binds by glue (PAF: never decays, returns as itself when lysed). The strip
  // 'Z@&c@|- C@d@|-| D@-|z|' takes its middle and last cells from a stock of 400 each (closed exposed sides: never
  // copied), so it needs one blank per birth. With a hazard per individual (PAHU=0) it coexists with the pair from one
  // founder each (duo-stock) and when pairs enter its world (duo-stock-inv); the plain strip dies out under the same hazard
  // (duo-stock-c), the stock strip under a hazard per triangle (duo-stock-tri); a stock of 600 drives the pair out (duo-stock-hi)
  ...(()=>{const env={PAB:'1000',PAS:'50',PAHT:'4000',PAHB:'2',PAHU:'0',PAP:'5000',PAR:'3',PAD:'1',PAH:'0.1',PA2:'Z@&c@|- C@d@|-| D@-|z|',PAF:'C@d@|-|:400 D@-|z|:400'},
    res=o=>o.match(/duo: pair=(\S+) mean2=(\S+) strip=(\S+) mean2=(\S+)/),at=(o,t,k)=>{const m=o.match(new RegExp(`duo: t=${t} pair (\\d+) .*\\| strip (\\d+) `));return m?+m[k]:NaN;};
    return [
  {id:'duo-stock',cap:'A second resource pays for length: a 3-cell strip whose extra cells come from a stock the pair cannot bind coexists with the pair (hazard per individual)',demo:'pair',seeds:[1,2,3,4],need:3,steps:40000,secs:300,env,
    pass:(L,o)=>{const m=res(o);if(!m)return [false,'no result'];return [m[1]==='alive'&&m[3]==='alive'&&+m[2]>=50&&+m[4]>=150,`pair ${m[1]} (mean ${m[2]} in the second half), strip ${m[3]} (mean ${m[4]})`];}},
  {id:'duo-stock-inv',cap:'  5 pairs entering an established stock-strip world settle beside it',demo:'pair',seeds:[1,2,3,4],need:3,steps:60000,secs:450,env:{...env,PA1T:'30000',PAEN:'5'},
    pass:(L,o)=>{const m=res(o),n=at(o,30000,2);if(!m)return [false,'no result'];return [n>=150&&m[1]==='alive'&&m[3]==='alive'&&+m[4]>=150,`${n} strips before entry; pair ${m[1]} (mean ${m[2]}), strip mean ${m[4]}`];}},
  {id:'duo-stock-c',cap:'  control: the plain strip (every cell copied, no stock) under the same hazard dies out',demo:'pair',seeds:[1,2,3,4],need:3,steps:20000,secs:120,env:{...env,PA2:'Z@&c@|- C@d@|- D@-z|',PAF:''},
    pass:(L,o)=>{const m=res(o);if(!m)return [false,'no result'];return [m[1]==='alive'&&m[3]!=='alive',`pair ${m[1]} (mean ${m[2]}), strip ${m[3]}`];}},
  {id:'duo-stock-tri',cap:'  control: with a hazard per triangle (three at risk against two) the pair drives the stock strip out',demo:'pair',seeds:[1,2,3,4],need:3,steps:40000,secs:300,env:{...env,PAHU:'1'},
    pass:(L,o)=>{const m=res(o);if(!m)return [false,'no result'];return [m[1]==='alive'&&m[3]!=='alive',`pair ${m[1]} (mean ${m[2]}), strip ${m[3]}`];}},
  {id:'duo-stock-hi',cap:'  a stock of 600 each: the strip drives the pair out (or nearly)',demo:'pair',seeds:[1,2,3,4],need:3,steps:40000,secs:300,env:{...env,PAF:'C@d@|-|:600 D@-|z|:600'},
    pass:(L,o)=>{const m=res(o),n=at(o,40000,1);if(!m)return [false,'no result'];return [m[3]==='alive'&&n<=10,`pair ${n} at 40k (${m[1]}), strip mean ${m[4]}`];}},
  ];})(),
  // run 20261006-1750 (explore): heritable diets. A 2-cell kind 'Z@&c@|- C@-|z|' (one copy, one stock part per birth)
  // among stocks C, E, G (150 each) and a labelled mutagen limited to front glues (PAMF=1, letters c..h): mutants whose
  // front catches an unused stock arise, spread and live beside the founder's diet (diets); without the mutagen one diet
  // (diets-c); with only the founder's stock no mutant diet spreads (diets-ns)
  ...(()=>{const env={PAB:'1000',PAS:'50',PAHT:'4000',PAHB:'2',PAHU:'0',PAP:'5000',PAR:'3',PAD:'1',PAH:'0.1',PA1:'0',PA2:'Z@&c@|- C@-|z|',PAMF:'1',PAM:'0.01',PAMA:'cdefgh',PAF:'C@-|z|:150 E@-|z|:150 G@-|z|:150'},
    res=o=>{const m=o.match(/diets: maxHeld=(\d+) at \S+ first=(\S+) mean2=(\S+)/);if(!m)return null;const mean={};for(const w of m[3].split(','))if(w.includes(':'))mean[w.split(':')[0]]=+w.split(':')[1];return {held:+m[1],first:m[2],mean};},
    big=r=>Object.entries(r.mean).filter(([,v])=>v>=50).map(([L])=>L).join(''),ev=r=>`most diets held at once ${r.held}, first held ${r.first}, mean ${Object.entries(r.mean).map(([L,v])=>L+' '+v).join(', ')}`;
    return [
  {id:'diets',cap:'Heritable diets: mutant fronts that catch an unused stock arise, spread and live beside the founder\'s diet',demo:'pair',seeds:[1,2,3,4],need:3,steps:60000,secs:330,env,
    pass:(L,o)=>{const r=res(o);if(!r)return [false,'no result'];return [r.held>=2&&big(r).length>=2,ev(r)];}},
  {id:'diets-c',cap:'  control: without the mutagen the founder\'s diet stays alone',demo:'pair',seeds:[1,2,3,4],need:3,steps:30000,secs:150,env:{...env,PAM:'0'},
    pass:(L,o)=>{const r=res(o);if(!r)return [false,'no result'];return [r.held===1&&big(r)==='c',ev(r)];}},
  {id:'diets-ns',cap:'  control: with only the founder\'s stock no mutant diet spreads',demo:'pair',seeds:[1,2,3,4],need:3,steps:30000,secs:150,env:{...env,PAF:'C@-|z|:150'},
    pass:(L,o)=>{const r=res(o);if(!r)return [false,'no result'];return [r.held===1&&big(r)==='c',ev(r)];}},
  ];})(),
  // run 20261006-2350 (build): length by mutation shrinks. A 3-cell founder whose middle is copied ('Z@&c@|- C@e@|-
  // E@-|z|', openRange 9) among stocks E and G and the front mutagen (a..z): the founder fills its stock first, then
  // 2-cell kinds whose root front catches a stock directly (one mutation: the shortcut) replace it; no individual of 3
  // or more cells is left at 60k (IDEAS "Joints make individuals")
  {id:'ladder',cap:'Length by mutation shrinks: from a 3-cell founder with a copied middle, 2-cell shortcut kinds (the root catching the stock) replace it',demo:'pair',seeds:[1,2,3,4],need:3,steps:60000,secs:300,
    env:{PAB:'1000',PAS:'50',PAHT:'4000',PAHB:'2',PAHU:'0',PAP:'5000',PAR:'9',PAD:'1',PAH:'0.1',PA1:'0',PA2:'Z@&c@|- C@e@|- E@-|z|',PAMF:'1',PAF:'E@-|z|:150 G@-|z|:150',PAM:'0.02'},
    pass:(L,o)=>{const m=o.match(/kinds: endLong=\S+ maxLong=(\S+) longest=(\d+) endByCells=(\S+)/);if(!m)return [false,'no result'];const c={};for(const w of m[3].split(','))if(w.includes(':'))c[w.split(':')[0]]=+w.split(':')[1];
      const f=(m[1].match(/(?:^|,)ce:(\d+)/)||[])[1]||0,long=Object.entries(c).filter(([k])=>+k>=3).reduce((a,[,v])=>a+v,0);
      return [f>=50&&long<=5&&(c[2]||0)>=30,`founder held up to ${f}; at 60k ${c[2]||0} individuals of 2 cells, ${long} of 3 or more; longest ever ${m[2]} cells`];}},
  // run 20261006-0621 (build): a world that keeps evolving. pair-mut's setting plus a labelled drive: every lysed triangle
  // returns as a copy blank once free (PAHB=2), so material held by binding variants flows through copying at the
  // hazard's rate. Passes a world with bodies at 200k, at least 10k copies in the last 5000 steps and a variant type first
  // seen after 100k that was in a tenth of the bodies at some census (a late sweep). Control: without the drive, seeds 3
  // and 4 lock (binding variants hold the material: under 10k copies per 5000 steps; INNOVATIONS run 0450). In a 3x world
  // (3000 blanks, world 87) 4 of 4 to 300k, too slow for a check (about 25 minutes per world; INNOVATIONS run 0621)
  {id:'pair-flow',cap:'A pair world that keeps evolving: dead material returns as blanks (labelled drive), copying goes on and new variants still sweep at 200k',demo:'pair',seeds:[1,2,3,4],need:3,steps:200000,secs:200,env:{PAB:'1000',PAS:'50',PAHT:'1000',PAH:'0.6',PAD:'1',PAM:'0.01',PAHU:'1',PAP:'5000',PAHB:'2'},
    pass:(L,o)=>{const m=o.match(/evolving: bodies=(\d+) kinds=(\d+) common=(\d+) lateCommon=(\d+) copiesLast=(\d+) blanks=(\d+)/);if(!m)return [false,'no result'];
      return [+m[1]>0&&+m[5]>=10000&&+m[4]>=1,`${m[1]} bodies of ${m[2]} kinds, ${m[5]} copies in the last 5000 steps, blanks ${m[6]}; ${m[3]} variant types in a tenth of the bodies, ${m[4]} of them new after 100k`];}},
  {id:'pair-flow-c',cap:'  control: without the drive binding variants lock the material (under 10k copies per 5000 steps at 200k)',demo:'pair',seeds:[3,4],steps:200000,secs:200,env:{PAB:'1000',PAS:'50',PAHT:'1000',PAH:'0.6',PAD:'1',PAM:'0.01',PAHU:'1',PAP:'5000'},
    pass:(L,o)=>{const m=o.match(/evolving: bodies=(\d+) kinds=(\d+) common=(\d+) lateCommon=(\d+) copiesLast=(\d+) blanks=(\d+)/);if(!m)return [false,'no result'];
      return [+m[5]<10000,`${m[5]} copies in the last 5000 steps, blanks ${m[6]}, ${m[1]} bodies`];}},
  // run 20261006-1322 (explore): heredity of combinations by locality. A parasite S (seed site q, no anchor: copied at two
  // sides, never buds) put into 1 in 10 S at 20k (labelled start) in the flow world without mutagen. A newborn's S comes
  // from its own parent with share s (PAPS); the parasite (k = 2 copy sources) can spread only if (1 - s) k > 1, to a share
  // near ((1 - s) k - 1) / (k - 1). Free parts decaying every 10 steps at hazard 0.3: s about 0.58, the parasite dies out;
  // every 100 steps: s about 0.25, it holds near half the bodies; the first world stirred (PAMX, labelled): s about 0.22,
  // it spreads and the hosts crash
  ...(()=>{const env={PAB:'1000',PAS:'50',PAHT:'1000',PAH:'0.3',PAD:'1',PAHU:'1',PAHB:'2',PAP:'2000',PAV:'mix',PAVP:'0.1',PAVK:'parasite',PAVT:'20000'},
    res=o=>o.match(/parental: births=\d+ R=(\S+) S=(\S+) .*alive=(\d+) .*copiesParasite=(\d+)(?: parasite ([0-9.]+))?/),
    peak=o=>Math.max(0,...[...o.matchAll(/^par: t=(\d+) .* parasite ([0-9.]+)/gm)].filter(m=>+m[1]>20000).map(m=>+m[2]));return [
  {id:'pair-host',cap:'Selection sees bodies when parts are made near their use: a parasite S that never buds dies out where a newborn\'s S comes from its parent more than half the time',demo:'pair',seeds:[1,2,3,4],need:3,steps:40000,secs:150,env:{...env,PADI:'10'},
    pass:(L,o)=>{const m=res(o);if(!m)return [false,'no result'];return [+m[2]>=0.5&&+m[3]>0&&+(m[5]||0)===0,`S from parent ${m[2]}, ${m[3]} bodies, parasite ${m[5]||0} at 40k (peak ${peak(o)})`];}},
  {id:'pair-host-c',cap:'  control: at a lower parental share (slower decay) the parasite holds a large share',demo:'pair',seeds:[1,2,3,4],need:3,steps:40000,secs:150,env,
    pass:(L,o)=>{const m=res(o);if(!m)return [false,'no result'];return [+m[2]<0.5&&+(m[5]||0)>=0.2,`S from parent ${m[2]}, ${m[3]} bodies, parasite ${m[5]||0} at 40k`];}},
  {id:'pair-host-mx',cap:'  control: the first world stirred (labelled drive) loses its locality and the parasite spreads',demo:'pair',seeds:[1,2,3,4],need:3,steps:30000,secs:120,env:{...env,PADI:'10',PAMX:'0.2'},
    pass:(L,o)=>{const m=res(o);if(!m)return [false,'no result'];const p=peak(o);return [+m[2]<0.5&&p>=0.3,`S from parent ${m[2]}, parasite peak ${p}, ${m[3]} bodies at 30k`];}},
  ];})(),
  // run 20261004-2051 (explore): the lysis side '!' (RULES Core changes). A parent with a complete bud stuck on its seed
  // site (no food), 4 cutters 'z@!-|-|' (labelled), the anchor on cell 44 (openRange 50): the stuck bud comes apart into
  // its 47 parts and a later bud on the seed site is built from at least 40 of them
  {id:'lysis',cap:'Lysis: a stuck bud taken apart into its parts by a cutter at its waiting anchor; a new bud on the parent grows from them',demo:'lysis',seeds:[1,2,3,4],need:3,steps:1000000,secs:150,
    pass:(L,o)=>{const m=o.match(/result: lysedFirst=(\S+) .*max=(\d+) .*reused=(\d+) cuts=(\d+)/);return [!!m&&m[1]!=='not'&&+m[3]>=40,m?`apart at ${m[1]}, a later bud of ${m[2]} cells, ${m[3]} of them the stuck bud's parts, ${m[4]} cuts`:'no result'];}},
  // The frozen lineage's two checks run 2 seeds each since run 20261007-0050 (harden; suite time): on main 0ed8f69 both
  // passed 3 of 4 worlds (seed 1 fails both: generation 3 not reached by 1.2M steps), and while the lineage is frozen
  // they are regression checks; seeds 2 and 3 must both pass (INNOVATIONS keeps the 3-of-4 records)
  // run 20261004-1021 (build): three generations on a slow supply (labelled environment drive: 400 inert pre-food turning
  // into copy blanks, the untyped building blocks, at 0.0003 per 100 steps; world 36) and a monomer loop (labelled: free genome monomers turn back into blanks, 0.002 per
  // 100 steps; without it 0 of 4, run 1021); the bud grows off its parent's corner
  // (closed walls, no harness). Replaces budcycle-free (two generations, 180 pre-food at 0.001, world 32; runs 0621-0751).
  {id:'budcycle-3',cap:'Three generations from the kit on a slow supply: a bud of the bud\'s bud complete, let go and holding a caught strand',demo:'budcycle',seeds:[2,3],need:2,steps:1200000,secs:2000,env:{BCAFTER:'900000',BCGEN:'3'},
    pass:(L,o)=>{const m=o.match(/result: .*split=(\S+) .*gen2=(\S+) gen3=(\S+) ownCopies=(\S+) stray=(\d+)/);return [!!m&&m[3]!=='not'&&+m[5]===0,m?`first split ${m[1]}, generation 2 at ${m[2]}, 3 at ${m[3]}, own copies after let-go (generation:copies) ${m[4]}, ${m[5]} stray`:'no result'];}},
  // run 20261004-2221 (build): lysis in the lineage. budcycle-3's setup with a lysis receptor 'Г@&' on each body's last
  // cell E (budKit receptor; kit only, no core change), openRange 50 and 2 cutters 'г@!-|-|' (labelled): the receptor
  // binds only while E hears its waiting anchor, so cutters take apart complete buds waiting for a catch and nothing
  // else. Passes a world that reaches generation 3 with every lysed bud complete (47 cells) and no stray part
  {id:'budcycle-lysis',cap:'Lysis in the lineage: cutters at a receptor on the last cell take apart only complete buds waiting for a catch; three generations',demo:'budcycle',seeds:[2,3],need:2,steps:1200000,secs:2000,env:{BCAFTER:'900000',BCGEN:'3',BCQ:'1',BCR:'50',BCC:'2'},
    pass:(L,o)=>{const m=o.match(/result: .*gen3=(\S+) .*stray=(\d+) .*lysedBuds=(\d+) .*falseRel=(\d+) lysedAt=(\S+) poolMin=(\d+)/);const sel=m&&(m[5]==='none'||m[5].split(',').every(x=>x==='47'));
      return [!!m&&m[1]!=='not'&&+m[2]===0&&sel,m?`generation 3 at ${m[1]}, ${m[3]} buds lysed (cells: ${m[5]}), ${m[4]} roots released incomplete, fewest free part type ${m[6]}, ${m[2]} stray`:'no result'];}},
];

function run(c,seed){return new Promise(res=>{const args=[path.join(__dirname,'demos.js'),c.demo,String(seed),String(c.steps),path.join('runs','check')];if(c.extra)args.push(c.extra);
  const p=spawn(process.execPath,args,{env:{...process.env,TRI_NOPIC:'1',...(c.env||{})}});let out='',err='';const t0=Date.now();
  p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>err+=d);
  p.on('close',code=>{const lines=out.split('\n').filter(l=>l.startsWith('t='));const L=lines[lines.length-1]||'';
    let ok=false,ev='';if(code!==0)ev='crashed: '+(err.trim().split('\n').find(l=>/Error/.test(l))||'exit '+code);else[ok,ev]=c.pass(L,out);
    if(process.env.CHECK_SAVE){require('fs').mkdirSync(process.env.CHECK_SAVE,{recursive:true});require('fs').writeFileSync(path.join(process.env.CHECK_SAVE,`${c.id}_${seed}.txt`),out);}   // whole output, to compare runs
    res({ok,ev,secs:(Date.now()-t0)/1000});});});}

async function main(){const want=process.argv.slice(2),sel=CHECKS.filter(c=>!want.length||want.includes(c.id));
  if(want.length&&sel.length!==want.length)throw Error('unknown check; one of '+CHECKS.map(c=>c.id).join(' '));
  // jobs longest first, at most 4 at once; each check's line is printed as soon as its last world finishes (a restart
  // loses only the checks still running)
  const jobs=sel.flatMap(c=>c.seeds.map(seed=>({c,seed}))).sort((a,b)=>b.c.secs-a.c.secs),res=new Map(),t0=Date.now(),left=new Map(sel.map(c=>[c,c.seeds.length]));
  let next=0,fails=0;const report=c=>{const rs=c.seeds.map(seed=>[seed,res.get(jobs.find(j=>j.c===c&&j.seed===seed))]),k=rs.filter(([,r])=>r.ok).length,need=c.need||c.seeds.length,ok=k>=need;
    if(!ok&&!c.partial)fails++;const tag=ok?'PASS':c.partial?'PART':'FAIL',w=c.seeds.length>1?` ${k}/${c.seeds.length} worlds (need ${need}):`:':';
    console.log(`${tag} ${c.id.padEnd(12)} ${c.cap}${w} ${rs.map(([seed,r])=>(c.seeds.length>1?`[${seed}${r.ok?'+':'-'}] `:'')+r.ev).join('; ')} (${Math.max(...rs.map(([,r])=>r.secs)).toFixed(0)} s)`);};
  const worker=async()=>{while(next<jobs.length){const j=jobs[next++];res.set(j,await run(j.c,j.seed));left.set(j.c,left.get(j.c)-1);if(!left.get(j.c))report(j.c);}};
  await Promise.all([1,2,3,4].map(worker));
  console.log(`${sel.length-fails} of ${sel.length} checks pass (partial ones never fail); ${((Date.now()-t0)/1000).toFixed(0)} s`);process.exitCode=fails?1:0;}
main();
