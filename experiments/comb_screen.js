#!/usr/bin/env node
'use strict';
// Comb screen (comb_plan.md): PBBQ versus PAAQ founders competing in one soup.  all STEM | job STEM SEED | summary STEM
const {spawn}=require('child_process'),W=require('./seeded_worlds'),kit=require('./screen_kit');
const SEEDS=[1401,1402,1403,1404,1405,1406],STEPS=50000,FOUNDERS=['PBBQ','PAAQ'];
const LOOSE={A:12,B:12,P:8,Q:8,D:40,J:40};
function job(stem,seed){
  const w=W.createWorld({seed,size:22,founder:FOUNDERS,loose:LOOSE}),initial=w.s.saveState(),samples=[];
  const founderKeys=new Set(w.founders.map(c=>c.join(',')));
  const watch=s=>{if(s.t%1000)return;const c=W.census(s);
    samples.push({t:s.t,rim:s.rimEvents,freeStruct:c.freeStruct,chains:c.chains.map(x=>({seq:x.seq,founder:founderKeys.has(x.units.join(',')),paired:x.paired,struct:x.struct}))});};
  const t0=kit.cpu(),r=kit.run(initial,STEPS,watch,{check:seed===SEEDS[0],Cls:w.Cls});
  const last=samples.at(-1),copies=seq=>last.chains.filter(x=>!x.founder&&x.seq===seq);
  const out={job:{seed,steps:STEPS,founders:FOUNDERS,loose:LOOSE},founders:w.founders,initial,samples,finalState:r.final,tape:r.tape,checked:r.checked,cpuSeconds:kit.cpu()-t0,
    final:{PBBQ:copies('PBBQ').length,PAAQ:copies('PAAQ').length,other:last.chains.filter(x=>!x.founder&&!FOUNDERS.includes(x.seq)).map(x=>x.seq),
      pbbqArms:copies('PBBQ').map(x=>x.struct),founderArms:last.chains.filter(x=>x.founder).map(x=>x.seq+':'+x.struct),freeStruct:last.freeStruct}};
  kit.write(`${stem}_${seed}.json.gz`,out);console.log(JSON.stringify({seed,...out.final,cpu:Math.round(out.cpuSeconds)}));
}
function all(stem){let next=0,n=0;const go=()=>{while(n<4&&next<SEEDS.length){const sd=SEEDS[next++];n++;
  spawn(process.execPath,[__filename,'job',stem,String(sd)],{stdio:['ignore','inherit','inherit']}).on('exit',c=>{n--;if(c)console.error('FAILED',sd);go();});}};go();}
function summary(stem){
  const rows=SEEDS.map(seed=>({seed,...kit.read(`${stem}_${seed}.json.gz`).final}));
  const pbbqWins=rows.filter(r=>r.PBBQ>r.PAAQ).length,paaqWins=rows.filter(r=>r.PAAQ>r.PBBQ).length;
  const armed=rows.flatMap(r=>r.pbbqArms).filter(a=>a[1]>0&&a[2]>0).length,total=rows.reduce((n,r)=>n+r.PBBQ,0);
  const out={rows,pbbqWins,paaqWins,ties:rows.length-pbbqWins-paaqWins,pbbqCopiesWithBothArms:armed,pbbqCopies:total};
  kit.write(stem+'.summary.json',out);console.log(JSON.stringify(out));
}
const [mode,stem,a]=process.argv.slice(2);
if(mode==='all')all(stem);else if(mode==='job')job(stem,Number(a));else if(mode==='summary')summary(stem);else throw Error('mode');
