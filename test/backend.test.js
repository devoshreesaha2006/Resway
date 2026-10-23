import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';

const port=Number(process.env.RESWAY_TEST_PORT||4179),base=`http://127.0.0.1:${port}`,dbPath=join(tmpdir(),`resway-${randomUUID()}.sqlite3`);
let server;
async function start(){server=spawn(process.execPath,['server.mjs'],{cwd:process.cwd(),env:{...process.env,PORT:String(port),RESWAY_DB:dbPath},stdio:'ignore'});for(let i=0;i<100;i++){try{const r=await fetch(base+'/api/health');if(r.ok)return}catch{}await delay(100)}throw new Error('RESWAY server did not start')}
async function stop(){if(!server)return;server.kill();await Promise.race([new Promise(resolve=>server.once('exit',resolve)),delay(3000)]);server=null;}
async function request(path,{method='GET',body,cookie}={}){const headers={};if(body!==undefined)headers['content-type']='application/json';if(cookie)headers.cookie=cookie;const response=await fetch(base+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});return {status:response.status,body:await response.json().catch(()=>null),cookie:response.headers.getSetCookie?.()[0]?.split(';')[0]};}
async function login(role){const r=await request('/api/auth/login',{method:'POST',body:{demo:true,role}});assert.equal(r.status,200);return r.cookie;}

test('RESWAY full-stack API, role security, scenarios, and durable SQLite state',async t=>{
 await start();t.after(async()=>{await stop();});
 const home=await fetch(base+'/');assert.equal(home.status,200);assert.match(await home.text(),/RESWAY/);
 assert.equal((await request('/api/state')).status,401);
 const operator=await login('OPERATOR');assert.equal((await request('/api/auth/me',{cookie:operator})).body.user.role,'OPERATOR');
 let state=(await request('/api/state',{cookie:operator})).body;assert.equal(state.batches.length,4);assert.equal(state.riders.length,6);
 let ranked=await request('/api/assignments',{method:'POST',cookie:operator,body:{batchId:'NX-2048'}});assert.equal(ranked.status,200);assert.ok(ranked.body.candidates.some(x=>x.eligible));assert.ok(ranked.body.candidates.some(x=>!x.eligible));
 const donor=await login('DONOR');assert.equal((await request('/api/batches',{cookie:donor})).body.length,1);assert.equal((await request('/api/batches/NX-2047',{cookie:donor})).status,403);
 const rider=await login('RIDER');assert.equal((await request('/api/simulation/start',{method:'POST',cookie:rider})).status,403);
 const created=await request('/api/auth/signup',{method:'POST',body:{name:'New donor',email:`donor-${randomUUID()}@example.test`,password:'test-password-123',role:'DONOR'}});assert.equal(created.status,201);
 const split=await request('/api/batches/NX-2045/split',{method:'POST',cookie:operator,body:{allocations:[{shelterId:'S-01',quantity:20},{shelterId:'S-04',quantity:20}]}});assert.equal(split.status,201);assert.equal(split.body.allocations.reduce((n,b)=>n+b.quantity,0),64);assert.deepEqual(split.body.allocations.map(b=>b.quantity),[20,20,24]);
 for(const [type,check] of [['demand-up',s=>s.shelters[0].demand['Fresh produce']===135],['demand-down',s=>s.shelters[0].demand['Fresh produce']===65],['delay',s=>s.assignments.find(a=>a.batchId==='NX-2048').eta===49],['expiry',s=>s.assignments.find(a=>a.batchId==='NX-2048').status==='At risk'],['incompatibility',s=>!s.shelters[0].resources.includes('Cold storage')],['capacity',s=>s.assignments.length===5]]){await request('/api/simulation/reset',{method:'POST',cookie:operator});const result=await request('/api/simulation/scenario',{method:'POST',cookie:operator,body:{type}});assert.equal(result.status,200,`${type} response`);assert.ok(check(result.body.state),`${type} changes operational records`);}
 await request('/api/simulation/reset',{method:'POST',cookie:operator});let broken=await request('/api/simulation/scenario',{method:'POST',cookie:operator,body:{type:'breakdown'}});assert.equal(broken.body.state.batches.find(b=>b.id==='NX-2048').status,'At risk');
 state=broken.body.state;for(const r of state.riders)r.status='Unavailable';await request('/api/state',{method:'PUT',cookie:operator,body:state});ranked=await request('/api/assignments',{method:'POST',cookie:operator,body:{batchId:'NX-2048'}});assert.ok(ranked.body.candidates.every(x=>!x.eligible));
 const reset=await request('/api/simulation/reset',{method:'POST',cookie:operator});assert.equal(reset.status,200);assert.equal((await request('/api/auth/me',{cookie:operator})).status,200);
 const speed=await request('/api/simulation/state',{method:'PATCH',cookie:operator,body:{speed:4}});assert.equal(speed.body.speed,4);
 await stop();await start();state=(await request('/api/state',{cookie:operator})).body;assert.equal(state.simulation.speed,4,'state survives a server restart');
 const resetAgain=await request('/api/simulation/reset',{method:'POST',cookie:operator});assert.equal(resetAgain.status,200);assert.equal(resetAgain.body.speed,1);
});
