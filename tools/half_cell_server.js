#!/usr/bin/env node
'use strict';
// One opt-in, loopback-only world. No stepping occurs except on a step request.
const http=require('http'),fs=require('fs'),path=require('path');
const live=require('../experiments/half_cell_live');
function createServer(){
  let world=live.createWorld();
  return http.createServer(async(req,res)=>{
    const send=(status,value,type='application/json')=>{res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(type==='application/json'?JSON.stringify(value):value);};
    try{
      if(req.method==='GET'&&req.url==='/')return send(200,fs.readFileSync(path.join(__dirname,'../half-cell.html')),'text/html; charset=utf-8');
      if(req.method==='GET'&&req.url==='/api/state')return send(200,live.snapshot(world,true));
      if(req.method==='GET'&&req.url==='/api/save')return send(200,live.save(world));
      if(req.method!=='POST'||!['/api/step','/api/reset','/api/load'].includes(req.url))return send(404,{error:'Not found'});
      const address=serverAddress(req);
      if(req.headers.origin&&req.headers.origin!==address)return send(403,{error:'Use the local half-cell page'});
      if(!String(req.headers['content-type']).startsWith('application/json'))return send(415,{error:'JSON required'});
      let body='';for await(const chunk of req){body+=chunk;if(body.length>2*1024*1024)return send(413,{error:'Save is too large'});}
      const data=JSON.parse(body||'{}');
      if(req.url==='/api/step'){
        if(!Number.isInteger(data.steps)||data.steps<1||data.steps>100)throw Error('Choose 1 to 100 steps');
        for(let i=0;i<data.steps;i++)world.s.step();
      }else if(req.url==='/api/reset')world=live.createWorld(data);
      else world=live.restore(data);
      return send(200,live.snapshot(world,true));
    }catch(e){send(400,{error:e.message.slice(0,240)});}
  });
}
function serverAddress(req){return 'http://127.0.0.1:'+req.socket.localPort;}
if(require.main===module){
  const port=Number(process.argv[2]||8787);
  if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Port must be 1024–65535');
  const server=createServer();server.on('error',e=>{console.error(e.message);process.exitCode=1;});
  server.listen(port,'127.0.0.1',()=>console.log('Half-cell lab: http://127.0.0.1:'+port+' (paused; Ctrl+C to stop)'));
}
module.exports={createServer};
