import {api} from './client.js';
export const listShelters=()=>api('/shelters');export const getShelter=id=>api(`/shelters/${id}`);export const updateDemand=(id,demand)=>api(`/shelters/${id}/demand`,{method:'PATCH',body:JSON.stringify(demand)});export const receiveDelivery=(id,assignmentId)=>api(`/shelters/${id}/receive`,{method:'POST',body:JSON.stringify({assignmentId})});
