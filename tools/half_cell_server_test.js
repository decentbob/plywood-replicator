#!/usr/bin/env node
'use strict';
const assert=require('assert/strict'),fs=require('fs'),{createServer}=require('./half_cell_server');
const {hash}=require('../experiments/half_cell_rim_test');
async function main(){
  const file=process.argv[2];assert(file&&!fs.existsSync(file),'Unique output required');
  const result={command:process.argv.slice(1),sources:Object.fromEntries(['tools/half_cell_server.js','tools/half_cell_server_test.js',
    'half-cell.html','experiments/half_cell_live.js'].map(p=>[p,hash(p)])),complete:false,physicsSteps:0,checks:[]};
  const server=createServer();
  try{
    await new Promise((ok,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',ok);});
    const url='http://127.0.0.1:'+server.address().port;
    const request=async(path,body,origin=url)=>{const response=await fetch(url+path,body===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)});return {status:response.status,value:await response.json()};};
    const html=await(await fetch(url)).text();assert(html.includes('<canvas'));assert(html.includes('Ordinary chain binding'));result.checks.push('serves live viewer');
    const reset=await request('/api/reset',{start:'paired',motion:'body',seed:787});assert.equal(reset.value.summary.copyingContacts,4);
    const first=await request('/api/step',{steps:1});result.physicsSteps++;assert.equal(first.value.t,1);assert.equal(first.value.summary.unpairedClosed,2);result.checks.push('ordinary release through step endpoint');
    const saved=(await request('/api/save')).value;
    const branch=await request('/api/step',{steps:10});result.physicsSteps+=10;
    const load=await request('/api/load',saved);assert.equal(load.value.t,1);
    const replay=await request('/api/step',{steps:10});result.physicsSteps+=10;
    assert.deepEqual(branch.value,replay.value);result.checks.push('save/load reproduces live state');
    for(const [route,body,origin,code]of [['/api/step',{steps:101},url,400],['/api/step',{steps:1},'http://example.invalid',403],
      ['/api/load',{format:'wrong'},url,400],['/api/reset',{seed:0},url,400]])assert.equal((await request(route,body,origin)).status,code);
    assert.equal((await request('/api/state')).value.t,11);result.checks.push('invalid requests preserve world');
    const reset2=await request('/api/reset',{start:'bath',motion:'individual',seed:797});assert.equal(reset2.value.t,0);assert.equal(reset2.value.summary.closedCount,1);assert.equal(reset2.value.summary.rimBonds,9);result.checks.push('bath and motion controls');
    result.complete=true;
  }catch(e){result.error={message:e.message,stack:e.stack};process.exitCode=1;}
  finally{await new Promise(ok=>server.close(ok));}
  const c=process.cpuUsage();result.cpuSeconds=(c.user+c.system)/1e6;
  fs.writeFileSync(file,JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
