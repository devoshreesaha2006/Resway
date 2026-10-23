import { db, DEMO_PASSWORD } from './index.js';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
const state={batches:[
{id:'NX-2048',name:'Fresh produce',quantity:84,unit:'crates',donor:'Greenfield Market',destination:'Northside Shelter',status:'In transit',time:'34 min',safetyWindowMinutes:34,requirements:['Cold storage'],color:'lime',pickup:'Greenfield Market',pickupLat:40.721,pickupLng:-73.995},
{id:'NX-2047',name:'Prepared meals',quantity:120,unit:'meals',donor:'Common Table Kitchen',destination:'Harbor House',status:'In transit',time:'28 min',requirements:['Food safe'],color:'blue',pickup:'Common Table Kitchen'},
{id:'NX-2046',name:'Medical kits',quantity:36,unit:'kits',donor:'City Health Hub',destination:'East Ward Clinic',status:'Received',time:'Delivered',requirements:['Dry storage'],color:'purple',pickup:'City Health Hub'},
{id:'NX-2045',name:'Drinking water',quantity:64,unit:'cases',donor:'Clearwater Co-op',destination:'Riverside Center',status:'Available',time:'1 hr',requirements:['No special handling'],color:'orange',pickup:'Clearwater Co-op'}
],riders:[
{id:'R-01',name:'Maya Chen',capacity:96,load:0,equipment:['Cold storage','Food safe','Dry storage'],status:'Available',lastCheckIn:'09:37',lat:40.731,lng:-73.978,vehicle:'Cargo bike'},
{id:'R-02',name:'Sam Rivera',capacity:120,load:0,equipment:['Cold storage','Food safe'],status:'Available',lastCheckIn:'09:39',lat:40.713,lng:-73.982,vehicle:'Van'},
{id:'R-03',name:'Taylor Brooks',capacity:40,load:0,equipment:['Cold storage'],status:'Available',lastCheckIn:'09:33',lat:40.737,lng:-73.989,vehicle:'Cargo bike'},
{id:'R-04',name:'Ari Patel',capacity:110,load:120,equipment:['Cold storage','Food safe','Dry storage'],status:'On delivery',lastCheckIn:'09:35',lat:40.705,lng:-73.962,vehicle:'Van'},
{id:'R-05',name:'Jordan Lee',capacity:90,load:84,equipment:['Cold storage'],status:'On delivery',lastCheckIn:'09:04',lat:40.724,lng:-73.988,vehicle:'Cargo bike'},
{id:'R-06',name:'Morgan Ellis',capacity:72,load:0,equipment:['Food safe','Dry storage'],status:'Available',lastCheckIn:'09:38',lat:40.744,lng:-73.970,vehicle:'Bike'}
],shelters:[
{id:'S-01',name:'Northside Shelter',area:'North District',lat:40.752,lng:-73.977,demand:{'Fresh produce':100,'Prepared meals':140,'Drinking water':80},capacity:180,resources:['Cold storage','Food safe','Dry storage'],contact:'Receiving desk'},
{id:'S-02',name:'Harbor House',area:'Harbor District',lat:40.706,lng:-74.012,demand:{'Fresh produce':65,'Prepared meals':90,'Drinking water':110},capacity:150,resources:['Cold storage','Food safe'],contact:'Receiving desk'},
{id:'S-03',name:'East Ward Clinic',area:'East District',lat:40.728,lng:-73.951,demand:{'Medical kits':50,'Drinking water':45},capacity:90,resources:['Dry storage','Cold storage'],contact:'Clinic coordinator'},
{id:'S-04',name:'Riverside Center',area:'Riverside District',lat:40.739,lng:-73.999,demand:{'Fresh produce':70,'Drinking water':120},capacity:160,resources:['Cold storage','Dry storage'],contact:'Receiving desk'}
],assignments:[
{id:'AS-2048',batchId:'NX-2048',riderId:'R-05',shelterId:'S-01',quantity:84,status:'In Transit',eta:34,progress:0},
{id:'AS-2047',batchId:'NX-2047',riderId:'R-04',shelterId:'S-02',quantity:120,status:'In transit',eta:28,progress:0},
{id:'AS-2046',batchId:'NX-2046',riderId:'R-01',shelterId:'S-03',quantity:36,status:'Received',eta:0,progress:1}
],incidents:[],events:[{id:'EV-SEED-1',time:'09:41',title:'Batch NX-2048 picked up',detail:'Jordan Lee · Greenfield Market to Northside Shelter · 34 min simulated ETA',type:'neutral'}],simulation:{running:false,speed:1,hasRun:false},incident:false,recovered:false,escalated:false,rescueNoSafe:false};
const tx=db.transaction(()=>{
 db.exec('DELETE FROM sessions; DELETE FROM audit_events; DELETE FROM deliveries; DELETE FROM assignments; DELETE FROM incidents; DELETE FROM batch_items; DELETE FROM batches; DELETE FROM shelter_inventory; DELETE FROM shelter_demands; DELETE FROM riders; DELETE FROM shelters; DELETE FROM simulation_state; DELETE FROM users;');
 const pw=bcrypt.hashSync(DEMO_PASSWORD,10);
 for(const [role,email,name] of [['DONOR','donor@resway.demo','Greenfield Market'],['RIDER','rider@resway.demo','Jordan Lee'],['SHELTER','shelter@resway.demo','Northside Shelter'],['OPERATOR','operator@resway.demo','Alex Morgan']])db.prepare('INSERT INTO users(id,name,email,password_hash,role) VALUES(?,?,?,?,?)').run(randomUUID(),name,email,pw,role);
 db.prepare('INSERT INTO shelters(id,name,payload) VALUES(?,?,?)').run('S-01','Northside Shelter',JSON.stringify(state.shelters[0]));
 const sh=db.prepare('INSERT INTO shelters(id,name,payload) VALUES(?,?,?)');for(const s of state.shelters.slice(1))sh.run(s.id,s.name,JSON.stringify(s));
 const demand=db.prepare('INSERT INTO shelter_demands(shelter_id,item_name,quantity) VALUES(?,?,?)');for(const s of state.shelters)for(const [name,q] of Object.entries(s.demand))demand.run(s.id,name,q);
 const rider=db.prepare('INSERT INTO riders(id,name,status,capacity,payload) VALUES(?,?,?,?,?)');for(const r of state.riders)rider.run(r.id,r.name,r.status,r.capacity,JSON.stringify(r));
 const batch=db.prepare('INSERT INTO batches(id,name,quantity,unit,donor,destination,status,time,payload) VALUES(?,?,?,?,?,?,?,?,?)');for(const b of state.batches)batch.run(b.id,b.name,b.quantity,b.unit,b.donor,b.destination,b.status,b.time,JSON.stringify(b));
 const item=db.prepare('INSERT INTO batch_items(batch_id,item_name,quantity,unit) VALUES(?,?,?,?)');for(const b of state.batches)item.run(b.id,b.name,b.quantity,b.unit);
 const ass=db.prepare('INSERT INTO assignments(id,batch_id,rider_id,shelter_id,quantity,status,eta,progress,payload) VALUES(?,?,?,?,?,?,?,?,?)');for(const a of state.assignments){ass.run(a.id,a.batchId,a.riderId,a.shelterId,a.quantity,a.status,a.eta,a.progress||0,JSON.stringify(a));db.prepare('INSERT INTO deliveries(id,assignment_id,status,payload) VALUES(?,?,?,?)').run('DL-'+a.id,a.id,a.status,JSON.stringify(a))}
 db.prepare('INSERT INTO simulation_state(id,state_json) VALUES(1,?)').run(JSON.stringify(state));
});
if(process.argv.includes('--reset')||!db.prepare('SELECT 1 FROM users LIMIT 1').get())tx();
console.log(`RESWAY database seeded. Demo password: ${DEMO_PASSWORD}`);
