'use strict';
// A batch of demo worlds, at most 4 processes at once (cleanup run 20261007-1051: runs kept rewriting shell queues, and
// glue strings with '&' and '|' broke under eval). Jobs come from a JSON file, never through a shell:
//   node tri/batch.js jobs.json [outdir]        (outdir: runs/<the file's name>)
//   {"demo":"pair","steps":240000,"env":{"PAW":"1"},
//    "jobs":[{"id":"x1","seeds":[1,2,3,4]},{"id":"y3","seeds":[1,2],"steps":120000,"env":{"PAHU":"3"}}]}
// A job's demo, steps, extra and env default to the file's (env merged); 'seeds' gives one world per seed (id + seed).
// Each world writes its output to outdir/<id>.txt and its pictures to outdir/<id>/ (pictures have fixed names);
// TRI_NOPIC=1 turns pictures off. A line per world as it finishes (its last 't=' line), and 'batch done' at the end.
const {spawn}=require('child_process'),fs=require('fs'),path=require('path');
const [file,dirArg]=process.argv.slice(2);if(!file)throw Error('usage: node tri/batch.js jobs.json [outdir]');
const B=JSON.parse(fs.readFileSync(file,'utf8')),dir=dirArg||path.join('runs',path.basename(file,'.json'));
const worlds=B.jobs.flatMap(j=>(j.seeds||[j.seed||1]).map(seed=>({...j,id:j.seeds?j.id+seed:j.id,seed,demo:j.demo||B.demo,steps:j.steps||B.steps,extra:j.extra||B.extra,env:{...(B.env||{}),...(j.env||{})}})));
fs.mkdirSync(dir,{recursive:true});const t0=Date.now();let next=0;
const run=w=>new Promise(res=>{const out=path.join(dir,w.id),args=[path.join(__dirname,'demos.js'),w.demo,String(w.seed),String(w.steps||0),out];if(w.extra)args.push(String(w.extra));
  fs.mkdirSync(out,{recursive:true});const log=fs.openSync(out+'.txt','w'),p=spawn(process.execPath,args,{env:{...process.env,...w.env},stdio:['ignore',log,log]});
  p.on('close',code=>{fs.closeSync(log);const L=fs.readFileSync(out+'.txt','utf8').split('\n').filter(l=>l.startsWith('t='));
    console.log(`${w.id} ${code?'exit '+code:'done'} ${((Date.now()-t0)/1000).toFixed(0)} s: ${(L[L.length-1]||'').slice(0,300)}`);res();});});
const worker=async()=>{while(next<worlds.length)await run(worlds[next++]);};
Promise.all([1,2,3,4].slice(0,+(process.env.BATCH_JOBS||4)).map(worker)).then(()=>console.log(`batch done: ${worlds.length} worlds in ${dir}, ${((Date.now()-t0)/1000).toFixed(0)} s`));
