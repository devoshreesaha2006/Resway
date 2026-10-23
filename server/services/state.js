import { db } from '../db/index.js';
export function readState(){const row=db.prepare('SELECT state_json FROM simulation_state WHERE id=1').get();return row?JSON.parse(row.state_json):null;}
function replaceRows(table,rows,sql,values){db.prepare(`DELETE FROM ${table}`).run();const stmt=db.prepare(sql);for(const x of rows)stmt.run(...values(x));}
export function writeState(state){
 if(!state||!Array.isArray(state.batches)||!Array.isArray(state.riders)||!Array.isArray(state.shelters)||!Array.isArray(state.assignments))throw Object.assign(new Error('Invalid operational state'),{status:422});
 const tx=db.transaction(()=>{
  replaceRows('shelters',state.shelters,'INSERT INTO shelters(id,name,payload) VALUES(?,?,?)',s=>[s.id,s.name,JSON.stringify(s)]);
  replaceRows('shelter_demands',state.shelters.flatMap(s=>Object.entries(s.demand||{}).map(([name,quantity])=>({shelterId:s.id,name,quantity}))), 'INSERT INTO shelter_demands(shelter_id,item_name,quantity) VALUES(?,?,?)',x=>[x.shelterId,x.name,Math.max(0,Number(x.quantity)||0)]);
  replaceRows('riders',state.riders,'INSERT INTO riders(id,name,status,capacity,payload) VALUES(?,?,?,?,?)',r=>[r.id,r.name,r.status,Math.max(0,Number(r.capacity)||0),JSON.stringify(r)]);
  replaceRows('batches',state.batches,'INSERT INTO batches(id,name,quantity,unit,donor,destination,status,time,payload) VALUES(?,?,?,?,?,?,?,?,?)',b=>[b.id,b.name,Math.max(0,Number(b.quantity)||0),b.unit,b.donor,b.destination,b.status,b.time,JSON.stringify(b)]);
  replaceRows('batch_items',state.batches,'INSERT INTO batch_items(batch_id,item_name,quantity,unit) VALUES(?,?,?,?)',b=>[b.id,b.name,Math.max(0,Number(b.quantity)||0),b.unit]);
  replaceRows('assignments',state.assignments,'INSERT INTO assignments(id,batch_id,rider_id,shelter_id,quantity,status,eta,progress,payload) VALUES(?,?,?,?,?,?,?,?,?)',a=>[a.id,a.batchId,a.riderId,a.shelterId,Math.max(0,Number(a.quantity)||0),a.status,Math.max(0,Number(a.eta)||0),Number(a.progress)||0,JSON.stringify(a)]);
  replaceRows('deliveries',state.assignments,'INSERT INTO deliveries(id,assignment_id,status,payload) VALUES(?,?,?,?)',a=>['DL-'+a.id,a.id,a.status,JSON.stringify(a)]);
  replaceRows('incidents',state.incidents||[],'INSERT INTO incidents(id,type,batch_id,status,time,payload) VALUES(?,?,?,?,?,?)',i=>[i.id,i.type,i.batchId,i.status,i.time,JSON.stringify(i)]);
  replaceRows('shelter_inventory',[],'INSERT INTO shelter_inventory(shelter_id,item_name,quantity,unit) VALUES(?,?,?,?)',()=>[]);
  const audit=db.prepare('INSERT INTO audit_events(time,title,detail,type,payload) VALUES(?,?,?,?,?)');
  const old=db.prepare('SELECT COUNT(*) n FROM audit_events').get().n;
  for(const e of (state.events||[]).slice(0,Math.max(0,(state.events||[]).length-old)))audit.run(e.time||new Date().toISOString(),e.title,e.detail,e.type||'neutral',JSON.stringify(e));
  db.prepare('INSERT INTO simulation_state(id,state_json,updated_at) VALUES(1,?,CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET state_json=excluded.state_json,updated_at=CURRENT_TIMESTAMP').run(JSON.stringify(state));
 });tx();return state;
}
