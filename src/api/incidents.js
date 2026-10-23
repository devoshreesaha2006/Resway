import {api} from './client.js';
export const listIncidents=()=>api('/incidents');export const createIncident=body=>api('/incidents',{method:'POST',body:JSON.stringify(body)});export const resolveIncident=(id,status)=>api(`/incidents/${id}/resolve`,{method:'POST',body:JSON.stringify({status})});
