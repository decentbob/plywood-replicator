'use strict';
const assert=require('assert/strict');
const {rankAndSelect,persistentMembers}=require('./random_57');
const row=(sig,total,composition,persistent=true)=>({sig,total,composition,persistentMembers:persistent?[[1,2,3]]:[]});
assert.equal(rankAndSelect([row('a',10,'0,0,1'),row('b',20,'0,1,1')]).pair,null);
assert.equal(rankAndSelect([row('a',10,'0,0,1'),row('b',20,'0,0,1',false)]).pair,null);
assert.equal(rankAndSelect([row('a',10,'0,0,1'),row('a',20,'0,0,1')]).pair,null);
assert.deepEqual(rankAndSelect([row('b',10,'0,0,1'),row('a',10,'0,0,1'),row('c',99,'0,1,1')]).pair.map(x=>x.sig),['a','b']);
const episodes=[{sig:'a',members:[1,2,3],start:29900,end:null},
  {sig:'a',members:[4,5,6],start:29901,end:null},{sig:'a',members:[7,8,9],start:29900,end:29990}];
assert.deepEqual(persistentMembers(episodes,'a',29900,30000),[[1,2,3]]);
assert.deepEqual(persistentMembers(episodes,'a',29900,29999),[]);
assert.deepEqual(persistentMembers(episodes,'b',29900,30000),[]);
console.log('PASS: absent/distinct composition, exact identity, persistence interruption, 99/100-step boundary and fixed ranking');
