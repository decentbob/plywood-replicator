'use strict';
// Capability checks: one line per capability that ROADMAP's module table marks as working (plus partial ones, which
// report but do not fail). Each check runs an existing demo (tri/demos.js, pictures off) on fixed seeds and reads the
// demo's own last report line; a capability claimed "N of 4 worlds" needs that many seeds to pass.
//   node tri/check.js [name ...] [--part k/n] [--cmd]   (names: the `id` column; default all; at most 4 processes; about 71 minutes
//   in run 20261008-0250's container, 160 in run 0651's: run it as --part 1/2, then --part 2/2; budcycle-3 the longest;
//   each check prints when its last world finishes, so lines come in finishing order; CHECK_SAVE=dir keeps each world's
//   whole output there, e.g. to show that a change leaves outputs byte for byte the same)
// Exit code 1 if a working capability fails.
const {spawn}=require('child_process'),path=require('path');
const num=(L,re)=>{const m=L.match(re);return m?+m[1]:NaN;};
const count=(L,re)=>(L.match(re)||[]).length;
// the census of individuals (demo pair, 'kinds:' lines; run 20261007-0050): per census its complete individuals of 2 or more
// cells and the commonest kinds; fewest over the run, the last census's count and kinds
const indiv=o=>{const C=[...o.matchAll(/^kinds: t=(\d+) .*?individuals (\d+) kinds .*$/gm)];if(!C.length)return null;const last=C[C.length-1][0];
  const top=last.slice(last.lastIndexOf(' | ')+3).split(', ').map(w=>w.match(/^(\d+)x (.+)$/)).filter(Boolean).map(m=>[+m[1],m[2]]);
  return {min:Math.min(...C.map(m=>+m[2])),end:+C[C.length-1][2],top};};
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
  {id:'copy',cap:'Genome: typed chain copying (zip; the founder held by its high end)',demo:'copy',seeds:[1,2,3,4],need:3,steps:20000,secs:5,
    pass:L=>{const n=count(L,/BBAABA\//g);return [n>=2,`${n} complete copies BBAABA`];}},
  {id:'ring',cap:'Membrane growth: ring kit closes (R=3)',demo:'ring',seeds:[1,2,3,4],need:3,steps:60000,extra:'3',secs:5,
    pass:L=>{const m=L.match(/closed=at (\d+)/);return [!!m,m?`closed at ${m[1]}`:'open '+(L.match(/cells=(\S+)/)||[])[1]];}},
  {id:'imprint',cap:'Contact copying: a ring with one of each part closes, a second grows from copies',demo:'imprint',seeds:[1,2,3,4],need:3,steps:200000,secs:110,
    pass:(L,o)=>{const m=o.match(/result: ring cells (\d+) (\d+) of 30, closed at (\S+) \/ (\S+)/);return [!!m&&m[3]!=='not'&&m[4]!=='not',m?`rings ${m[1]}/${m[2]} cells, closed ${m[3]} / ${m[4]}`:'no result'];}},
  {id:'imprint-genome',cap:'Contact copying: a strand copied from copies of its own triangles',demo:'imprint',seeds:[1,2,3,4],need:3,steps:30000,extra:'g',secs:10,
    pass:(L,o)=>{const n=num(o,/result: (\d+) free strands/);return [n>=4,`${n} strands`];}},
  {id:'imprint-genome-c',cap:'  control: plain blanks, no copies',demo:'imprint',seeds:[1],steps:30000,extra:'gc',secs:10,
    pass:(L,o)=>{const n=num(o,/result: (\d+) free strands/);return [n===1,`${n} strands`];}},
  {id:'imprint-pore',cap:'A cell fed through a pore: copy blanks from outside copy only its held genome (spent walls); 3 rival strands outside stay sterile',demo:'imprint',seeds:[1,2,3,4],need:3,steps:100000,extra:'150px',secs:50,
    pass:(L,o)=>{const m=o.match(/result: (\d+) free strands \(founder included\), (\d+) inside, copies (\d+): genome (\d+), wall (\d+)/);return [!!m&&+m[2]>=4&&+m[5]===0,m?`${m[2]} strands inside (${m[1]} in all), copies to genome ${m[4]}, wall ${m[5]}`:'no result'];}},
  {id:'imprint-pore-c',cap:'  control: no pore, no blank gets in',demo:'imprint',seeds:[1],steps:60000,extra:'150pc',secs:20,
    pass:(L,o)=>{const m=o.match(/result: (\d+) free strands \(founder included\), (\d+) inside, copies (\d+)/);return [!!m&&+m[3]===0&&+m[1]===1,m?`${m[1]} strand, ${m[3]} copies`:'no result'];}},
  {id:'imprint-pore-n',cap:'  control: plain walls take the blanks',demo:'imprint',seeds:[1],steps:60000,extra:'150pn',secs:20,
    pass:(L,o)=>{const m=o.match(/result: (\d+) free strands \(founder included\), (\d+) inside, copies (\d+): genome (\d+), wall (\d+)/);return [!!m&&+m[2]<=2&&+m[5]>+m[4],m?`${m[2]} inside, copies to genome ${m[4]}, wall ${m[5]}`:'no result'];}},
  {id:'budpool',cap:'The closure kind\'s bud grows from a pool of its 47 part types (8 each, 40 of the last; 8 blanks), splits on a stand-in catch',demo:'budpool',seeds:[1,2,3,4],need:3,steps:250000,secs:150,
    pass:(L,o)=>{const m=o.match(/result: cells=(\d+)\/47 complete=(\S+) split=(\S+) refilled=\S+ copies=(\d+) .*stray=(\d+)/);return [!!m&&m[3]!=='not'&&+m[5]===0,m?`${m[1]}/47 cells, split ${m[3]}, ${m[4]} copies, ${m[5]} stray`:'no result'];}},
  // run 20261005-2320 (build): the pair (pairKit, 2 cells, 2 types; IDEAS "Sources in proportion to use"): one founder
  // among 300 copy blanks (world 30, openRange 1) grows to 20 bodies; control: the side order first written in IDEAS
  // (S 'B@y-|': its seed site is its only source, covered by a waiting bud) never reaches the pair's 20 bodies (5 by 5000 steps)
  {id:'pair',cap:'The pair: one founder among 300 copy blanks grows to 20 bodies (2 cells, 2 types; no free parts)',demo:'pair',seeds:[1,2,3,4],need:3,steps:3000,secs:5,
    pass:(L,o)=>{const m=o.match(/result: bodies=(\d+) reached20=(\S+) gen=(\d+) .*copiesR=(\d+) copiesS=(\d+)/);return [!!m&&m[2]!=='not',m?`20 bodies at ${m[2]}, ${m[1]} at the end, generation ${m[3]}, copies R ${m[4]} S ${m[5]}`:'no result'];}},
  // run 20261006-1920 (core-review): one range for every length. Strips of 2 to 5 cells (structures strip(k), one
  // founder each among 300 blanks, world 30) at the core's default openRange (120): every '&' release lets go a complete
  // individual. On main before the rule (the open signal crossing '&' joints, a caught part emitting one pass late), 3- to
  // 5-cell roots let go incomplete at small ranges and 4- and 5-cell kinds stall at large ones (RULES, Core changes)
  {id:'strips',cap:'One range for every length: strips of 2 to 5 cells bud and every release is complete (default openRange)',demo:'strip',seeds:[1,2,3,4],need:3,steps:6000,extra:'2345',secs:15,
    pass:L=>{const m=[...L.matchAll(/k(\d)=(\d+)\/(\d+)\//g)];return [m.length===4&&m.every(x=>+x[2]>=5&&+x[3]===0),m.map(x=>`${x[1]} cells ${x[2]} complete, ${x[3]} incomplete`).join(', ')||'no result'];}},
  {id:'pair-c',cap:'  control: S\'s seed site its only source (S B@y-|, R Y@&b@-)',demo:'pair',seeds:[1],steps:5000,secs:5,env:{PAKS:'B@y-|',PAKR:'Y@&b@-'},
    pass:(L,o)=>{const m=o.match(/result: bodies=(\d+) .*freeR=(\d+) freeS=(\d+)/);return [!!m&&+m[1]<20,m?`${m[1]} bodies, free R ${m[2]}, free S ${m[3]}`:'no result'];}},
  // run 20261006-0251 (build): Direction 1 on the pair, a world that runs on. 1000 copy blanks in world 50 and two labelled
  // drives from step 1000 on: every 100 steps each body is hit with probability 0.6 (lysis into its two parts) and each
  // free part becomes a blank with probability 1, so new bodies are built from fresh copies, not from a dead body's parts.
  // Passes a world still budding in its last 1000 steps with at least 20 bodies, generation 100 or more, R and S copied
  // within a factor 1.5 of each other and at least half of the parts born fresh copies (about 285 bodies; at h 0.7, 50-190
  // bodies, 2 of 4 worlds die out by 10^6 steps, at 0.8 all: INNOVATIONS run 0251)
  {id:'pair-run',cap:'The pair runs on: bodies die (hazard) and free parts decay into blanks (labelled drives); births keep up for 100k steps, generations accumulate',demo:'pair',seeds:[1,2,3,4],need:3,steps:100000,secs:200,env:{PAB:'1000',PAS:'50',PAHT:'1000',PAH:'0.6',PAD:'1'},
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
  {id:'pair-sel',cap:'Selection on the pair: a seed site copied while free (S without its anchor mark), put into 1 in 10 S, spreads to 90% of S in 40k steps',demo:'pair',seeds:[1,2,3,4],need:3,steps:60000,secs:120,env:{PAB:'1000',PAS:'50',PAHT:'1000',PAH:'0.6',PAD:'1',PAV:'mix',PAVP:'0.1',PAVK:'seed',PAVT:'20000',PAP:'5000'},
    pass:(L,o)=>{const m=o.match(/marker: .*openSeed=(\S+) openFront=(\S+)/);return [!!m&&+m[1]>=0.9,m?`open seed sites ${m[1]} of S in bodies at 60k (1 in 10 at 20k)`:'no result'];}},
  {id:'pair-sel-c',cap:'  control: a neutral marker in 1 in 10 R does not fix in the same time',demo:'pair',seeds:[1,2,3,4],need:3,steps:60000,secs:120,env:{PAB:'1000',PAS:'50',PAHT:'1000',PAH:'0.6',PAD:'1',PAV:'mix',PAVP:'0.1',PAVT:'20000',PAP:'5000'},
    pass:(L,o)=>{const m=o.match(/marker: lost=(\S+) fixed=(\S+)/),v=[...o.matchAll(/var: t=\d+ alive \d+ marked \d+ share (\S+)/g)].pop();return [!!m&&m[2]==='not',m?`marker ${m[1]!=='not'?'lost at '+m[1]:m[2]!=='not'?'fixed at '+m[2]:'share '+(v?v[1]:'-')+' at 60k'}`:'no result'];}},
  {id:'pair-mut',cap:'Variation on the pair: under a labelled mutagen an exposure variant arises and spreads to most bodies (hazard per triangle)',demo:'pair',seeds:[1,2,3,4],need:3,steps:100000,secs:200,env:{PAB:'1000',PAS:'50',PAHT:'1000',PAH:'0.6',PAD:'1',PAM:'0.01',PAHU:'1',PAP:'5000'},
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
  {id:'duo',cap:'Two kinds on one supply: the pair and a 3-cell strip from one founder each; the pair takes the material and the strip dies out',demo:'pair',seeds:[1,2,3,4],need:3,steps:20000,secs:45,env,
    pass:(L,o)=>{const m=res(o);if(!m)return [false,'no result'];return [m[1]==='alive'&&m[3]!=='alive'&&+m[2]>=200,`pair ${m[1]} (mean ${m[2]} in the second half), strip ${m[3]}`];}},
  {id:'duo-inv',cap:'  5 pairs entering an established strip world (100+ strips) drive it extinct',demo:'pair',seeds:[1,2,3,4],need:3,steps:50000,secs:100,env:{...env,PA1T:'30000',PAEN:'5'},
    pass:(L,o)=>{const m=res(o),n=at(o,30000,2);if(!m)return [false,'no result'];return [n>=100&&m[1]==='alive'&&m[3]!=='alive',`${n} strips before entry; pair ${m[1]}, strip ${m[3]}`];}},
  {id:'duo-inv-c',cap:'  5 strips entering a pair world die out',demo:'pair',seeds:[1,2,3,4],need:3,steps:40000,secs:85,env:{...env,PA2T:'30000',PAEN:'5'},
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
  {id:'duo-stock',cap:'A second resource pays for length: a 3-cell strip whose extra cells come from a stock the pair cannot bind coexists with the pair (hazard per individual)',demo:'pair',seeds:[1,2,3,4],need:3,steps:40000,secs:170,env,
    pass:(L,o)=>{const m=res(o);if(!m)return [false,'no result'];return [m[1]==='alive'&&m[3]==='alive'&&+m[2]>=50&&+m[4]>=150,`pair ${m[1]} (mean ${m[2]} in the second half), strip ${m[3]} (mean ${m[4]})`];}},
  {id:'duo-stock-inv',cap:'  5 pairs entering an established stock-strip world settle beside it',demo:'pair',seeds:[1,2,3,4],need:3,steps:60000,secs:250,env:{...env,PA1T:'30000',PAEN:'5'},
    pass:(L,o)=>{const m=res(o),n=at(o,30000,2);if(!m)return [false,'no result'];return [n>=150&&m[1]==='alive'&&m[3]==='alive'&&+m[4]>=150,`${n} strips before entry; pair ${m[1]} (mean ${m[2]}), strip mean ${m[4]}`];}},
  {id:'duo-stock-c',cap:'  control: the plain strip (every cell copied, no stock) under the same hazard dies out',demo:'pair',seeds:[1,2,3,4],need:3,steps:20000,secs:45,env:{...env,PA2:'Z@&c@|- C@d@|- D@-z|',PAF:''},
    pass:(L,o)=>{const m=res(o);if(!m)return [false,'no result'];return [m[1]==='alive'&&m[3]!=='alive',`pair ${m[1]} (mean ${m[2]}), strip ${m[3]}`];}},
  {id:'duo-stock-tri',cap:'  control: with a hazard per triangle (three at risk against two) the pair drives the stock strip out',demo:'pair',seeds:[1,2,3,4],need:3,steps:40000,secs:180,env:{...env,PAHU:'1'},
    pass:(L,o)=>{const m=res(o);if(!m)return [false,'no result'];return [m[1]==='alive'&&m[3]!=='alive',`pair ${m[1]} (mean ${m[2]}), strip ${m[3]}`];}},
  {id:'duo-stock-hi',cap:'  a stock of 600 each: the strip drives the pair out (or nearly)',demo:'pair',seeds:[1,2,3,4],need:3,steps:40000,secs:220,env:{...env,PAF:'C@d@|-|:600 D@-|z|:600'},
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
  {id:'diets',cap:'Heritable diets: mutant fronts that catch an unused stock arise, spread and live beside the founder\'s diet',demo:'pair',seeds:[1,2,3,4],need:3,steps:60000,secs:190,env,
    pass:(L,o)=>{const r=res(o);if(!r)return [false,'no result'];return [r.held>=2&&big(r).length>=2,ev(r)];}},
  {id:'diets-c',cap:'  control: without the mutagen the founder\'s diet stays alone',demo:'pair',seeds:[1,2,3,4],need:3,steps:30000,secs:90,env:{...env,PAM:'0'},
    pass:(L,o)=>{const r=res(o);if(!r)return [false,'no result'];return [r.held===1&&big(r)==='c',ev(r)];}},
  {id:'diets-ns',cap:'  control: with only the founder\'s stock no mutant diet spreads',demo:'pair',seeds:[1,2,3,4],need:3,steps:30000,secs:65,env:{...env,PAF:'C@-|z|:150'},
    pass:(L,o)=>{const r=res(o);if(!r)return [false,'no result'];return [r.held===1&&big(r)==='c',ev(r)];}},
  ];})(),
  // run 20261006-2350 (build): length by mutation shrinks. A 3-cell founder whose middle is copied ('Z@&c@|- C@e@|-
  // E@-|z|', openRange 9) among stocks E and G and the front mutagen (a..z): the founder fills its stock first, then
  // 2-cell kinds whose root front catches a stock directly (one mutation: the shortcut) replace it; no individual of 3
  // or more cells is left at 60k (IDEAS "Joints make individuals")
  {id:'ladder',cap:'Length by mutation shrinks: from a 3-cell founder with a copied middle, 2-cell shortcut kinds (the root catching the stock) replace it',demo:'pair',seeds:[1,2,3,4],need:3,steps:60000,secs:160,
    env:{PAB:'1000',PAS:'50',PAHT:'4000',PAHB:'2',PAHU:'0',PAP:'5000',PAR:'9',PAD:'1',PAH:'0.1',PA1:'0',PA2:'Z@&c@|- C@e@|- E@-|z|',PAMF:'1',PAF:'E@-|z|:150 G@-|z|:150',PAM:'0.02'},
    pass:(L,o)=>{const m=o.match(/kinds: endLong=\S+ maxLong=(\S+) longest=(\d+) endByCells=(\S+)/);if(!m)return [false,'no result'];const c={};for(const w of m[3].split(','))if(w.includes(':'))c[w.split(':')[0]]=+w.split(':')[1];
      const f=(m[1].match(/(?:^|,)ce:(\d+)/)||[])[1]||0,long=Object.entries(c).filter(([k])=>+k>=3).reduce((a,[,v])=>a+v,0);
      return [f>=50&&long<=5&&(c[2]||0)>=30,`founder held up to ${f}; at 60k ${c[2]||0} individuals of 2 cells, ${long} of 3 or more; longest ever ${m[2]} cells`];}},
  // run 20261006-0621 (build): a world that keeps evolving. pair-mut's setting plus a labelled drive: every lysed triangle
  // returns as a copy blank once free (PAHB=2), so material held by binding variants flows through copying at the
  // hazard's rate. Passes a world with bodies at 200k, at least 10k copies in the last 5000 steps and a variant type first
  // seen after 100k that was in a tenth of the bodies at some census (a late sweep). Control: without the drive, seeds 3
  // and 4 lock (binding variants hold the material: under 10k copies per 5000 steps; INNOVATIONS run 0450). Partial since
  // core review run 20261007-2051: over seeds 1-8 the material locks in 3 of 8 worlds on main (25c68b9: seeds 3, 4, 5) and
  // in 3 of 8 after that run's fixes (seeds 2, 3, 8): the drive is not what keeps most worlds copying at 200k. In a 3x world
  // (3000 blanks, world 87) 4 of 4 to 300k, too slow for a check (about 25 minutes per world; INNOVATIONS run 0621)
  {id:'pair-flow',cap:'A pair world that keeps evolving: dead material returns as blanks (labelled drive), copying goes on and new variants still sweep at 200k',demo:'pair',seeds:[1,2,3,4],need:3,steps:200000,secs:400,env:{PAB:'1000',PAS:'50',PAHT:'1000',PAH:'0.6',PAD:'1',PAM:'0.01',PAHU:'1',PAP:'5000',PAHB:'2'},
    pass:(L,o)=>{const m=o.match(/evolving: bodies=(\d+) kinds=(\d+) common=(\d+) lateCommon=(\d+) copiesLast=(\d+) blanks=(\d+)/);if(!m)return [false,'no result'];
      const I=indiv(o);return [+m[1]>0&&+m[5]>=10000&&+m[4]>=1,`${m[1]} bodies of ${m[2]} kinds, ${m[5]} copies in the last 5000 steps, blanks ${m[6]}; ${m[3]} variant types in a tenth of the bodies, ${m[4]} of them new after 100k; individuals at 200k ${I?I.end:'-'} (fewest ${I?I.min:'-'})`];}},
  {id:'pair-flow-c',cap:'  control (partial): without the drive binding variants lock the material in some worlds (under 10k copies per 5000 steps at 200k; 3 of 8)',partial:true,demo:'pair',seeds:[3,4],steps:200000,secs:410,env:{PAB:'1000',PAS:'50',PAHT:'1000',PAH:'0.6',PAD:'1',PAM:'0.01',PAHU:'1',PAP:'5000'},
    pass:(L,o)=>{const m=o.match(/evolving: bodies=(\d+) kinds=(\d+) common=(\d+) lateCommon=(\d+) copiesLast=(\d+) blanks=(\d+)/);if(!m)return [false,'no result'];
      return [+m[5]<10000,`${m[5]} copies in the last 5000 steps, blanks ${m[6]}, ${m[1]} bodies`];}},
  // run 20261007-0420 (build): the hazard's unit decides between individuals and aggregates. pair-flow's setting with
  // the hazard per individual (PAHU=2: each set of triangles joined by bonds that are not joints is lysed with
  // probability h, so every attached triangle dies at the same rate however it is joined) at h 0.5 (about pair-flow's
  // pairs): seeds 2 and 4, which end as joint-joined aggregates with no individual left under the hazard per triangle
  // (pair-flow), keep 2-cell individuals at every census and still sweep (IDEAS "The hazard's unit")
  {id:'pair-flow-i',cap:'  with the hazard per individual the pair world keeps individuals at every census and still evolves',demo:'pair',seeds:[2,4],need:2,steps:200000,secs:460,env:{PAB:'1000',PAS:'50',PAHT:'1000',PAH:'0.5',PAD:'1',PAM:'0.01',PAHU:'2',PAP:'5000',PAHB:'2'},
    pass:(L,o)=>{const m=o.match(/evolving: bodies=(\d+) kinds=(\d+) common=(\d+) lateCommon=(\d+) copiesLast=(\d+) blanks=(\d+)/),I=indiv(o);if(!m||!I)return [false,'no result'];
      return [I.min>0&&+m[5]>=10000&&+m[4]>=1,`individuals fewest ${I.min}, at 200k ${I.end} (${I.top.slice(0,2).map(([n,k])=>n+'x '+k).join(', ')}); ${m[5]} copies in the last 5000 steps; ${m[3]} variant types in a tenth of the bodies, ${m[4]} new after 100k`];}},
  // run 20261007-0420 (build): the standard world (demo pair, PAW=1: the diet kind among stocks C, E, G, openRange 9, deaths
  // return blanks, decay, the hazard per individual (since build run 20261007-1351 the whole body at h 0.07: fewest 88-107,
  // 192-358 at 120k), the general mutagen with stock parts exempt). Passes a world whose
  // complete individuals of 2 or more cells never fall to 0 and where a kind other than the founder's holds 10 or more at
  // 120k (in batch B: a head whose front became C, catching other heads by their fronts, in 3 of 4; held kinds of up to 6
  // cells with copied middles in 1)
  {id:'world',cap:'The standard world: individuals at every census and kinds that arose by mutation held at the end',demo:'pair',seeds:[1,2,3,4],need:3,steps:120000,secs:440,env:{PAW:'1'},
    pass:(L,o)=>{const I=indiv(o);if(!I)return [false,'no result'];const mut=I.top.filter(([,k])=>k!=='-Z@&c@|+-|z|C@'),c=o.match(/census: maxHeld=(\d+) at \S+ longestHeld=(\d+)/),w=o.match(/web: maxClasses=(\d+) at \S+ maxLinks=(\d+)/);
      return [I.min>0&&mut.length>0&&mut[0][0]>=10,`individuals fewest ${I.min}, at 120k ${I.end}; commonest kind not the founder's ${mut.length?mut[0][0]+'x '+mut[0][1]:'none'}; kinds held at once up to ${c?c[1]:'-'}, longest held ${c?c[2]:'-'} cells; web (second half) up to ${w?w[1]:'-'} classes, ${w?w[2]:'-'} links`];}},
  // run 20261007-0622 (explore): host and catcher. The catchers that replaced the plain one in the standard world carry
  // a seed site of their own: founded alone in the standard world without stocks or mutagen, the u kind (a catcher head
  // 'U@&C@|u' holding a host head by its front) grows on blanks only; the plain catcher (no seed site) never buds alone
  {id:'catcher-free',cap:'A catcher with its own seed site is a free-living kind: founded alone without stock it holds 100 or more individuals',demo:'pair',seeds:[1,2,3,4],need:3,steps:20000,secs:45,env:{PAW:'1',PAF:'',PAM:'0',PA2:'U@&C@|u c@|-Z@&'},
    pass:(L,o)=>{const I=indiv(o);if(!I)return [false,'no result'];const ok=I.end>=100&&I.top.length>0&&I.top[0][1]==='-Z@&c@|+C@|uU@&';return [ok,`${I.end} individuals at 20k${I.top.length?', '+I.top[0][0]+'x '+I.top[0][1]:''}`];}},
  {id:'catcher-free-c',cap:'  control: the plain catcher (no seed site) founded alone never buds',demo:'pair',seeds:[1],steps:20000,secs:32,env:{PAW:'1',PAF:'',PAM:'0',PA2:'Z@&C@|- c@|-Z@&'},
    pass:(L,o)=>{const I=indiv(o);if(!I)return [false,'no result'];return [I.end===0,`${I.end} individuals at 20k`];}},
  // a catcher arms its host's diet: the diets world (front mutagen on c..h, openRange 9, hazard per individual) holds
  // three diets near their stocks by 40k; 10 catchers of diet c entered at 40k (a labelled start) drive diets e and g
  // below 50 hosts (hosts: stock parts held) by 80k while c keeps 50 or more (each catcher copies c heads at two sides,
  // and they take every seed site); control without them: all three keep 80 or more
  {id:'diets-catcher',cap:'Catchers of one diet exclude the other diets (diets world, 10 catchers of diet c entered at 40k)',demo:'pair',seeds:[1,2,3,4],need:3,steps:80000,secs:285,env:{PAB:'1000',PAS:'50',PAHT:'4000',PAHB:'2',PAHU:'2',PAP:'5000',PAR:'9',PAD:'1',PAH:'0.1',PA1:'0',PA2:'Z@&c@|- C@-|z|',PAMF:'1',PAF:'C@-|z|:150 E@-|z|:150 G@-|z|:150',PAM:'0.01',PAMA:'cdefgh',PA1T:'40000',PAEN:'10',PAKR:'Z@&C@|-',PAKS:'c@|-Z@&'},
    pass:(L,o)=>{const D=[...o.matchAll(/^diet: t=(\d+) .*free stock (\d+):(\d+):(\d+)/gm)];if(!D.length)return [false,'no result'];const h=D[D.length-1].slice(2).map(x=>150-+x);return [h[0]>=50&&h[1]<50&&h[2]<50,`hosts at 80k: c ${h[0]}, e ${h[1]}, g ${h[2]}`];}},
  {id:'diets-catcher-c',cap:'  control: no catchers, the three diets keep 80 or more hosts each',demo:'pair',seeds:[1],steps:80000,secs:282,env:{PAB:'1000',PAS:'50',PAHT:'4000',PAHB:'2',PAHU:'2',PAP:'5000',PAR:'9',PAD:'1',PAH:'0.1',PA1:'0',PA2:'Z@&c@|- C@-|z|',PAMF:'1',PAF:'C@-|z|:150 E@-|z|:150 G@-|z|:150',PAM:'0.01',PAMA:'cdefgh'},
    pass:(L,o)=>{const D=[...o.matchAll(/^diet: t=(\d+) .*free stock (\d+):(\d+):(\d+)/gm)];if(!D.length)return [false,'no result'];const h=D[D.length-1].slice(2).map(x=>150-+x);return [h.every(x=>x>=80),`hosts at 80k: c ${h[0]}, e ${h[1]}, g ${h[2]}`];}},
  // a root delivered in place (IDEAS "A bud gets one part by place"): a 4-cell arc round one vertex whose head's copies are
  // born in the arc's gap beside its own seed site; middles and end from stocks (150 each), standard world at hazard
  // 0.03 (at 0.1 it dies: three catches per birth). Roots copied by the bud's own parent (PARP): about 0.9 of births;
  // control: the 2-cell kind with the same head and a stock end, about 0.48
  // (build run 20261007-1351: the hazard per individual pinned, PAHU=2, when the standard world moved to the whole body;
  // under PAHU=3 at 0.03 the arc keeps 7-29 individuals at 30k, its births still 0.91-0.98 in place: a bud that waits
  // for three catches dies with its parent)
  {id:'arc-root',cap:'A 4-cell arc delivers its root in place: 80% or more of its births have a root its own parent copied',demo:'pair',seeds:[1,2,3,4],need:3,steps:30000,secs:93,env:{PAW:'1',PAM:'0',PAH:'0.03',PAHU:'2',PARP:'1',PA2:'Z@&t@|- T@-|a@| A@-|b@| B@-|z|',PAF:'T@-|a@|:150 A@-|b@|:150 B@-|z|:150'},
    pass:(L,o)=>{const I=indiv(o),m=o.match(/roots: binds=\d+ inPlace=\S+ births=(\d+) birthsInPlace=(\S+)/);if(!I||!m)return [false,'no result'];return [I.end>=30&&+m[2]>=0.8,`${I.end} individuals at 30k, births ${m[1]}, in place ${m[2]}`];}},
  {id:'arc-root-c',cap:'  control: the 2-cell kind (head and stock end), fewer than 60% in place',demo:'pair',seeds:[1],steps:30000,secs:70,env:{PAW:'1',PAM:'0',PAH:'0.03',PAHU:'2',PARP:'1',PA2:'Z@&t@|- T@-|z|',PAF:'T@-|z|:150'},
    pass:(L,o)=>{const I=indiv(o),m=o.match(/roots: binds=\d+ inPlace=\S+ births=(\d+) birthsInPlace=(\S+)/);if(!I||!m)return [false,'no result'];return [I.end>=30&&+m[2]<0.6,`${I.end} individuals at 30k, births ${m[1]}, in place ${m[2]}`];}},
  // run 20261007-0820 (build): the recognition web ('web:' lines, every pair world). The standard world with 10 catchers
  // entered at 10k (a labelled start): u catchers (their own seed site u) form a second class, which the host class
  // raises (a host's seed site takes the catcher individual's head) and whose front catches the host's parts: 2 classes,
  // 1 link; control: plain catchers (no seed site) are cheats inside the host class (1 class, a cheat, no link)
  {id:'web-two',cap:'The web census reads two classes and a link: u catchers entered into the standard world',demo:'pair',seeds:[1,2,3,4],need:3,steps:30000,secs:95,env:{PAW:'1',PA1T:'10000',PAEN:'10',PAKR:'U@&C@|u',PAKS:'c@|-Z@&'},
    pass:(L,o)=>{const W=[...o.matchAll(/^web: t=\d+ held (\d+) classes (\d+) links (\d+) .*?cheats (\d+).*\| (.*)$/gm)];if(!W.length)return [false,'no result'];const w=W[W.length-1];return [+w[2]>=2&&+w[3]>=1,`at 30k: ${w[1]} held kinds, ${w[2]} classes, ${w[3]} links (${w[5]}), ${w[4]} cheats`];}},
  {id:'web-two-c',cap:'  control: plain catchers are cheats inside the host class (1 class, no link)',demo:'pair',seeds:[1],steps:30000,secs:95,env:{PAW:'1',PA1T:'10000',PAEN:'10',PAKR:'Z@&C@|-',PAKS:'c@|-Z@&'},
    pass:(L,o)=>{const W=[...o.matchAll(/^web: t=\d+ held (\d+) classes (\d+) links (\d+) .*?cheats (\d+)/gm)];if(!W.length)return [false,'no result'];const w=W[W.length-1];return [+w[2]===1&&+w[3]===0&&+w[4]>=1,`at 30k: ${w[1]} held kinds, ${w[2]} classes, ${w[3]} links, ${w[4]} cheats`];}},
  // run 20261007-1720 (explore): a class that owns its seed letter (IDEAS "A class is a cycle of seed letters"). A host
  // whose head carries its seed site on its copy side ('N@&k@|n': its copies root in place) on a stock part with no seed
  // site ('K@-|-|', a fourth stock), 10 entered at 20k (labelled start): its letters close a cycle of their own, so it is
  // a second class with no link to the host class; control: the same head on the shared stock 'C@-|z|' (its stock part's
  // z raises the host class's heads: catchers holding N heads join the two into one class)
  {id:'own-letter',cap:'A class that owns its seed letter: an in-place seed site on a site-free stock is a second class, unlinked',demo:'pair',seeds:[1,2,3,4],need:3,steps:50000,secs:150,env:{PAW:'1',PA1T:'20000',PAEN:'10',PAKR:'N@&k@|n',PAKS:'K@-|-|',PAF:'C@-|z|:150 E@-|z|:150 G@-|z|:150 K@-|-|:150'},
    pass:(L,o)=>{const W=[...o.matchAll(/^web: t=(\d+) held (\d+) classes (\d+) links (\d+) .*?\| (.*) \| (.*)$/gm)].filter(w=>+w[1]>20000);if(!W.length)return [false,'no result'];const two=W.filter(w=>+w[3]>=2&&/(^|, )[A-Z]*N[A-Z]* \d/.test(w[5])).length,w=W[W.length-1];
      return [two===W.length,`${two} of ${W.length} censuses after entry with a separate N class; at 50k ${w[3]} classes, ${w[4]} links (${w[5]})`];}},
  {id:'own-letter-c',cap:'  control: the same head on the shared stock C (z) merges into one class with the host class',demo:'pair',seeds:[2],steps:50000,secs:150,env:{PAW:'1',PA1T:'20000',PAEN:'10',PAKR:'N@&c@|n',PAKS:'C@-|z|'},
    pass:(L,o)=>{const W=[...o.matchAll(/^web: t=(\d+) held (\d+) classes (\d+) links (\d+) .*?\| (.*) \| (.*)$/gm)];if(!W.length)return [false,'no result'];const w=W[W.length-1];
      return [/(^|, )[A-Z]*N[A-Z]*Z[A-Z]* \d|(^|, )[A-Z]*Z[A-Z]*N[A-Z]* \d/.test(w[5]),`at 50k ${w[3]} classes, ${w[4]} links (${w[5]})`];}},
  // run 20261007-1821 (build): kinds as food (IDEAS "Every catcher farms its catch; classes are at most the limiting
  // resources"). Every catch is farmed from blanks, so blank-eaters share one resource; a class needs a resource of its
  // own. The standard world with u catchers entered at 10k (they live on blanks) and the N host on its own stock K at
  // 20k (labelled starts): three classes on three resources (stock C, stock K, blanks); control: a farmer of a private
  // crop instead of N ('X@&D@|x' holding 'd@|-Y@&': it lives on blanks too) never establishes (2 classes, no X)
  {id:'web-three',cap:'Three classes on three resources: host on C, u catchers on blanks, N host on its own stock K',demo:'pair',seeds:[1,2,3,4],need:3,steps:50000,secs:150,env:{PAW:'1',PA1T:'10000',PAEN:'10',PAKR:'U@&C@|u',PAKS:'c@|-Z@&',PA3T:'20000',PA3:'N@&k@|n K@-|-|',PAF:'C@-|z|:150 E@-|z|:150 G@-|z|:150 K@-|-|:150'},
    pass:(L,o)=>{const W=[...o.matchAll(/^web: t=(\d+) held (\d+) classes (\d+) links (\d+) .*?\| (.*) \| (.*)$/gm)].filter(w=>+w[1]>30000);if(!W.length)return [false,'no result'];const three=W.filter(w=>+w[3]>=3).length,w=W[W.length-1];
      return [three===W.length,`${three} of ${W.length} censuses after 30k with 3 classes or more; at 50k ${w[3]} classes, ${w[4]} links (${w[5]} | ${w[6]})`];}},
  {id:'web-three-c',cap:'  control: a farmer of a private crop lives on blanks too and never establishes (no X class)',demo:'pair',seeds:[1],steps:50000,secs:150,env:{PAW:'1',PA1T:'10000',PAEN:'10',PAKR:'U@&C@|u',PAKS:'c@|-Z@&',PA3T:'20000',PA3:'X@&D@|x d@|-Y@&'},
    pass:(L,o)=>{const W=[...o.matchAll(/^web: t=(\d+) held (\d+) classes (\d+) links (\d+) .*?\| (.*) \| (.*)$/gm)].filter(w=>+w[1]>20000);if(!W.length)return [false,'no result'];const x=W.filter(w=>/X/.test(w[5])).length,w=W[W.length-1];
      return [x===0&&+w[3]<=2,`${x} of ${W.length} censuses after entry with an X class; at 50k ${w[3]} classes (${w[5]})`];}},
  // run 20261007-1921 (explore): a rare class wastes its parts (IDEAS "A rare class wastes its parts"). Two blank farmers
  // of one design with their own letters ('U@&C@|u' holding 'c@|C.Z@&', 'W@&E@|w' holding 'e@|E.Y@&'), 5 of each entered
  // at 2000 (labelled start) into the standard world without stock or mutagen: each class catches only second cells it
  // makes, and a free part decays (PAD 1), so the rarer class's parts decay before its few waiting buds catch them and
  // one class excludes the other by 30k (also at PAD 0.1 and 0.3, and faster when stirred); control: no decay, both
  // classes still there at 30k (and at 80k in 3 of 4, drifting)
  {id:'rare-waste',cap:'A rare class wastes its parts: of two equal blank farmers one excludes the other by 30k',demo:'pair',seeds:[1,2,3,4],need:3,steps:30000,secs:120,env:{PAW:'1',PAF:'',PAM:'0',PA2T:'2000',PA3T:'2000',PAEN:'5',PA2:'U@&C@|u c@|C.Z@&',PA3:'W@&E@|w e@|E.Y@&'},
    pass:(L,o)=>{const W=[...o.matchAll(/^web: t=(\d+) held (\d+) classes (\d+) links (\d+) .*?\| (.*) \| (.*)$/gm)];if(!W.length)return [false,'no result'];const w=W[W.length-1],two=W.filter(w=>+w[3]>=2).length;
      return [+w[3]===1,`at 30k ${w[3]} class (${w[5]}); 2 classes in ${two} of ${W.length} censuses`];}},
  {id:'rare-waste-c',cap:'  control: without decay (PAD 0) both classes are still there at 30k',demo:'pair',seeds:[1],steps:30000,secs:120,env:{PAW:'1',PAF:'',PAM:'0',PAD:'0',PA2T:'2000',PA3T:'2000',PAEN:'5',PA2:'U@&C@|u c@|C.Z@&',PA3:'W@&E@|w e@|E.Y@&'},
    pass:(L,o)=>{const W=[...o.matchAll(/^web: t=(\d+) held (\d+) classes (\d+) links (\d+) .*?\| (.*) \| (.*)$/gm)];if(!W.length)return [false,'no result'];const w=W[W.length-1];
      return [+w[3]===2,`at 30k ${w[3]} classes (${w[5]})`];}},
  // run 20261008-0121 (build): the standard world without stocks (NEXT priority 21; IDEAS "A nursery is a crowd"). The
  // founder pair with the standard letters among blanks only ('Z@&c@|- C@-z|': the second cell is copied, so its seed site
  // can mutate). Passes a world with individuals at every census whose commonest kind at 120k has a second cell other
  // than the founder's (its seed site changed: anchor lost, a lysis mark, another letter)
  {id:'world-free',cap:'The world without stocks: the second cell evolves; its seed site changes form by 120k',demo:'pair',seeds:[1,2,3,4],need:3,steps:120000,secs:220,env:{PAW:'1',PAF:'',PA2:'Z@&c@|- C@-z|'},
    pass:(L,o)=>{const I=indiv(o);if(!I||!I.top.length)return [false,'no result'];const k=I.top[0];
      return [I.min>0&&!k[1].split('+').includes('-z|C@'),`individuals fewest ${I.min}, at 120k ${I.end}; commonest ${k[0]}x ${k[1]}`];}},
  // a second cell whose seed site raises nobody (q: no root carries Q) is copied faster than the host's (its body never
  // carries a waiting head, which shares the host's blanks: 1.2-1.5x, runs/copyrate.js) and invades from 10 at 20k to a
  // balance with its hosts (no mutagen); passes a world where it holds at least half as many individuals as the host at 60k
  {id:'seed-cheat',cap:'A nursery is a crowd: a second cell that raises nobody invades its hosts and holds beside them',demo:'pair',seeds:[1,2,3,4],need:3,steps:60000,secs:120,env:{PAW:'1',PAF:'',PA2:'Z@&c@|- C@-z|',PAM:'0',PA3T:'20000',PAEN:'10',PA3:'Z@&c@|- C@-q|'},
    pass:(L,o)=>{const I=indiv(o);if(!I)return [false,'no result'];const n=p=>I.top.filter(([,k])=>k.split('+').includes(p)).reduce((a,[v])=>a+v,0),q=n('-q|C@'),z=n('-z|C@');
      return [q>=z/2,`at 60k ${q} cheats beside ${z} hosts`];}},
  {id:'seed-cheat-c',cap:'  control: a marked host (copy side glue w, nothing binds it) entered the same way does not spread',demo:'pair',seeds:[1],steps:60000,secs:120,env:{PAW:'1',PAF:'',PA2:'Z@&c@|- C@-z|',PAM:'0',PA3T:'20000',PAEN:'10',PA3:'Z@&c@|- C@wz|'},
    pass:(L,o)=>{const I=indiv(o);if(!I)return [false,'no result'];const n=p=>I.top.filter(([,k])=>k.split('+').includes(p)).reduce((a,[v])=>a+v,0),w=n('C@wz|'),z=n('-z|C@');
      return [w<z/5,`at 60k ${w} marked beside ${z} hosts`];}},
  // the seed site without its anchor is a template while no bud sits on it: the anchorless host replaces the anchored one
  {id:'seed-open',cap:'A seed site without its anchor is copied too: the anchorless host replaces the founder by 50k',demo:'pair',seeds:[1,2,3,4],need:3,steps:50000,secs:100,env:{PAW:'1',PAF:'',PA2:'Z@&c@|- C@-z|',PAM:'0',PA3T:'20000',PAEN:'10',PA3:'Z@&c@|- C@-z'},
    pass:(L,o)=>{const I=indiv(o);if(!I)return [false,'no result'];const n=p=>I.top.filter(([,k])=>k.split('+').includes(p)).reduce((a,[v])=>a+v,0),a=n('-zC@'),z=n('-z|C@');
      return [a>=9*z,`at 50k ${a} anchorless hosts beside ${z} anchored`];}},
  // run 20261008-0551 (build): the head-nursery founder (NEXT priority 22; IDEAS "In-place growth without a release is a
  // sink"). Heads 'Z@&c@|z' raise heads on their own z side (a copy binds its parent's z side at once); the second cell's
  // seed site carries the lysis mark. Without the mark (control) a one-letter mutant of the second cell, '-zZ@' (attach C
  // to Z), grows chains in place on the heads' z sides that never let go, and the world collapses
  {id:'nursery',cap:'The head nursery holds without stocks: heads raise heads on their own side, no head cheats',demo:'pair',seeds:[1,2,3,4],need:3,steps:60000,secs:150,env:{PAW:'1',PAF:'',PA2:'Z@&c@|z C@-z!'},
    pass:(L,o)=>{const I=indiv(o);if(!I||!I.top.length)return [false,'no result'];const h=I.top.filter(([,k])=>k.split('+').includes('Z@&c@|z')).reduce((a,[v])=>a+v,0);
      return [I.min>0&&I.end>=380&&h>=0.9*I.end,`individuals fewest ${I.min}, at 60k ${I.end}, ${h} with the nursery head; commonest ${I.top[0][0]}x ${I.top[0][1]}`];}},
  {id:'nursery-c',cap:'  control: without the lysis mark on the second cell, chains of -zZ@ grow on heads and the world collapses by 90k',demo:'pair',seeds:[1,2,3,4],need:3,steps:90000,secs:200,env:{PAW:'1',PAF:'',PA2:'Z@&c@|z C@-z'},
    pass:(L,o)=>{const I=indiv(o);if(!I)return [false,'no result'];const ch=/-zZ@\+-zZ@/.test(o);return [I.end<20&&ch,`at 90k ${I.end} individuals; chains of -zZ@ ${ch?'seen':'not seen'}`];}},
  // a head without the z side, entered as 10 individuals at 20k (no mutagen), sends all its copies to the pool, where host
  // heads' z sides are nearly always taken by their own copies: lost within 5k in 4 of 4 (D c (1-λ) about 0.2)
  {id:'nursery-cheat',cap:'In-place heredity keeps cheats out: heads that raise nobody, entered at 20k, are lost',demo:'pair',seeds:[1,2,3,4],need:3,steps:40000,secs:150,env:{PAW:'1',PAF:'',PAM:'0',PA2:'Z@&c@|z C@-z!',PA3T:'20000',PAEN:'10',PA3:'Z@&c@|- C@-z!'},
    pass:(L,o)=>{const I=indiv(o);if(!I)return [false,'no result'];const n=p=>I.top.filter(([,k])=>k.split('+').includes(p)).reduce((a,[v])=>a+v,0),x=n('-Z@&c@|'),h=n('Z@&c@|z');
      return [x<h/10&&h>=300,`at 40k ${x} cheat heads beside ${h} nursery heads`];}},
  // run 20261008-0651 (explore): copy error in contact copying (pErr, RULES Core changes; NEXT priority 24). In the head
  // nursery the free-part mutagen never varied a head (run 0551); with copy error instead (mutagen off) heads vary where
  // they are copied ('types:' lines: bonded triangles by type, the commonest 10): a head one side away from 'Z@&c@|z' at
  // 0.5% of heads or more at some census (1.2-1.9% by 60k in run 0651's 4 worlds), and the world holds
  ...(()=>{const {TOK,canon}=require('./sim'),sd=x=>[...x.matchAll(TOK)].map(m=>m[0]),H=canon('Z@&c@|z'),
    one=c=>{const A=sd(c),B=sd(H);return Math.min(...[0,1,2].map(r=>[0,1,2].filter(k=>A[k]!==B[(k+r)%3]).length))===1;};return [
  {id:'copy-error',cap:'Copy error varies a lineage born in place: head variants in the head nursery without a mutagen',demo:'pair',seeds:[1,2,3,4],need:3,steps:60000,secs:150,env:{PAW:'1',PAF:'',PAM:'0',PA2:'Z@&c@|z C@-z!',TRI_PARAMS:'{"pErr":0.01}'},
    pass:(L,o)=>{const I=indiv(o);if(!I)return [false,'no result'];let best=0,bt='-';for(const m of o.matchAll(/^types: t=\d+ .*? \| (.*)$/gm)){const ty=m[1].split(', ').map(x=>{const i=x.indexOf(' ');return [+x.slice(0,i),x.slice(i+1)];});
        const h=ty.filter(([,c])=>c===H||one(c)),n=h.reduce((a,[k])=>a+k,0);for(const [k,c] of h)if(c!==H&&k/n>best){best=k/n;bt=c;}}
      return [best>=0.005&&I.end>=380,`commonest head variant ${bt} at ${(100*best).toFixed(1)}% of heads; ${I.end} individuals at 60k`];}},
  ];})(),
  // run 20261008-0651 (explore): a cheat's seed site is a stepping stone for a new root letter (IDEAS "Variation where
  // copies are made"). No mutation. Founder world without stocks; 10 cheats 'C@-i|' (seed sites of a letter no root has,
  // on founder heads) at 10k spread; 10 I-hosts ('I@&c@|-' with 'C@-i|') at 50k find the cheats' free sites and hold
  // beside the Z roots (42-70% of individuals at 70k). Control: no cheats first: the I roots are lost by 60k (their i
  // cells spread as cheats instead)
  ...(()=>{const env={PAW:'1',PAF:'',PAM:'0',PA2:'Z@&c@|- C@-z|',PAEN:'10',PA1T:'50000',PAKR:'I@&c@|-',PAKS:'C@-i|'},
    share=o=>{const I=indiv(o);if(!I)return null;const n=I.top.filter(([,k])=>k.split('+').includes('-I@&c@|')).reduce((a,[v])=>a+v,0);return {n,end:I.end,f:I.end?n/I.end:0};};return [
  {id:'cheat-root',cap:'A common cheat site lets a new root letter in: I roots entered after i cheats hold beside the Z roots',demo:'pair',seeds:[1,2,3,4],need:3,steps:70000,secs:180,env:{...env,PA3T:'10000',PA3:'Z@&c@|- C@-i|'},
    pass:(L,o)=>{const r=share(o);if(!r)return [false,'no result'];return [r.f>=0.2,`at 70k ${r.n} of ${r.end} individuals with an I root`];}},
  {id:'cheat-root-c',cap:'  control: without cheats first, the I roots are lost',demo:'pair',seeds:[1,2,3,4],need:3,steps:70000,secs:180,env,
    pass:(L,o)=>{const r=share(o);if(!r)return [false,'no result'];return [r.f<0.05&&r.end>=300,`at 70k ${r.n} of ${r.end} individuals with an I root`];}},
  ];})(),
  // run 20261008-1021 (build): sites on the shared second cell are a commons (NEXT priority 23; IDEAS "A site on the
  // shared part is a commons"). No mutation. The head nursery with an i site on every second cell ('C@iz!': labelled
  // start, as after the site has drifted); 10 I heads that raise nobody on their own side ('I@&c@|z', a pool class) enter
  // at 20k, are born only on the second cells' i sites, keep their template side free and replace the nursery (all I by
  // 70k in 4 of 4). Control: the same heads without i sites are lost by 30k. The turn: 20 plain second cells ('C@-z!')
  // entered at 35k, while I spreads, are copied more than those whose i site holds a waiting head; they take the second
  // cells, I loses its sites and dies out, the nursery returns (4 of 4 by 80k)
  ...(()=>{const env={PAW:'1',PAF:'',PAM:'0',PA2:'Z@&c@|z C@iz!',PA1T:'20000',PAEN:'10',PAKR:'I@&c@|z',PAKS:'C@iz!'},
    has=(k,p)=>k.split('+').includes(p),
    census=o=>[...o.matchAll(/^kinds: t=(\d+) .*?individuals (\d+) kinds .*? \| (.*)$/gm)].map(m=>{const top=m[3].split(', ').map(w=>w.match(/^(\d+)x (.+)$/)).filter(Boolean).map(q=>[+q[1],q[2]]);
      const n=p=>top.filter(([,k])=>has(k,p)).reduce((a,[v])=>a+v,0);return {t:+m[1],all:+m[2],I:n('I@&c@|z'),Z:n('Z@&c@|z'),plain:n('-z!C@'),sealed:n('C@i.z!')};});return [
  {id:'commons',cap:'A site on the shared second cell is a commons: a head class born only there replaces the head nursery',demo:'pair',seeds:[1,2,3,4],need:3,steps:80000,secs:180,env,
    pass:(L,o)=>{const C=census(o);if(!C.length)return [false,'no result'];const e=C[C.length-1];return [e.all>=380&&e.I>=0.9*e.all,`at 80k ${e.I} of ${e.all} individuals with an I root`];}},
  {id:'commons-c',cap:'  control: without i sites on the second cells, the I heads are lost',demo:'pair',seeds:[1,2,3,4],need:3,steps:80000,secs:180,env:{...env,PA2:'Z@&c@|z C@-z!',PAKS:'C@-z!'},
    pass:(L,o)=>{const C=census(o);if(!C.length)return [false,'no result'];const e=C[C.length-1];return [e.I===0&&e.all>=380,`at 80k ${e.I} of ${e.all} individuals with an I root`];}},
  {id:'commons-turn',cap:'Second cells without the site turn the commons class back: plain second cells spread, I dies out, the nursery returns',demo:'pair',seeds:[1,2,3,4],need:3,steps:100000,secs:220,env:{...env,PAEN:'20',PA3T:'35000',PA3:'Z@&c@|z C@-z!'},
    pass:(L,o)=>{const C=census(o);if(!C.length)return [false,'no result'];const pk=C.reduce((a,c)=>c.all&&c.I/c.all>a.f?{f:c.I/c.all,t:c.t}:a,{f:0,t:0}),e=C[C.length-1];
      return [pk.f>=0.3&&e.I===0&&e.Z>=0.9*e.all&&e.plain>=0.8*e.all,`I peaked at ${(100*pk.f).toFixed(0)}% of individuals (${pk.t}); at 100k I ${e.I}, Z ${e.Z}, plain second cells ${e.plain} of ${e.all}`];}},
  // run 20261008-1650 (build): the sealed site (NEXT priority 30; IDEAS "The shared site seals itself"). The close-only
  // mark on the site ('C@i.z!': binds no free part, still copied) is the form copy error gives the escape from the
  // commons (a mark toggle, about 9 times an inert site's supply): the same I individuals are lost (control: commons),
  // and sealed second cells entered while I spreads take the second cells as plain ones do (commons-turn; without I
  // sealed and open cells are neutral, so the share drifts back afterwards: read at its peak)
  {id:'seal',cap:'A sealed site (close-only, still copied) is no commons: the same I heads are lost',demo:'pair',seeds:[1,2,3,4],need:3,steps:80000,secs:160,env:{...env,PA2:'Z@&c@|z C@i.z!',PAKS:'C@i.z!'},
    pass:(L,o)=>{const C=census(o);if(!C.length)return [false,'no result'];const e=C[C.length-1];return [e.I===0&&e.all>=380,`at 80k ${e.I} of ${e.all} individuals with an I root`];}},
  {id:'seal-turn',cap:'Sealed second cells turn the commons class back: they spread while I is common, I dies out, the nursery returns',demo:'pair',seeds:[1,2,3,4],need:3,steps:100000,secs:220,env:{...env,PAEN:'20',PA3T:'35000',PA3:'Z@&c@|z C@i.z!'},
    pass:(L,o)=>{const C=census(o);if(!C.length)return [false,'no result'];const pk=C.reduce((a,c)=>c.all&&c.I/c.all>a.f?{f:c.I/c.all,t:c.t}:a,{f:0,t:0}),e=C[C.length-1];
      const ps=Math.max(...C.filter(c=>c.t>=pk.t&&c.all).map(c=>c.sealed/c.all));
      return [pk.f>=0.3&&e.I===0&&e.Z>=0.9*e.all&&ps>=0.8,`I peaked at ${(100*pk.f).toFixed(0)}% of individuals (${pk.t}); sealed second cells then up to ${(100*ps).toFixed(0)}%; at 100k I ${e.I}, Z ${e.Z}, sealed ${e.sealed} of ${e.all}`];}},
  ];})(),
  // run 20261008-1351 (build): the race under copy error (NEXT priority 28; IDEAS "A common site is a target"). The
  // commons world with copy error at 0.005 and no hand-entered cheats: the commons class rises (22-100% of heads) and dies
  // out by 65-85k with no I nursery, the Z nursery returns, and the site letter common on second cells turns over (6 of
  // 8 by 240k), each turn after a parasite of that site (the commons class, an in-place chain such as 'I@iz!', a cell
  // that binds the site); in seed 5 a commons class of the new letter arises by one error ('q@&c@|z' on Q sites, 84% of
  // heads at 240k). Read from 'types:' lines: heads (an attach side with '&') by root letter, second cells (an attach
  // side of letter C) by the letter of the side after it
  ...(()=>{const {TOK}=require('./sim'),sd=x=>[...x.matchAll(TOK)].map(m=>m[0]),
    census=o=>[...o.matchAll(/^types: t=(\d+) .*? \| (.*)$/gm)].map(m=>{const r={t:+m[1],Z:0,I:0,H:0,S:0,se:0,L:{}};for(const x of m[2].split(', ')){const i=x.indexOf(' '),n=+x.slice(0,i),s=sd(x.slice(i+1));if(s.length!==3)continue;
      const h=s.find(y=>y.includes('@')&&y.includes('&'));if(h){r.H+=n;if(h[0]==='Z')r.Z+=n;if(h[0]==='I')r.I+=n;continue;}const c=s.findIndex(y=>y[0]==='C'&&y.includes('@'));if(c>=0){const L=s[(c+1)%3][0];r.L[L]=(r.L[L]||0)+n;r.S+=n;if(s[(c+1)%3].includes('.'))r.se+=n;}}return r;});return [
  {id:'race',cap:'Under copy error the commons loop runs by itself: the commons class rises and falls, the nursery returns, the common site letter turns over',demo:'pair',seeds:[1,2,3,4],need:3,steps:240000,secs:540,
    env:{PAW:'1',PAF:'',PAM:'0',PATN:'30',PA2:'Z@&c@|z C@iz!',PA1T:'20000',PAEN:'10',PAKR:'I@&c@|z',PAKS:'C@iz!',TRI_PARAMS:'{"pErr":0.005}'},
    pass:(L,o)=>{const C=census(o),I=indiv(o);if(!C.length||!I)return [false,'no result'];const e=C[C.length-1],f=c=>c.H?c.I/c.H:0,pk=C.reduce((a,c,j)=>f(c)>f(C[a])?j:a,0),
      back=C.slice(pk).find(c=>c.I===0&&c.Z>=0.9*c.H),turn=C.map(c=>Object.entries(c.L).find(([k,v])=>k!=='i'&&v>c.S/2)).find(Boolean);
      return [f(C[pk])>=0.15&&!!back&&e.I===0&&!!turn&&I.end>=380,`I peaked at ${(100*f(C[pk])).toFixed(0)}% of heads, gone with Z at 90% or more by ${back?back.t/1000+'k':'never'}; site letter turned: ${turn?turn[0]:'no'}; at 240k Z ${e.Z} of ${e.H} heads, ${I.end} individuals`];}},
  // run 20261008-1650 (build): the loop at length (NEXT priority 30; IDEAS "The shared site seals itself"). The same
  // world run longer: the site side takes the close-only mark (a sealed site binds no free part and is still copied),
  // during a parasite episode, and the loop of letters stops (no commons class after the seal in 4 worlds to 1.2M)
  {id:'seal-evolve',cap:'The shared site seals itself: the close-only mark takes most second cells under copy error',demo:'pair',seeds:[5,6,7,8],need:3,steps:400000,secs:900,
    env:{PAW:'1',PAF:'',PAM:'0',PATN:'30',PA2:'Z@&c@|z C@iz!',PA1T:'20000',PAEN:'10',PAKR:'I@&c@|z',PAKS:'C@iz!',TRI_PARAMS:'{"pErr":0.005}'},
    pass:(L,o)=>{const C=census(o),I=indiv(o);if(!C.length||!I)return [false,'no result'];const e=C[C.length-1],f=c=>c.S?c.se/c.S:0,h=C.find(c=>f(c)>0.5);
      return [f(e)>0.5&&I.end>=380,`sealed on more than half of second cells from ${h?h.t/1000+'k':'never'}; at the end ${e.se} of ${e.S} (${(100*f(e)).toFixed(0)}%), non-Z heads ${e.H-e.Z}, ${I.end} individuals`];}},
  ];})(),
  // run 20261008-1522 (explore): the plug guard (NEXT priority 29; IDEAS "A trap on the shared part"; RULES candidate
  // (w)). No head design guards its own side; the guard the core gives is a trap on the shared part: a lysing site of
  // the root's complement ('z!' on the second cell) lyses every free part with attach letter Z, plugs included. A trap
  // that catches a part without '&' dies with it (the lysis comes back across the bond), so in a plug epidemic the trap
  // carriers die; with lysOneWay (candidate (w), a lysis side passes no lysis back) the trap survives its catch. Read
  // from 'types:' lines (pErr 1e-9 prints them; no copy error happens): heads (a side with '&'), second cells (attach
  // letter C) and the share of them with a 'z!' side (the trap), plugs (attach letter Z, no '&')
  ...(()=>{const {TOK}=require('./sim'),census=o=>[...o.matchAll(/^types: t=(\d+) .*? \| (.*)$/gm)].map(m=>{const r={t:+m[1],h:0,sc:0,tr:0,pl:0};
      for(const x of m[2].split(', ')){const i=x.indexOf(' '),n=+x.slice(0,i),sd=[...x.slice(i+1).matchAll(TOK)].map(y=>[y[1],y[2]]),att=sd.filter(y=>y[1].includes('@')).map(y=>y[0]);
        if(sd.some(y=>y[1].includes('&')))r.h+=n;else if(att.includes('C')){r.sc+=n;if(sd.some(y=>y[0]==='z'&&y[1].includes('!')))r.tr+=n;}else if(att.includes('Z'))r.pl+=n;}return r;}),
    env={PAW:'1',PAF:'',PAM:'0',PATN:'20',PA2:'Z@&c@|z C@-z!',TRI_PARAMS:'{"pErr":1e-9}',PA3T:'20000',PAEN:'20',PA3:'--Z@'},
    mix={...env,PA1T:'100',PAEN:'1',PAKR:'Z@&c@|z',PAKS:'C@-q!',PA3N:'200'},last=o=>{const C=census(o);return C.length?C[C.length-1]:null;};return [
  {id:'trap',cap:'A trap on the shared part guards the head nursery: 20 plugs --Z@ entered at 20k are lost',demo:'pair',seeds:[1,2,3,4],need:3,steps:80000,secs:200,env,
    pass:(L,o)=>{const C=census(o),e=last(o);if(!e)return [false,'no result'];const pk=Math.max(...C.map(c=>c.pl));return [e.pl===0&&e.h>=400,`plugs at most ${pk}, at 80k ${e.pl} plugs, ${e.h} heads`];}},
  {id:'trap-c',cap:'  control: second cells without the trap (C@-q!): the plugs sink the nursery',demo:'pair',seeds:[1,2,3,4],need:3,steps:60000,secs:150,env:{...env,PA2:'Z@&c@|z C@-q!'},
    pass:(L,o)=>{const C=census(o),e=last(o);if(!e)return [false,'no result'];const d=C.find(c=>c.t>20000&&c.h===0);return [e.h===0,`no head from ${d?d.t/1000+'k':'never'}`];}},
  {id:'trap-oneway',cap:'With lysOneWay the trap survives what it lyses: 200 plugs into trap and trapless second cells, the trap takes every second cell and the world holds',demo:'pair',seeds:[1,2,3,4],need:3,steps:60000,secs:400,
    env:{...mix,TRI_PARAMS:'{"pErr":1e-9,"lysOneWay":1}'},
    pass:(L,o)=>{const e=last(o);if(!e)return [false,'no result'];return [e.h>=150&&e.sc&&e.tr/e.sc>=0.9,`at 60k ${e.h} heads, trap on ${e.tr} of ${e.sc} second cells, ${e.pl} plugs`];}},
  {id:'trap-oneway-c',cap:'  control: the current core, the trap dies with its catch and the world with it',demo:'pair',seeds:[1,2,3,4],need:3,steps:60000,secs:130,env:mix,
    pass:(L,o)=>{const C=census(o),e=last(o);if(!e)return [false,'no result'];const d=C.find(c=>c.t>20000&&c.h===0);return [e.h===0,`no head from ${d?d.t/1000+'k':'never'}`];}},
  ];})(),
  // run 20261006-1322 (explore): heredity of combinations by locality. A parasite S (seed site q, no anchor: copied at two
  // sides, never buds) put into 1 in 10 S at 20k (labelled start) in the flow world without mutagen. A newborn's S comes
  // from its own parent with share s ('par:' lines); the parasite (k = 2 copy sources) can spread only if (1 - s) k > 1, to a share
  // near ((1 - s) k - 1) / (k - 1). Free parts decaying every 10 steps at hazard 0.3: s about 0.58, the parasite dies out;
  // every 100 steps: s about 0.25, it holds near half the bodies; the first world stirred (PAMX, labelled): s about 0.22,
  // it spreads and the hosts crash
  ...(()=>{const env={PAB:'1000',PAS:'50',PAHT:'1000',PAH:'0.3',PAD:'1',PAHU:'1',PAHB:'2',PAP:'2000',PAV:'mix',PAVP:'0.1',PAVK:'parasite',PAVT:'20000'},
    res=o=>o.match(/parental: births=\d+ R=(\S+) S=(\S+) .*alive=(\d+) .*copiesParasite=(\d+)(?: parasite ([0-9.]+))?/),
    peak=o=>Math.max(0,...[...o.matchAll(/^par: t=(\d+) .* parasite ([0-9.]+)/gm)].filter(m=>+m[1]>20000).map(m=>+m[2]));return [
  {id:'pair-host',cap:'Selection sees bodies when parts are made near their use: a parasite S that never buds dies out where a newborn\'s S comes from its parent more than half the time',demo:'pair',seeds:[1,2,3,4],need:3,steps:40000,secs:90,env:{...env,PADI:'10'},
    pass:(L,o)=>{const m=res(o);if(!m)return [false,'no result'];return [+m[2]>=0.5&&+m[3]>0&&+(m[5]||0)===0,`S from parent ${m[2]}, ${m[3]} bodies, parasite ${m[5]||0} at 40k (peak ${peak(o)})`];}},
  {id:'pair-host-c',cap:'  control: at a lower parental share (slower decay) the parasite holds a large share',demo:'pair',seeds:[1,2,3,4],need:3,steps:40000,secs:85,env,
    pass:(L,o)=>{const m=res(o);if(!m)return [false,'no result'];return [+m[2]<0.5&&+(m[5]||0)>=0.2,`S from parent ${m[2]}, ${m[3]} bodies, parasite ${m[5]||0} at 40k`];}},
  {id:'pair-host-mx',cap:'  control: the first world stirred (labelled drive) loses its locality and the parasite spreads',demo:'pair',seeds:[1,2,3,4],need:3,steps:30000,secs:65,env:{...env,PADI:'10',PAMX:'0.2'},
    pass:(L,o)=>{const m=res(o);if(!m)return [false,'no result'];const p=peak(o);return [+m[2]<0.5&&p>=0.3,`S from parent ${m[2]}, parasite peak ${p}, ${m[3]} bodies at 30k`];}},
  ];})(),
  // run 20261004-2051 (explore): the lysis side '!' (RULES Core changes). A parent with a complete bud stuck on its seed
  // site (no food), 4 cutters 'z@!-|-|' (labelled), the anchor on cell 44 (openRange 50): the stuck bud comes apart into
  // its 47 parts and a later bud on the seed site is built from at least 40 of them
  {id:'lysis',cap:'Lysis: a stuck bud taken apart into its parts by a cutter at its waiting anchor; a new bud on the parent grows from them',demo:'lysis',seeds:[1,2,3,4],need:3,steps:1000000,secs:120,
    pass:(L,o)=>{const m=o.match(/result: lysedFirst=(\S+) .*max=(\d+) .*reused=(\d+) cuts=(\d+)/);return [!!m&&m[1]!=='not'&&+m[3]>=40,m?`apart at ${m[1]}, a later bud of ${m[2]} cells, ${m[3]} of them the stuck bud's parts, ${m[4]} cuts`:'no result'];}},
  // The frozen lineage's two checks are regression checks while the lineage is frozen (INNOVATIONS keeps the 3-of-4
  // records): 2 seeds since run 20261007-0050 (harden), seed 3 alone since run 20261008-0250 (harden; suite time): on
  // main d76ac35 seed 3 reaches generation 3 first in both (735900, 736900) and is the one world where cutters lyse a
  // bud (seed 2: none); seeds 1-4 by command (INNOVATIONS run 0250)
  // run 20261004-1021 (build): three generations on a slow supply (labelled environment drive: 400 inert pre-food turning
  // into copy blanks, the untyped building blocks, at 0.0003 per 100 steps; world 36) and a monomer loop (labelled: free genome monomers turn back into blanks, 0.002 per
  // 100 steps; without it 0 of 4, run 1021); the bud grows off its parent's corner
  // (closed walls, no harness). Replaces budcycle-free (two generations, 180 pre-food at 0.001, world 32; runs 0621-0751).
  {id:'budcycle-3',cap:'Three generations from the kit on a slow supply: a bud of the bud\'s bud complete, let go and holding a caught strand',demo:'budcycle',seeds:[3],steps:1200000,secs:1970,env:{BCAFTER:'900000',BCGEN:'3'},
    pass:(L,o)=>{const m=o.match(/result: .*split=(\S+) .*gen2=(\S+) gen3=(\S+) ownCopies=(\S+) stray=(\d+)/);return [!!m&&m[3]!=='not'&&+m[5]===0,m?`first split ${m[1]}, generation 2 at ${m[2]}, 3 at ${m[3]}, own copies after let-go (generation:copies) ${m[4]}, ${m[5]} stray`:'no result'];}},
  // run 20261004-2221 (build): lysis in the lineage. budcycle-3's setup with a lysis receptor 'Г@&' on each body's last
  // cell E (budKit receptor; kit only, no core change), openRange 50 and 2 cutters 'г@!-|-|' (labelled): the receptor
  // binds only while E hears its waiting anchor, so cutters take apart complete buds waiting for a catch and nothing
  // else. Passes a world that reaches generation 3 with every lysed bud complete (47 cells) and no stray part
  {id:'budcycle-lysis',cap:'Lysis in the lineage: cutters at a receptor on the last cell take apart only complete buds waiting for a catch; three generations',demo:'budcycle',seeds:[3],steps:1200000,secs:1910,env:{BCAFTER:'900000',BCGEN:'3',BCQ:'1',BCR:'50',BCC:'2'},
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

// --part k/n: the k-th of n shares of the selection, whole checks balanced by secs x seeds (a suite longer than a
// background job's 2-hour limit runs as parts, one after another); --cmd: print each selected check's demo command
// (env, seeds) instead of running it
const q=v=>/^[\w.,:\/=+-]*$/.test(v)?v:`'${v.replace(/'/g,"'\\''")}'`;
async function main(){const argv=process.argv.slice(2),pi=argv.indexOf('--part'),part=pi>=0?argv[pi+1].split('/').map(Number):null,cmd=argv.includes('--cmd');
  const want=argv.filter((a,i)=>!a.startsWith('--')&&!(pi>=0&&i===pi+1));let sel=CHECKS.filter(c=>!want.length||want.includes(c.id));
  if(want.length&&sel.length!==want.length)throw Error('unknown check; one of '+CHECKS.map(c=>c.id).join(' '));
  if(part){const [k,n]=part,load=new Array(n).fill(0),bin=new Map();
    for(const c of [...sel].sort((a,b)=>b.secs*b.seeds.length-a.secs*a.seeds.length)){const i=load.indexOf(Math.min(...load));bin.set(c,i);load[i]+=c.secs*c.seeds.length;}
    sel=sel.filter(c=>bin.get(c)===k-1);}
  if(cmd){for(const c of sel)console.log(`# ${c.id} (seeds ${c.seeds.join(' ')}): ${c.cap.trim()}\n${Object.entries(c.env||{}).map(([k,v])=>`${k}=${q(v)} `).join('')}node tri/demos.js ${c.demo} ${c.seeds[0]} ${c.steps} runs/x${c.extra?' '+q(c.extra):''}`);return;}
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
